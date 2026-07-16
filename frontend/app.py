"""
Retail Digital Twin — Enterprise Intelligence Platform
Main entry point and global configuration.
"""

import streamlit as st

st.set_page_config(
    page_title="Retail Digital Twin | Executive Platform",
    page_icon="🛍️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Global CSS injection for enterprise polish
st.markdown("""
<style>
    /* Main container spacing */
    .block-container {
        padding-top: 2rem;
        padding-bottom: 2rem;
    }

    /* KPI Card styling */
    div[data-testid="stMetric"] {
        background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%);
        border: 1px solid #E2E8F0;
        border-radius: 12px;
        padding: 16px 20px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }

    div[data-testid="stMetricLabel"] {
        font-size: 13px;
        font-weight: 600;
        color: #64748B;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    div[data-testid="stMetricValue"] {
        font-size: 28px;
        font-weight: 700;
        color: #1E293B;
    }

    /* Sidebar styling */
    section[data-testid="stSidebar"] {
        background-color: #0F172A;
    }

    section[data-testid="stSidebar"] * {
        color: #F1F5F9 !important;
    }

    /* Header banner */
    .platform-header {
        background: linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%);
        padding: 24px 32px;
        border-radius: 16px;
        margin-bottom: 24px;
        color: white;
    }

    .platform-header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
    }

    .platform-header p {
        margin: 4px 0 0 0;
        opacity: 0.9;
        font-size: 14px;
    }
</style>
""", unsafe_allow_html=True)

st.markdown("""
<div class="platform-header">
    <h1>🛍️ Retail Digital Twin — Enterprise Intelligence Platform</h1>
    <p>Hyper-Personalized Customer Journey Simulation | Powered by RetailRocket Dataset</p>
</div>
""", unsafe_allow_html=True)

st.markdown("""
### Welcome to the Retail Digital Twin Platform

This platform provides end-to-end customer intelligence built on **1.4 million real customer profiles**,
powered by a research-grade machine learning pipeline.

**Navigate using the sidebar** to explore:
- 📊 **Executive Command Center** — Business KPIs and system overview
- 🔍 **Customer Explorer** — Individual Digital Twin profiles
- 🧠 **Prediction Lab** — Live engagement prediction tool
- 🎯 **Recommendation Intelligence** — Hybrid recommender insights
- 🔄 **Journey Simulator** — Scenario simulation engine
- 📚 **Research Observatory** — Methodology and evaluation metrics
""")

st.info("👈 Select a page from the sidebar to begin exploring the platform.")