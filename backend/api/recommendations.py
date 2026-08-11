"""
Retail Digital Twin — Recommendation Intelligence API

Exposes the real Module 4 Hybrid Recommendation Engine
to the frontend.

No product names or prices are fabricated because the
RetailRocket dataset only provides anonymous item IDs.
"""

from functools import lru_cache

from flask import Blueprint, jsonify

from backend.core.recommendation_engine import HybridRecommender
from backend.utils.data_loader import load_events, load_twins


recommendations_bp = Blueprint("recommendations", __name__)


@lru_cache(maxsize=1)
def _get_engine() -> HybridRecommender:
    """
    Build the real Hybrid Recommendation Engine once
    and reuse it for subsequent API requests.
    """

    events = load_events()
    twins = load_twins()

    engine = HybridRecommender()

    engine.fit(
        events,
        twins,
        train_before=None,
    )

    return engine


@recommendations_bp.route(
    "/api/recommendations/<int:visitor_id>",
    methods=["GET"],
)
def get_recommendations(visitor_id: int):
    """
    Return real personalized recommendations for one customer.
    """

    twins = load_twins()

    row = twins[twins["visitorid"] == visitor_id]

    if row.empty:
        return jsonify(
            {
                "error": f"Customer {visitor_id} not found"
            }
        ), 404

    engine = _get_engine()

    result = engine.recommend(
        visitor_id,
        n=10,
    )

    recommendations = [
        {
            "itemId": f"ITEM-{int(rec['itemid'])}",
            "rank": int(rec["rank"]),
            "source": rec["source"],
            "tag": rec["source"].capitalize(),
        }
        for rec in result["recommendations"]
    ]

    return jsonify(
        {
            "visitorId": f"C-{visitor_id}",
            "rawId": int(visitor_id),
            "segment": result["segment"],
            "buyProbability": result["buy_probability"],
            "strategy": result["strategy"],
            "interactionCount": result["n_interactions"],
            "recommendations": recommendations,
            "dataSource": "RetailRocket",
            "catalogNote": (
                "RetailRocket provides anonymous item IDs only; "
                "product names, categories and prices are unavailable."
            ),
        }
    )