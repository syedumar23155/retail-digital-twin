"""
Retail Digital Twin — Save Module 3 V2 XGBoost model.

This trains the same leakage-free XGBoost configuration used by
EngagementPredictorV2, optimizes the decision threshold on the
validation set, and saves the trained model for API inference.

Run from project root:

    python -m backend.models.save_xgb_model
"""

from pathlib import Path
import pickle

import numpy as np
import xgboost as xgb
from sklearn.metrics import f1_score
from sklearn.model_selection import train_test_split

from backend.utils.data_loader import load_twins
from backend.models.engagement_predictor import EngagementPredictorV2


ROOT = Path(__file__).resolve().parents[2]
MODEL_DIR = ROOT / "datasets" / "processed"
MODEL_PATH = MODEL_DIR / "xgb_v2_model.pkl"


def main():
    print("=" * 70)
    print("RETAIL DIGITAL TWIN — XGBOOST V2 MODEL EXPORT")
    print("=" * 70)

    # ---------------------------------------------------------
    # Load the existing Digital Twin dataset
    # ---------------------------------------------------------
    twins = load_twins()

    print(f"Customers loaded: {len(twins):,}")

    # ---------------------------------------------------------
    # Reuse the project's exact leakage-free feature builder
    # ---------------------------------------------------------
    predictor = EngagementPredictorV2()

    features = predictor.build_clean_features(twins)

    feature_names = predictor.feature_names

    X = features[feature_names].copy()
    y = features["is_buyer"].astype(int)

    # ---------------------------------------------------------
    # Same 70 / 15 / 15 stratified split used by V2
    # ---------------------------------------------------------
    X_train, X_temp, y_train, y_temp = train_test_split(
        X,
        y,
        test_size=0.30,
        random_state=42,
        stratify=y,
    )

    X_val, _, y_val, _ = train_test_split(
        X_temp,
        y_temp,
        test_size=0.50,
        random_state=42,
        stratify=y_temp,
    )

    print(
        f"Train: {len(X_train):,} | "
        f"Validation: {len(X_val):,}"
    )

    # ---------------------------------------------------------
    # Same class imbalance handling as Module 3 V2
    # ---------------------------------------------------------
    scale_pos_weight = (
        (y_train == 0).sum() /
        max((y_train == 1).sum(), 1)
    )

    print(
        f"Scale positive weight: "
        f"{scale_pos_weight:.2f}"
    )

    # ---------------------------------------------------------
    # Same XGBoost configuration from EngagementPredictorV2
    # ---------------------------------------------------------
    model = xgb.XGBClassifier(
        n_estimators=200,
        scale_pos_weight=scale_pos_weight,
        random_state=42,
        eval_metric="logloss",
        verbosity=0,
        max_depth=6,
        learning_rate=0.05,
    )

    print("\nTraining XGBoost...")
    model.fit(X_train, y_train)

    # ---------------------------------------------------------
    # Optimize threshold on VALIDATION ONLY
    # ---------------------------------------------------------
    validation_probability = model.predict_proba(X_val)[:, 1]

    best_threshold = 0.5
    best_f1 = 0.0

    for threshold in np.arange(0.01, 0.99, 0.01):
        prediction = (
            validation_probability >= threshold
        ).astype(int)

        score = f1_score(
            y_val,
            prediction,
            zero_division=0,
        )

        if score > best_f1:
            best_f1 = score
            best_threshold = float(threshold)

    print(
        f"Optimal validation threshold: "
        f"{best_threshold:.2f}"
    )

    print(
        f"Validation F1: "
        f"{best_f1:.4f}"
    )

    # ---------------------------------------------------------
    # Calculate the clean engagement percentile reference.
    #
    # The V2 model uses percentile of:
    # views + 3 * carts
    #
    # We save the sorted reference values so the simulator can
    # calculate a scenario percentile against the same customer
    # population.
    # ---------------------------------------------------------
    clean_engagement_score = (
        twins["total_views"].astype(float)
        + twins["total_addtocarts"].astype(float) * 3
    )

    percentile_reference = np.sort(
        clean_engagement_score.to_numpy()
    )

    # ---------------------------------------------------------
    # Save everything required for inference
    # ---------------------------------------------------------
    MODEL_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    bundle = {
        "model": model,
        "feature_names": feature_names,
        "threshold": best_threshold,
        "percentile_reference": percentile_reference,
        "model_name": "XGBoost V2",
        "feature_version": "leakage_free_v2",
    }

    with MODEL_PATH.open("wb") as file:
        pickle.dump(bundle, file)

    print("\n" + "=" * 70)
    print("MODEL SAVED SUCCESSFULLY")
    print("=" * 70)
    print(f"Path: {MODEL_PATH}")
    print(f"Features: {feature_names}")
    print(f"Threshold: {best_threshold:.2f}")
    print("=" * 70)


if __name__ == "__main__":
    main()