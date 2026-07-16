"""
Page 1 — Executive Command Center
The first impression. Communicates entire platform value in 30 seconds.
"""

import streamlit as st
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from utils.data_loader import load_twins, load_events, compute_funnel_stats
from utils.chart_builder import (
    build_funnel_chart, build_segment_pie,
    build_daily_activity_chart, build_clv_bar, build_roi_bar
)

st.set_page_config(page_title="Executive Command Center", page_icon="📊", layout="wide")

st.markdown("""
<style>
    .block-container { padding-top: 2rem; }
    div[data-testid="stMetric"] {
        background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%);
        border: 1px solid #E2E8F0;
        border-radius: 12px;
        padding: 16px 20px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
</style>
""", unsafe_allow_html=True)

st.title("📊 Executive Command Center")
st.caption("Real-time overview of the Retail Digital Twin ecosystem")

# ── Load Data ─────────────────────────────────────────────
with st.spinner("Loading platform intelligence..."):
    twins = load_twins()
    events = load_events()
    funnel = compute_funnel_stats(events)

st.markdown("---")

# ── KPI Row 1 ─────────────────────────────────────────────
col1, col2, col3, col4 = st.columns(4)

with col1:
    st.metric(
        "Total Customers Analyzed",
        f"{len(twins):,}",
        help="Unique customer Digital Twin profiles generated"
    )

with col2:
    conv_rate = funnel['view_to_purchase']
    st.metric(
        "Overall Conversion Rate",
        f"{conv_rate}%",
        help="Percentage of views that resulted in a purchase"
    )

with col3:
    best_model_auc = 0.974
    st.metric(
        "Prediction Model AUC",
        f"{best_model_auc}",
        delta="XGBoost (Best Model)",
        help="Area Under ROC Curve for purchase prediction model"
    )

with col4:
    high_roi = len(twins[twins['roi_potential'] == 'HIGH'])
    st.metric(
        "High-ROI Targets Identified",
        f"{high_roi:,}",
        help="Customers with high probability of conversion, worth marketing spend"
    )

st.markdown("---")

# ── Charts Row 1 — Funnel + Segments ─────────────────────
col1, col2 = st.columns(2)

with col1:
    st.plotly_chart(build_funnel_chart(funnel), use_container_width=True)
    st.caption(
        f"**{funnel['views']:,}** views → **{funnel['carts']:,}** cart adds "
        f"({funnel['view_to_cart']}%) → **{funnel['purchases']:,}** purchases "
        f"({funnel['cart_to_purchase']}% of carts)"
    )

with col2:
    st.plotly_chart(build_segment_pie(twins), use_container_width=True)
    top_segment = twins['customer_segment'].value_counts().idxmax()
    st.caption(f"**{top_segment}** is the largest customer segment")

st.markdown("---")

# ── Charts Row 2 — Timeline ───────────────────────────────
st.plotly_chart(build_daily_activity_chart(events), use_container_width=True)

st.markdown("---")

# ── Charts Row 3 — CLV + ROI ──────────────────────────────
col1, col2 = st.columns(2)

with col1:
    st.plotly_chart(build_clv_bar(twins), use_container_width=True)

with col2:
    st.plotly_chart(build_roi_bar(twins), use_container_width=True)

st.markdown("---")

# ── Business Insight Panel ────────────────────────────────
st.subheader("💡 Key Business Insights")

insight_col1, insight_col2, insight_col3 = st.columns(3)

with insight_col1:
    buyers = int(twins['is_buyer'].sum())
    st.info(
        f"**{buyers:,}** customers ({buyers/len(twins)*100:.2f}%) "
        f"have completed at least one purchase historically."
    )

with insight_col2:
    non_buyers_high_prob = len(
        twins[(twins['is_buyer'] == 0) & (twins['buy_probability'] >= 0.5)]
    )
    st.warning(
        f"**{non_buyers_high_prob:,}** non-buyers show **≥50% purchase probability** — "
        f"immediate conversion opportunities."
    )

with insight_col3:
    power_buyers = len(twins[twins['customer_segment'] == 'Power Buyer'])
    st.success(
        f"**{power_buyers:,}** Power Buyers drive disproportionate revenue — "
        f"prioritize retention strategies for this segment."
    )