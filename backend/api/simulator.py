"""
Retail Digital Twin — Page 5 Simulation API

Scenario simulation for the Journey Simulator.

Architecture:

    Current Digital Twin
            ↓
      Scenario Inputs
            ↓
      Leakage-free features
            ↓
        XGBoost V2
            ↓
     Scenario prediction
            ↓
     Hybrid Recommender
            ↓
       Strategy output

Important:
- Historical customer data comes from RetailRocket.
- Scenario controls are hypothetical inputs.
- Purchase history is NEVER used as an XGBoost input feature.
"""

from __future__ import annotations

from pathlib import Path
from functools import lru_cache
import pickle

import numpy as np
import pandas as pd
from flask import Blueprint, jsonify, request

from backend.utils.data_loader import load_twins, load_events
from backend.core.recommendation_engine import HybridRecommender


simulator_bp = Blueprint("simulator", __name__)


# ============================================================
# PATHS
# ============================================================

ROOT = Path(__file__).resolve().parents[2]

MODEL_PATH = (
    ROOT
    / "datasets"
    / "processed"
    / "xgb_v2_model.pkl"
)


# ============================================================
# MODEL LOADING
# ============================================================

@lru_cache(maxsize=1)
def _load_model_bundle():
    """
    Load the persisted Module 3 V2 XGBoost bundle once.
    """

    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"XGBoost model not found at: {MODEL_PATH}"
        )

    with MODEL_PATH.open("rb") as file:
        bundle = pickle.load(file)

    return bundle


# ============================================================
# RECOMMENDER
# ============================================================

@lru_cache(maxsize=1)
def _get_recommender() -> HybridRecommender:
    """
    Load and fit the real HybridRecommender once.
    """

    twins = load_twins()
    events = load_events()

    engine = HybridRecommender()

    engine.fit(
        events,
        twins,
        train_before=None,
    )

    return engine


# ============================================================
# PERCENTILE CALCULATION
# ============================================================

@lru_cache(maxsize=1)
def _get_engagement_reference():
    """
    Return the population engagement-score reference used by
    Module 3 V2.

    V2 engagement score:

        views + 3 × carts
    """

    twins = load_twins()

    scores = (
        twins["total_views"].astype(float)
        + twins["total_addtocarts"].astype(float) * 3
    )

    return np.sort(scores.to_numpy())


def _percentile_from_reference(
    score: float,
    reference: np.ndarray,
) -> float:
    """
    Calculate the percentile of a scenario engagement score
    against the real customer population.
    """

    if len(reference) == 0:
        return 0.0

    position = np.searchsorted(
        reference,
        score,
        side="right",
    )

    percentile = (
        position / len(reference)
    ) * 100.0

    return round(
        float(np.clip(percentile, 0.0, 100.0)),
        1,
    )


# ============================================================
# FEATURE CONSTRUCTION
# ============================================================

def _build_scenario_features(
    total_views: int,
    total_addtocarts: int,
):
    """
    Build exactly the same 8 leakage-free features used by
    Module 3 V2.

    Purchase count is intentionally NOT used.
    """

    total_views = max(
        0,
        int(total_views),
    )

    total_addtocarts = max(
        0,
        int(total_addtocarts),
    )

    view_to_cart_rate = (
        total_addtocarts / total_views * 100.0
        if total_views > 0
        else 0.0
    )

    cart_rate_flag = int(
        total_addtocarts > 0
    )

    engagement_score = (
        total_views
        + total_addtocarts * 3
    )

    total_events = (
        total_views
        + total_addtocarts
    )

    activity_ratio = (
        total_addtocarts
        / (total_views + 1)
    )

    engagement_reference = (
        _get_engagement_reference()
    )

    engagement_percentile = (
        _percentile_from_reference(
            engagement_score,
            engagement_reference,
        )
    )

    return pd.DataFrame(
        [
            {
                "total_views": total_views,
                "total_addtocarts": total_addtocarts,
                "view_to_cart_rate": round(
                    view_to_cart_rate,
                    2,
                ),
                "cart_rate_flag": cart_rate_flag,
                "engagement_score_clean": engagement_score,
                "total_events_clean": total_events,
                "activity_ratio": round(
                    activity_ratio,
                    4,
                ),
                "engagement_percentile_clean":
                    engagement_percentile,
            }
        ]
    )


# ============================================================
# BASIC VALIDATION
# ============================================================

def _number(
    payload: dict,
    key: str,
    default: int,
) -> int:
    """
    Safely read a non-negative integer from scenario JSON.
    """

    value = payload.get(
        key,
        default,
    )

    try:
        value = int(value)
    except (
        TypeError,
        ValueError,
    ):
        value = default

    return max(
        0,
        value,
    )


# ============================================================
# CUSTOMER LOOKUP
# ============================================================

def _get_customer(visitor_id: int):
    """
    Return the real Digital Twin row for one customer.
    """

    twins = load_twins()

    row = twins[
        twins["visitorid"] == visitor_id
    ]

    if row.empty:
        return None

    return row.iloc[0]


# ============================================================
# SEGMENT / STRATEGY HELPERS
# ============================================================

def _scenario_state(
    views: int,
    carts: int,
    purchases: int,
) -> str:
    """
    Human-readable funnel state for the scenario.
    """

    if purchases > 0:
        return "PURCHASE"

    if carts > 0:
        return "INTENT"

    if views > 3:
        return "CONSIDERATION"

    return "AWARENESS"


def _strategy_from_probability(
    probability: float,
    carts: int,
    views: int,
) -> str:
    """
    Determine the scenario strategy.

    This intentionally mirrors the state-aware strategy concept
    used by the project's recommendation engine.
    """

    if carts > 0 and probability >= 0.50:
        return "HIGH_INTENT"

    if carts > 0 or probability >= 0.20:
        return "MEDIUM_INTENT"

    if views <= 1:
        return "COLD_START"

    return "DISCOVERY"


# ============================================================
# MAIN ENDPOINT
# ============================================================

@simulator_bp.route(
    "/api/simulator/<int:visitor_id>",
    methods=["POST"],
)
def simulate(visitor_id: int):
    """
    Run a hypothetical journey scenario for one real customer.

    Example:

    POST /api/simulator/1150086

    {
        "views": 20,
        "carts": 3,
        "purchases": 0
    }
    """

    # --------------------------------------------------------
    # Customer
    # --------------------------------------------------------

    profile = _get_customer(
        visitor_id
    )

    if profile is None:
        return jsonify(
            {
                "error":
                    f"Customer {visitor_id} not found"
            }
        ), 404

    # --------------------------------------------------------
    # Request payload
    # --------------------------------------------------------

    payload = request.get_json(
        silent=True
    ) or {}

    # --------------------------------------------------------
    # Baseline
    # --------------------------------------------------------

    baseline_views = int(
        profile["total_views"]
    )

    baseline_carts = int(
        profile["total_addtocarts"]
    )

    baseline_purchases = int(
        profile["total_purchases"]
    )

    baseline_probability = float(
        profile["buy_probability"]
    )

    # --------------------------------------------------------
    # Scenario
    #
    # If the frontend sends values they are interpreted as
    # scenario totals.
    #
    # Otherwise we start from the customer's real baseline.
    # --------------------------------------------------------

    scenario_views = _number(
        payload,
        "views",
        baseline_views,
    )

    scenario_carts = _number(
        payload,
        "carts",
        baseline_carts,
    )

    scenario_purchases = _number(
        payload,
        "purchases",
        0,
    )

    # Prevent impossible cart count relative to views from
    # producing nonsensical UI values.
    scenario_carts = min(
        scenario_carts,
        max(
            scenario_views,
            scenario_carts,
        ),
    )

    # --------------------------------------------------------
    # XGBoost scenario features
    # --------------------------------------------------------

    scenario_features = _build_scenario_features(
        scenario_views,
        scenario_carts,
    )

    bundle = _load_model_bundle()

    model = bundle["model"]

    feature_names = bundle[
        "feature_names"
    ]

    threshold = float(
        bundle["threshold"]
    )

    model_input = scenario_features[
        feature_names
    ]

    scenario_probability = float(
        model.predict_proba(
            model_input
        )[0, 1]
    )

    scenario_predicted_buyer = int(
        scenario_probability >= threshold
    )

    # --------------------------------------------------------
    # Baseline vs scenario delta
    # --------------------------------------------------------

    probability_delta = (
        scenario_probability
        - baseline_probability
    )

    probability_delta_points = (
        probability_delta * 100.0
    )

    # --------------------------------------------------------
    # Scenario strategy
    # --------------------------------------------------------

    strategy = _strategy_from_probability(
        scenario_probability,
        scenario_carts,
        scenario_views,
    )

    funnel_position = _scenario_state(
        scenario_views,
        scenario_carts,
        scenario_purchases,
    )

    # --------------------------------------------------------
    # Real recommender
    #
    # Recommendations are based on the real customer's
    # interaction history.
    # --------------------------------------------------------

    recommender = _get_recommender()

    recommendation_result = recommender.recommend(
        visitor_id,
        n=5,
    )

    recommendations = []

    for item in recommendation_result.get(
        "recommendations",
        [],
    ):
        source = item.get(
            "source",
            "popularity",
        )

        tag_map = {
            "collaborative": "Collaborative",
            "segment": "Segment",
            "popularity": "Popularity",
        }

        recommendations.append(
            {
                "itemId":
                    f"ITEM-{int(item['itemid'])}",
                "rank":
                    int(item["rank"]),
                "source":
                    source,
                "tag":
                    tag_map.get(
                        source,
                        source.capitalize(),
                    ),
            }
        )

    # --------------------------------------------------------
    # Scenario explanation
    # --------------------------------------------------------

    if probability_delta_points > 5:
        impact = "Strong positive impact"
    elif probability_delta_points > 0:
        impact = "Positive impact"
    elif probability_delta_points < -5:
        impact = "Strong negative impact"
    elif probability_delta_points < 0:
        impact = "Negative impact"
    else:
        impact = "Minimal impact"

    narrative = (
        f"Scenario changes move the customer's "
        f"predicted purchase probability from "
        f"{baseline_probability * 100:.2f}% to "
        f"{scenario_probability * 100:.2f}%. "
        f"This is a "
        f"{probability_delta_points:+.2f} percentage-point "
        f"change. "
        f"The resulting journey state is "
        f"{funnel_position.lower()}."
    )

    # --------------------------------------------------------
    # Response
    # --------------------------------------------------------

    return jsonify(
        {
            "visitorId":
                f"C-{visitor_id}",

            "rawId":
                int(visitor_id),

            "segment":
                profile["customer_segment"],

            "behaviorType":
                profile["behavior_type"],

            "baseline": {
                "views":
                    baseline_views,
                "carts":
                    baseline_carts,
                "purchases":
                    baseline_purchases,
                "buyProbability":
                    round(
                        baseline_probability,
                        4,
                    ),
            },

            "scenario": {
                "views":
                    scenario_views,
                "carts":
                    scenario_carts,
                "purchases":
                    scenario_purchases,
                "features":
                    scenario_features.iloc[
                        0
                    ].to_dict(),
            },

            "prediction": {
                "buyProbability":
                    round(
                        scenario_probability,
                        4,
                    ),
                "predictedBuyer":
                    scenario_predicted_buyer,
                "threshold":
                    threshold,
            },

            "delta": {
                "probability":
                    round(
                        probability_delta,
                        4,
                    ),
                "percentagePoints":
                    round(
                        probability_delta_points,
                        2,
                    ),
                "impact":
                    impact,
            },

            "strategy":
                strategy,

            "funnelPosition":
                funnel_position,

            "recommendations":
                recommendations,

            "narrative":
                narrative,

            "model": {
                "name":
                    "XGBoost V2",
                "type":
                    "Leakage-free behavioral prediction",
                "threshold":
                    threshold,
                "features":
                    feature_names,
            },

            "dataSource":
                "RetailRocket",

            "catalogNote":
                "RetailRocket provides anonymous item IDs only; product names, categories and prices are unavailable.",
        }
    )