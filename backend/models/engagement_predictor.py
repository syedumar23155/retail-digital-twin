"""
Retail Digital Twin — Module 3 Version 2
Engagement Prediction Pipeline

Target: is_buyer (binary)
Features: Leakage-free, derived only from view + addtocart events
Architecture: Multi-model comparison with proper imbalance handling,
              threshold optimization, and explainability
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import warnings
warnings.filterwarnings('ignore')

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, confusion_matrix,
    roc_curve, precision_recall_curve, average_precision_score
)
from sklearn.utils.class_weight import compute_class_weight
import xgboost as xgb


class EngagementPredictorV2:
    """
    Version 2 — Leakage-free engagement prediction pipeline.
    Predicts is_buyer using only pre-purchase behavioral signals.
    """

    TARGET_COLUMN = 'is_buyer'

    def __init__(self):
        self.models = {}
        self.results = {}
        self.scaler = StandardScaler()
        self.X_train = self.X_val = self.X_test = None
        self.y_train = self.y_val = self.y_test = None
        self.twins_df = None
        self.feature_names = None
        self.best_model_name = None
        self.best_threshold = 0.5

    # ── Stage 1: Feature Construction ────────────────────────

    def build_clean_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Construct leakage-free features.
        Rule: ONLY use total_views and total_addtocarts.
        Zero use of transaction/purchase data.
        """
        print("Building leakage-free features...")

        feat = pd.DataFrame()
        feat['visitorid'] = df['visitorid']

        # Raw behavioral counts (clean)
        feat['total_views'] = df['total_views']
        feat['total_addtocarts'] = df['total_addtocarts']

        # Derived behavioral features (all clean)
        feat['view_to_cart_rate'] = np.where(
            df['total_views'] > 0,
            (df['total_addtocarts'] / df['total_views'] * 100).round(2),
            0.0
        )

        feat['cart_rate_flag'] = (df['total_addtocarts'] > 0).astype(int)

        feat['engagement_score_clean'] = (
            df['total_views'] * 1 +
            df['total_addtocarts'] * 3
        )

        feat['total_events_clean'] = (
            df['total_views'] + df['total_addtocarts']
        )

        feat['activity_ratio'] = (
            df['total_addtocarts'] / (df['total_views'] + 1)
        ).round(4)

        feat['engagement_percentile_clean'] = (
            feat['engagement_score_clean'].rank(pct=True) * 100
        ).round(1)

        feat['is_buyer'] = df['is_buyer'].astype(int)

        print(f"  Features built: {feat.shape[1] - 2} predictors")
        print(f"  All derived from: total_views + total_addtocarts only")

        self.feature_names = [
            'total_views', 'total_addtocarts', 'view_to_cart_rate',
            'cart_rate_flag', 'engagement_score_clean',
            'total_events_clean', 'activity_ratio',
            'engagement_percentile_clean'
        ]

        return feat

    # ── Stage 2: Baseline ─────────────────────────────────────

    def evaluate_baseline(self, y_test):
        """
        Simple heuristic baseline:
        If customer ever added to cart → predict buyer.
        Every ML model must beat this.
        """
        X_test_feat = self.X_test.copy()
        baseline_pred = (X_test_feat['cart_rate_flag'] == 1).astype(int)

        print("\n=== HEURISTIC BASELINE ===")
        print("Rule: if addtocart > 0 → predict buyer")
        print(f"  Precision: {precision_score(y_test, baseline_pred, zero_division=0):.4f}")
        print(f"  Recall:    {recall_score(y_test, baseline_pred, zero_division=0):.4f}")
        print(f"  F1 Score:  {f1_score(y_test, baseline_pred, zero_division=0):.4f}")

        baseline_f1 = f1_score(y_test, baseline_pred, zero_division=0)
        return baseline_f1

    # ── Stage 3: Data Split ───────────────────────────────────

    def prepare_data(self, feat_df: pd.DataFrame):
        """
        Three-way stratified split: 70% train / 15% val / 15% test.
        Stratified to preserve 0.84% buyer ratio in all splits.
        """
        X = feat_df[self.feature_names]
        y = feat_df['is_buyer']

        print(f"\nDataset: {len(X):,} customers")
        print(f"Buyers: {y.sum():,} ({y.mean()*100:.2f}%)")
        print(f"Class weight ratio: 1:{int((y==0).sum()/(y==1).sum())}")

        # First split: 70% train, 30% temp
        X_train, X_temp, y_train, y_temp = train_test_split(
            X, y, test_size=0.30, random_state=42, stratify=y
        )

        # Second split: 50/50 of temp = 15% val, 15% test
        X_val, X_test, y_val, y_test = train_test_split(
            X_temp, y_temp, test_size=0.50, random_state=42, stratify=y_temp
        )

        self.X_train = X_train
        self.X_val = X_val
        self.X_test = X_test
        self.y_train = y_train
        self.y_val = y_val
        self.y_test = y_test

        # Scale for logistic regression
        self.X_train_scaled = self.scaler.fit_transform(X_train)
        self.X_val_scaled = self.scaler.transform(X_val)
        self.X_test_scaled = self.scaler.transform(X_test)

        print(f"\nTrain: {len(X_train):,} | Val: {len(X_val):,} | Test: {len(X_test):,}")
        print(f"Train buyers: {y_train.sum():,}")
        print(f"Val buyers:   {y_val.sum():,}")
        print(f"Test buyers:  {y_test.sum():,}")

    # ── Stage 4: Model Training ───────────────────────────────

    def train_all_models(self):
        """Train all models with class imbalance handling."""

        classes = np.array([0, 1])
        weights = compute_class_weight('balanced', classes=classes, y=self.y_train)
        class_weights = {0: weights[0], 1: weights[1]}
        scale_pos_weight = (self.y_train == 0).sum() / (self.y_train == 1).sum()

        print(f"\nClass weights: Non-buyer={class_weights[0]:.2f}, Buyer={class_weights[1]:.2f}")

        print("\nTraining Logistic Regression...")
        lr = LogisticRegression(
            class_weight='balanced', max_iter=1000, random_state=42
        )
        lr.fit(self.X_train_scaled, self.y_train)
        self.models['Logistic Regression'] = ('scaled', lr)
        print("  ✓ Done")

        print("Training Random Forest...")
        rf = RandomForestClassifier(
            n_estimators=200, class_weight='balanced',
            random_state=42, n_jobs=-1, max_depth=10
        )
        rf.fit(self.X_train, self.y_train)
        self.models['Random Forest'] = ('raw', rf)
        print("  ✓ Done")

        print("Training XGBoost...")
        xgb_model = xgb.XGBClassifier(
            n_estimators=200, scale_pos_weight=scale_pos_weight,
            random_state=42, eval_metric='logloss',
            verbosity=0, max_depth=6, learning_rate=0.05
        )
        xgb_model.fit(self.X_train, self.y_train)
        self.models['XGBoost'] = ('raw', xgb_model)
        print("  ✓ Done")

        print("Training Gradient Boosting...")
        gb = GradientBoostingClassifier(
            n_estimators=200, random_state=42,
            max_depth=5, learning_rate=0.05
        )
        gb.fit(self.X_train, self.y_train)
        self.models['Gradient Boosting'] = ('raw', gb)
        print("  ✓ Done")

        print(f"\n✅ All {len(self.models)} models trained")

    # ── Stage 5: Threshold Optimization ──────────────────────

    def optimize_threshold(self, model_name: str) -> float:
        """
        Find optimal decision threshold on VALIDATION set.
        Maximizes F1 score — balances precision and recall.
        Never touches test set during optimization.
        """
        input_type, model = self.models[model_name]
        X_val = self.X_val_scaled if input_type == 'scaled' else self.X_val
        y_prob = model.predict_proba(X_val)[:, 1]

        thresholds = np.arange(0.01, 0.99, 0.01)
        best_f1 = 0
        best_thresh = 0.5

        for t in thresholds:
            y_pred = (y_prob >= t).astype(int)
            f1 = f1_score(self.y_val, y_pred, zero_division=0)
            if f1 > best_f1:
                best_f1 = f1
                best_thresh = t

        print(f"\nOptimal threshold for {model_name}: {best_thresh:.2f} (F1={best_f1:.4f})")
        return best_thresh

    # ── Stage 6: Full Evaluation ──────────────────────────────

    def evaluate_all_models(self, use_optimized_threshold=True):
        """Comprehensive evaluation on held-out test set."""

        print("\n" + "=" * 60)
        print("MODEL EVALUATION — TEST SET (never seen during training)")
        print("=" * 60)

        results = {}

        for name, (input_type, model) in self.models.items():
            X_test = self.X_test_scaled if input_type == 'scaled' else self.X_test
            y_prob = model.predict_proba(X_test)[:, 1]

            # Get optimized threshold from validation set
            if use_optimized_threshold:
                threshold = self.optimize_threshold(name)
            else:
                threshold = 0.5

            y_pred = (y_prob >= threshold).astype(int)

            metrics = {
                'Accuracy':   round(accuracy_score(self.y_test, y_pred), 4),
                'Precision':  round(precision_score(self.y_test, y_pred, zero_division=0), 4),
                'Recall':     round(recall_score(self.y_test, y_pred, zero_division=0), 4),
                'F1 Score':   round(f1_score(self.y_test, y_pred, zero_division=0), 4),
                'ROC-AUC':    round(roc_auc_score(self.y_test, y_prob), 4),
                'Avg Precision': round(average_precision_score(self.y_test, y_prob), 4),
                'Threshold':  threshold
            }

            results[name] = metrics

            print(f"\n{name}")
            print("-" * 45)
            for metric, value in metrics.items():
                print(f"  {metric:<18}: {value}")

        self.results = results

        # Identify best model by ROC-AUC
        self.best_model_name = max(results, key=lambda x: results[x]['ROC-AUC'])
        print(f"\n🏆 Best Model: {self.best_model_name}")
        print(f"   ROC-AUC: {results[self.best_model_name]['ROC-AUC']}")
        self.best_threshold = results[self.best_model_name]['Threshold']

        return results

    # ── Stage 7: K-Fold Stability Check ──────────────────────

    def cross_validate_best_model(self):
        """
        5-Fold Stratified CV on best model.
        Shows metric stability — answers 'are these results consistent?'
        """
        print(f"\n=== 5-FOLD CROSS VALIDATION — {self.best_model_name} ===")

        input_type, model = self.models[self.best_model_name]
        X = self.X_train_scaled if input_type == 'scaled' else self.X_train

        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        auc_scores = cross_val_score(model, X, self.y_train,
                                     cv=cv, scoring='roc_auc', n_jobs=-1)

        print(f"  AUC per fold: {[round(s,4) for s in auc_scores]}")
        print(f"  Mean AUC:     {auc_scores.mean():.4f}")
        print(f"  Std Dev:      {auc_scores.std():.4f}")
        print(f"  (Low std dev = stable model)")

    # ── Stage 8: Plots ────────────────────────────────────────

    def plot_roc_and_pr_curves(self, save_path='research/roc_pr_curves_v2.png'):
        """ROC + Precision-Recall curves side by side."""

        fig, axes = plt.subplots(1, 2, figsize=(16, 6))
        colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12']

        for (name, (input_type, model)), color in zip(self.models.items(), colors):
            X_test = self.X_test_scaled if input_type == 'scaled' else self.X_test
            y_prob = model.predict_proba(X_test)[:, 1]

            # ROC
            fpr, tpr, _ = roc_curve(self.y_test, y_prob)
            auc = roc_auc_score(self.y_test, y_prob)
            axes[0].plot(fpr, tpr, color=color, lw=2,
                        label=f'{name} (AUC={auc:.4f})')

            # PR Curve
            prec, rec, _ = precision_recall_curve(self.y_test, y_prob)
            ap = average_precision_score(self.y_test, y_prob)
            axes[1].plot(rec, prec, color=color, lw=2,
                        label=f'{name} (AP={ap:.4f})')

        axes[0].plot([0,1],[0,1],'k--', label='Random')
        axes[0].set_title('ROC Curves', fontsize=13)
        axes[0].set_xlabel('False Positive Rate')
        axes[0].set_ylabel('True Positive Rate')
        axes[0].legend()

        baseline_rate = self.y_test.mean()
        axes[1].axhline(y=baseline_rate, color='k', linestyle='--',
                       label=f'Random ({baseline_rate:.3f})')
        axes[1].set_title('Precision-Recall Curves', fontsize=13)
        axes[1].set_xlabel('Recall')
        axes[1].set_ylabel('Precision')
        axes[1].legend()

        plt.suptitle('Module 3 V2 — Model Evaluation', fontsize=14)
        plt.tight_layout()
        plt.savefig(save_path)
        plt.show()
        print(f"Saved: {save_path}")

    def plot_confusion_matrices(self, save_path='research/confusion_matrices_v2.png'):
        """Confusion matrices for all models."""

        fig, axes = plt.subplots(2, 2, figsize=(14, 10))
        axes = axes.flatten()

        for i, (name, (input_type, model)) in enumerate(self.models.items()):
            X_test = self.X_test_scaled if input_type == 'scaled' else self.X_test
            y_prob = model.predict_proba(X_test)[:, 1]
            threshold = self.results[name]['Threshold']
            y_pred = (y_prob >= threshold).astype(int)

            cm = confusion_matrix(self.y_test, y_pred)
            sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=axes[i],
                       xticklabels=['Non-Buyer','Buyer'],
                       yticklabels=['Non-Buyer','Buyer'])
            axes[i].set_title(f'{name}\nAUC={self.results[name]["ROC-AUC"]}')
            axes[i].set_ylabel('Actual')
            axes[i].set_xlabel('Predicted')

        plt.suptitle('Confusion Matrices V2 — Leakage-Free', fontsize=14)
        plt.tight_layout()
        plt.savefig(save_path)
        plt.show()

    def plot_feature_importance(self, save_path='research/feature_importance_v2.png'):
        """Feature importance from tree-based models."""

        fig, axes = plt.subplots(1, 2, figsize=(16, 6))

        for ax, model_name in zip(axes, ['Random Forest', 'XGBoost']):
            _, model = self.models[model_name]
            importance = model.feature_importances_
            feat_imp = pd.Series(
                importance, index=self.feature_names
            ).sort_values(ascending=True)

            feat_imp.plot(kind='barh', ax=ax, color='#2ecc71')
            ax.set_title(f'Feature Importance — {model_name}')
            ax.set_xlabel('Importance Score')

        plt.suptitle('Which Behavioral Signals Predict Purchase? (Leakage-Free)', fontsize=13)
        plt.tight_layout()
        plt.savefig(save_path)
        plt.show()

    # ── Stage 9: Score Full Dataset ───────────────────────────

    def score_full_dataset(self, full_df: pd.DataFrame,
                           save_path: str) -> pd.DataFrame:
        """Apply best model to all 1.4M customers."""

        input_type, model = self.models[self.best_model_name]
        X_full = full_df[self.feature_names].fillna(0)

        if input_type == 'scaled':
            X_input = self.scaler.transform(X_full)
        else:
            X_input = X_full

        full_df['predicted_buyer'] = (
            model.predict_proba(X_input)[:, 1] >= self.best_threshold
        ).astype(int)
        full_df['buy_probability'] = (
            model.predict_proba(X_input)[:, 1]
        ).round(4)

        full_df.to_csv(save_path, index=False)
        print(f"Saved: {save_path}")
        print(f"Predicted buyers: {full_df['predicted_buyer'].sum():,}")
        print(f"Avg buy probability: {full_df['buy_probability'].mean():.4f}")

        return full_df

    def get_comparison_table(self):
        df = pd.DataFrame(self.results).T
        return df.sort_values('ROC-AUC', ascending=False)