"""
Retail Digital Twin — Module 3
Engagement Prediction Pipeline

Predicts: is_buyer (will this customer make a purchase?)
Architecture: Multi-model comparison with proper evaluation
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
    classification_report, roc_curve
)
from sklearn.utils.class_weight import compute_class_weight
import xgboost as xgb


class EngagementPredictor:
    """
    Multi-model engagement prediction pipeline.
    Predicts whether a customer will make a purchase (is_buyer).
    Designed for class-imbalanced retail behavioral data.
    """

    # Features we use for prediction
    # CRITICAL: We exclude is_buyer, is_high_value, clv_tier, roi_potential
    # because they are derived FROM purchase behavior — data leakage
    FEATURE_COLUMNS = [
        'total_views',
        'total_addtocarts',
        'total_events',
        'engagement_score',
        'view_to_cart_rate',
        'cart_to_purchase_rate',
        'view_to_purchase_rate',
        'engagement_percentile',
        'purchase_percentile',
        'purchase_intent_score',
    ]

    TARGET_COLUMN = 'is_buyer'

    def __init__(self):
        self.models = {}
        self.results = {}
        self.scaler = StandardScaler()
        self.X_train = self.X_test = self.y_train = self.y_test = None
        self.feature_names = self.FEATURE_COLUMNS
        self.twins_df = None

    # ── Data Loading & Validation ─────────────────────────────

    def load_data(self, path: str) -> pd.DataFrame:
        """Load Digital Twin profiles and validate."""
        df = pd.read_csv(path)
        print(f"Loaded {len(df):,} Digital Twin profiles")
        print(f"Buyers:     {df['is_buyer'].sum():,}")
        print(f"Non-Buyers: {(~df['is_buyer']).sum():,}")
        print(f"Imbalance ratio: 1:{int((~df['is_buyer']).sum() / df['is_buyer'].sum())}")
        self.twins_df = df
        return df

    # ── Feature Preparation ───────────────────────────────────

    def prepare_features(self, df: pd.DataFrame):
        """
        Select features, handle missing values, split data.
        Data leakage prevention: we only use behavioral features
        that would be available BEFORE a purchase decision.
        """
        print("\n--- Feature Preparation ---")

        # Check all feature columns exist
        missing = [c for c in self.FEATURE_COLUMNS if c not in df.columns]
        if missing:
            raise ValueError(f"Missing columns: {missing}")

        X = df[self.FEATURE_COLUMNS].copy()
        y = df[self.TARGET_COLUMN].astype(int).copy()

        # Handle any nulls
        X = X.fillna(0)

        print(f"Feature matrix shape: {X.shape}")
        print(f"Target distribution:\n{y.value_counts()}")

        # Stratified split — preserves class ratio in train/test
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            X, y,
            test_size=0.2,
            random_state=42,
            stratify=y      # Critical for imbalanced data
        )

        # Scale features (important for Logistic Regression)
        self.X_train_scaled = self.scaler.fit_transform(self.X_train)
        self.X_test_scaled = self.scaler.transform(self.X_test)

        print(f"\nTrain set: {len(self.X_train):,} samples")
        print(f"Test set:  {len(self.X_test):,} samples")
        print(f"Train buyers: {self.y_train.sum():,}")
        print(f"Test buyers:  {self.y_test.sum():,}")

        return self.X_train, self.X_test, self.y_train, self.y_test

    # ── Class Imbalance Handling ──────────────────────────────

    def _get_class_weights(self):
        """
        Compute balanced class weights.
        Penalizes model more for missing buyers (minority class).
        This is better than oversampling for this scale of data.
        """
        classes = np.array([0, 1])
        weights = compute_class_weight(
            class_weight='balanced',
            classes=classes,
            y=self.y_train
        )
        return {0: weights[0], 1: weights[1]}

    # ── Model Training ────────────────────────────────────────

    def train_all_models(self):
        """Train all 4 models with proper imbalance handling."""

        class_weights = self._get_class_weights()
        print(f"\nClass weights: {class_weights}")
        print("(Higher weight on class 1 = buyers get more attention)\n")

        # --- Model 1: Logistic Regression ---
        print("Training Logistic Regression...")
        lr = LogisticRegression(
            class_weight='balanced',
            max_iter=1000,
            random_state=42,
            C=1.0
        )
        lr.fit(self.X_train_scaled, self.y_train)
        self.models['Logistic Regression'] = ('scaled', lr)
        print("  ✓ Done")

        # --- Model 2: Random Forest ---
        print("Training Random Forest...")
        rf = RandomForestClassifier(
            n_estimators=100,
            class_weight='balanced',
            random_state=42,
            n_jobs=-1,
            max_depth=10
        )
        rf.fit(self.X_train, self.y_train)
        self.models['Random Forest'] = ('raw', rf)
        print("  ✓ Done")

        # --- Model 3: XGBoost ---
        print("Training XGBoost...")
        scale_pos_weight = (self.y_train == 0).sum() / (self.y_train == 1).sum()
        xgb_model = xgb.XGBClassifier(
            n_estimators=100,
            scale_pos_weight=scale_pos_weight,
            random_state=42,
            eval_metric='logloss',
            verbosity=0,
            max_depth=6,
            learning_rate=0.1
        )
        xgb_model.fit(self.X_train, self.y_train)
        self.models['XGBoost'] = ('raw', xgb_model)
        print("  ✓ Done")

        # --- Model 4: Gradient Boosting ---
        print("Training Gradient Boosting...")
        gb = GradientBoostingClassifier(
            n_estimators=100,
            random_state=42,
            max_depth=5,
            learning_rate=0.1
        )
        gb.fit(self.X_train, self.y_train)
        self.models['Gradient Boosting'] = ('raw', gb)
        print("  ✓ Done")

        print(f"\n✅ All {len(self.models)} models trained")

    # ── Evaluation ────────────────────────────────────────────

    def evaluate_all_models(self):
        """
        Evaluate all models with comprehensive metrics.
        PRIMARY METRIC: ROC-AUC (handles imbalance well)
        BUSINESS METRIC: Recall (we want to catch ALL potential buyers)
        """
        print("\n" + "=" * 60)
        print("MODEL EVALUATION RESULTS")
        print("=" * 60)

        results = {}

        for name, (input_type, model) in self.models.items():
            X_test = self.X_test_scaled if input_type == 'scaled' else self.X_test

            y_pred = model.predict(X_test)
            y_prob = model.predict_proba(X_test)[:, 1]

            metrics = {
                'Accuracy':  round(accuracy_score(self.y_test, y_pred), 4),
                'Precision': round(precision_score(self.y_test, y_pred, zero_division=0), 4),
                'Recall':    round(recall_score(self.y_test, y_pred, zero_division=0), 4),
                'F1 Score':  round(f1_score(self.y_test, y_pred, zero_division=0), 4),
                'ROC-AUC':   round(roc_auc_score(self.y_test, y_prob), 4),
            }

            results[name] = metrics

            print(f"\n{name}")
            print("-" * 40)
            for metric, value in metrics.items():
                print(f"  {metric:<12}: {value}")

        self.results = results
        return results

    # ── Confusion Matrices ────────────────────────────────────

    def plot_confusion_matrices(self, save_path='research/confusion_matrices.png'):
        """Visual confusion matrix for all models."""

        fig, axes = plt.subplots(2, 2, figsize=(14, 10))
        axes = axes.flatten()

        for i, (name, (input_type, model)) in enumerate(self.models.items()):
            X_test = self.X_test_scaled if input_type == 'scaled' else self.X_test
            y_pred = model.predict(X_test)
            cm = confusion_matrix(self.y_test, y_pred)

            sns.heatmap(
                cm, annot=True, fmt='d', cmap='Blues',
                ax=axes[i],
                xticklabels=['Non-Buyer', 'Buyer'],
                yticklabels=['Non-Buyer', 'Buyer']
            )
            axes[i].set_title(f'{name}', fontsize=12)
            axes[i].set_ylabel('Actual')
            axes[i].set_xlabel('Predicted')

        plt.suptitle('Confusion Matrices — All Models', fontsize=14)
        plt.tight_layout()
        plt.savefig(save_path)
        plt.show()
        print(f"Saved to {save_path}")

    # ── ROC Curves ───────────────────────────────────────────

    def plot_roc_curves(self, save_path='research/roc_curves.png'):
        """ROC curves for all models on one plot."""

        plt.figure(figsize=(10, 7))

        colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12']

        for (name, (input_type, model)), color in zip(self.models.items(), colors):
            X_test = self.X_test_scaled if input_type == 'scaled' else self.X_test
            y_prob = model.predict_proba(X_test)[:, 1]
            fpr, tpr, _ = roc_curve(self.y_test, y_prob)
            auc = roc_auc_score(self.y_test, y_prob)
            plt.plot(fpr, tpr, color=color, lw=2, label=f'{name} (AUC = {auc:.4f})')

        plt.plot([0, 1], [0, 1], 'k--', lw=1, label='Random Classifier')
        plt.xlabel('False Positive Rate')
        plt.ylabel('True Positive Rate (Recall)')
        plt.title('ROC Curves — Model Comparison', fontsize=14)
        plt.legend(loc='lower right')
        plt.tight_layout()
        plt.savefig(save_path)
        plt.show()
        print(f"Saved to {save_path}")

    # ── Feature Importance ────────────────────────────────────

    def plot_feature_importance(self, save_path='research/feature_importance.png'):
        """
        Feature importance from Random Forest and XGBoost.
        Shows which behavioral signals actually drive purchases.
        """
        fig, axes = plt.subplots(1, 2, figsize=(16, 6))

        for ax, model_name in zip(axes, ['Random Forest', 'XGBoost']):
            _, model = self.models[model_name]
            importance = model.feature_importances_
            feat_imp = pd.Series(importance, index=self.feature_names).sort_values(ascending=True)

            feat_imp.plot(kind='barh', ax=ax, color='#3498db')
            ax.set_title(f'Feature Importance — {model_name}', fontsize=12)
            ax.set_xlabel('Importance Score')

        plt.suptitle('Which Features Predict Purchase Behavior?', fontsize=14)
        plt.tight_layout()
        plt.savefig(save_path)
        plt.show()
        print(f"Saved to {save_path}")

    # ── Model Comparison Table ────────────────────────────────

    def get_comparison_table(self) -> pd.DataFrame:
        """Clean comparison table ranked by ROC-AUC."""
        df = pd.DataFrame(self.results).T
        df = df.sort_values('ROC-AUC', ascending=False)
        return df

    # ── Predict on Full Dataset ───────────────────────────────

    def predict_full_dataset(self, best_model_name: str) -> pd.DataFrame:
        """
        Apply best model to ALL 1.4M customers.
        Adds predicted_buyer and buy_probability to twin profiles.
        """
        _, model = self.models[best_model_name]
        input_type = self.models[best_model_name][0]

        full_X = self.twins_df[self.FEATURE_COLUMNS].fillna(0)

        if input_type == 'scaled':
            full_X_input = self.scaler.transform(full_X)
        else:
            full_X_input = full_X

        self.twins_df['predicted_buyer'] = model.predict(full_X_input)
        self.twins_df['buy_probability'] = model.predict_proba(full_X_input)[:, 1].round(4)

        return self.twins_df