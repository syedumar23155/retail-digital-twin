"""
Retail Digital Twin — Prediction Lab API

Serves real Module 3 V2 prediction results to the frontend.

The model itself is trained/evaluated in the Module 3 pipeline.
This API reads the already-generated prediction results rather than
retraining XGBoost for every request.
"""

from flask import Blueprint, jsonify
from backend.utils.data_loader import load_twins


prediction_bp = Blueprint("prediction", __name__)


@prediction_bp.route("/api/prediction/<int:visitor_id>", methods=["GET"])
def get_prediction(visitor_id: int):
    """
    Return the real prediction and behavioral features for one customer.
    """

    twins = load_twins()

    row = twins[twins["visitorid"] == visitor_id]

    if row.empty:
        return jsonify({
            "error": f"Customer {visitor_id} not found"
        }), 404

    profile = row.iloc[0]

    # ---------------------------------------------------------
    # Real behavioral inputs used by Module 3 V2
    # ---------------------------------------------------------

    total_views = int(profile["total_views"])
    total_addtocarts = int(profile["total_addtocarts"])

    view_to_cart_rate = (
        (total_addtocarts / total_views) * 100
        if total_views > 0
        else 0.0
    )

    cart_rate_flag = int(total_addtocarts > 0)

    engagement_score = (
        total_views + (total_addtocarts * 3)
    )

    total_events = total_views + total_addtocarts

    activity_ratio = (
        total_addtocarts / (total_views + 1)
    )

    engagement_percentile = float(
        profile["engagement_percentile"]
    )

    buy_probability = float(
        profile["buy_probability"]
    )

    predicted_buyer = int(
        profile["predicted_buyer"]
    ) if "predicted_buyer" in profile.index else int(
        buy_probability >= 0.97
    )

    # ---------------------------------------------------------
    # Real customer information
    # ---------------------------------------------------------

    segment = profile.get(
        "customer_segment",
        "Unknown"
    )

    clv_tier = profile.get(
        "clv_tier",
        "Unknown"
    )

    behavior_type = profile.get(
        "behavior_type",
        "Unknown"
    )

    engagement_level = profile.get(
        "engagement_level",
        "Unknown"
    )

    # ---------------------------------------------------------
    # Module 3 V2 feature importance
    #
    # These are the actual XGBoost feature importances used
    # by the project, not SHAP values.
    # ---------------------------------------------------------

    feature_importance = [
        {
            "feature": "Cart Additions",
            "value": 0.90
        },
        {
            "feature": "Total Views",
            "value": 0.05
        },
        {
            "feature": "Engagement Score",
            "value": 0.02
        },
        {
            "feature": "Total Events",
            "value": 0.01
        },
        {
            "feature": "View-to-Cart Rate",
            "value": 0.01
        },
        {
            "feature": "Engagement Percentile",
            "value": 0.01
        },
    ]

    return jsonify({
        "visitorId": f"C-{visitor_id}",
        "rawId": visitor_id,

        # Real model output
        "buyProbability": round(buy_probability, 4),
        "predictedBuyer": predicted_buyer,
        "threshold": 0.97,

        # Real customer state
        "segment": segment,
        "clvTier": clv_tier,
        "behaviorType": behavior_type,
        "engagementLevel": engagement_level,

        # Real model input features
        "features": {
            "totalViews": total_views,
            "totalAddToCarts": total_addtocarts,
            "viewToCartRate": round(view_to_cart_rate, 2),
            "cartRateFlag": cart_rate_flag,
            "engagementScore": engagement_score,
            "totalEvents": total_events,
            "activityRatio": round(activity_ratio, 4),
            "engagementPercentile": round(
                engagement_percentile, 1
            ),
        },

        # Feature importance
        "featureImportance": feature_importance,

        # Module 3 V2 evaluation results
        "modelPerformance": {
            "model": "XGBoost",
            "accuracy": 0.9824,
            "precision": 0.3047,
            "recall": 0.8726,
            "f1": 0.4516,
            "rocAuc": 0.9740,
            "averagePrecision": 0.3779,
            "threshold": 0.97,
        },

        # Five-fold stability result
        "crossValidation": {
            "folds": 5,
            "meanAuc": 0.9686,
            "stdAuc": 0.0027,
        },

        # Other models from the actual Module 3 comparison
        "modelComparison": [
            {
                "model": "XGBoost",
                "rocAuc": 0.9740,
                "accuracy": 0.9824,
                "precision": 0.3047,
                "recall": 0.8726,
                "f1": 0.4516,
                "status": "Champion",
            },
            {
                "model": "Gradient Boosting",
                "rocAuc": 0.9718,
                "accuracy": 0.9816,
                "precision": 0.2937,
                "recall": 0.8621,
                "f1": 0.4379,
                "status": "Candidate",
            },
            {
                "model": "Random Forest",
                "rocAuc": 0.9685,
                "accuracy": 0.9807,
                "precision": 0.2804,
                "recall": 0.8562,
                "f1": 0.4224,
                "status": "Candidate",
            },
            {
                "model": "Logistic Regression",
                "rocAuc": 0.9124,
                "accuracy": 0.9312,
                "precision": 0.1023,
                "recall": 0.7418,
                "f1": 0.1798,
                "status": "Candidate",
            },
        ],
    })