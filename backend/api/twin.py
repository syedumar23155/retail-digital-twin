"""
API endpoint for the Digital Twin Explorer page.
Frontend consumer: src/routes/twin.tsx (via src/hooks/use-twin.ts)
"""
from flask import Blueprint, jsonify
from functools import lru_cache
import pandas as pd
import numpy as np

from backend.utils.data_loader import load_twins, load_events
from backend.core.recommendation_engine import HybridRecommender

twin_bp = Blueprint('twin', __name__)

# Real global feature importances from Module 3 (XGBoost, leakage-free V2 model).
# These are the actual reported feature_importances_ values — not fabricated.
GLOBAL_FEATURE_IMPORTANCE = [
    {'feature': 'Cart Additions (total_addtocarts)', 'weight': 0.90},
    {'feature': 'Total Views', 'weight': 0.05},
    {'feature': 'Engagement Score', 'weight': 0.02},
    {'feature': 'Total Events', 'weight': 0.01},
    {'feature': 'View-to-Cart Rate', 'weight': 0.01},
    {'feature': 'Engagement Percentile', 'weight': 0.01},
]

FUNNEL_LABELS = {
    'AWARENESS': 'Awareness',
    'CONSIDERATION': 'Consideration',
    'INTENT': 'Cart Intent',
    'PURCHASE': 'Purchased',
}

REASON_TEMPLATES = {
    'collaborative': "Frequently interacted with alongside items already in this customer's history (item co-occurrence).",
    'segment': "Popular among other customers in the same behavioral segment.",
    'popularity': "One of the most-purchased items across the entire RetailRocket catalog.",
}


@lru_cache(maxsize=1)
def _percentile_columns():
    """
    Precompute view/addtocart percentile ranks once across all 1.4M
    customers, so the radar chart's axes are real relative rankings.
    """
    twins = load_twins()
    return pd.DataFrame({
        'visitorid': twins['visitorid'],
        'view_pctl': twins['total_views'].rank(pct=True) * 100,
        'cart_pctl': twins['total_addtocarts'].rank(pct=True) * 100,
    }).set_index('visitorid')


@lru_cache(maxsize=1)
def _get_engine() -> HybridRecommender:
    """
    Fit the Hybrid Recommender once and cache it for the process lifetime.
    Refitting per-request would rebuild the co-occurrence map on every
    API call, which is not viable — this mirrors Module 4's notebook fit.
    """
    twins = load_twins()
    events = load_events()
    engine = HybridRecommender()
    engine.fit(events, twins, train_before=None)
    return engine


@twin_bp.route('/api/twin/<int:visitor_id>', methods=['GET'])
def get_twin(visitor_id: int):
    twins = load_twins()
    events = load_events()

    row = twins[twins['visitorid'] == visitor_id]
    if row.empty:
        return jsonify({'error': f'Customer {visitor_id} not found'}), 404
    profile = row.iloc[0]

    # ---- Real first/last seen + active span ----
    customer_events = events[events['visitorid'] == visitor_id].sort_values('datetime')
    if len(customer_events) > 0:
        first_seen = customer_events['datetime'].min()
        last_seen = customer_events['datetime'].max()
        active_days = int((last_seen - first_seen).days) + 1
    else:
        first_seen = last_seen = None
        active_days = 0

    # ---- Real radar (6 axes, all percentile/score based) ----
    pctl = _percentile_columns()
    view_pctl = float(pctl.loc[visitor_id, 'view_pctl']) if visitor_id in pctl.index else 0.0
    cart_pctl = float(pctl.loc[visitor_id, 'cart_pctl']) if visitor_id in pctl.index else 0.0

    radar = [
        {'trait': 'Engagement', 'value': round(float(profile['engagement_percentile']), 1)},
        {'trait': 'Browsing Activity', 'value': round(view_pctl, 1)},
        {'trait': 'Cart Activity', 'value': round(cart_pctl, 1)},
        {'trait': 'Purchase History', 'value': round(float(profile['purchase_percentile']), 1)},
        {'trait': 'Buy Intent', 'value': round(float(profile['purchase_intent_score']) * 100, 1)},
        {'trait': 'Conversion Rate', 'value': round(min(float(profile['view_to_cart_rate']), 100), 1)},
    ]

    # ---- Real event timeline (last 8 events, this visitor only) ----
    timeline = [
        {
            'time': row.datetime.strftime('%H:%M'),
            'date': row.datetime.strftime('%Y-%m-%d'),
            'event': {
                'view': 'Viewed product',
                'addtocart': 'Added to cart',
                'transaction': 'Purchased item',
            }[row.event],
            'itemId': f"ITEM-{int(row.itemid)}",
            'channel': 'Online \u00b7 RetailRocket',
        }
        for row in customer_events.tail(8).itertuples()
    ]

    # ---- Real recommendations from Module 4 engine ----
    engine = _get_engine()
    rec_result = engine.recommend(visitor_id, n=3)
    recommendations = [
        {
            'itemId': f"ITEM-{int(r['itemid'])}",
            'source': r['source'],
            'tag': r['source'].capitalize(),
            'reason': REASON_TEMPLATES.get(r['source'], ''),
            'rank': r['rank'],
        }
        for r in rec_result['recommendations']
    ]

    # ---- Real narrative, built from this customer's actual numbers ----
    narrative = (
        f"This customer added {int(profile['total_addtocarts'])} items to cart "
        f"across {int(profile['total_views'])} product views "
        f"(cart addition is the single strongest signal in our model, "
        f"weighted 90% by the trained XGBoost classifier). "
        f"Combined, these push the predicted purchase probability to "
        f"{float(profile['buy_probability']) * 100:.2f}%"
    )

    return jsonify({
        'visitorId': f"C-{visitor_id}",
        'rawId': int(visitor_id),
        'segment': profile['customer_segment'],
        'clvTier': profile['clv_tier'],
        'behaviorType': profile['behavior_type'],
        'funnelPosition': FUNNEL_LABELS.get(profile['funnel_position'], profile['funnel_position']),
        'roiPotential': profile['roi_potential'],
        'engagementLevel': profile['engagement_level'],
        'firstSeen': first_seen.isoformat() if first_seen is not None else None,
        'lastSeen': last_seen.isoformat() if last_seen is not None else None,
        'activeDays': active_days,
        'totalViews': int(profile['total_views']),
        'totalAddToCarts': int(profile['total_addtocarts']),
        'totalPurchases': int(profile['total_purchases']),
        'buyProbability': round(float(profile['buy_probability']), 4),
        'engagementPercentile': round(float(profile['engagement_percentile']), 1),
        'radar': radar,
        'timeline': timeline,
        'recommendations': recommendations,
        'featureImportance': GLOBAL_FEATURE_IMPORTANCE,
        'narrative': narrative,
    })