"""
Retail Digital Twin — Data Loader
Cached data loading shared across all dashboard pages.
Prevents reloading 1.4M rows on every user interaction.
"""

import streamlit as st
import pandas as pd
from pathlib import Path


def get_project_root() -> Path:
    """Auto-detect project root regardless of who runs it."""
    current = Path.cwd()
    # Walk up until we find the datasets folder
    for parent in [current] + list(current.parents):
        if (parent / 'datasets').exists():
            return parent
    return current


ROOT = get_project_root()


@st.cache_data(show_spinner="Loading customer intelligence data...")
def load_twins() -> pd.DataFrame:
    """Load Digital Twin profiles with predictions."""
    path = ROOT / 'datasets' / 'processed' / 'digital_twins_with_predictions_v2.csv'
    df = pd.read_csv(path)
    return df


@st.cache_data(show_spinner="Loading event history...")
def load_events() -> pd.DataFrame:
    """Load raw event data."""
    path = ROOT / 'datasets' / 'raw' / 'events.csv'
    df = pd.read_csv(path)
    df['datetime'] = pd.to_datetime(df['timestamp'], unit='ms')
    df['date'] = df['datetime'].dt.date
    return df


@st.cache_data(show_spinner="Loading recommendations...")
def load_recommendations() -> pd.DataFrame:
    """Load generated recommendations."""
    path = ROOT / 'datasets' / 'processed' / 'recommendations.csv'
    df = pd.read_csv(path)
    return df


@st.cache_data
def compute_funnel_stats(_events: pd.DataFrame) -> dict:
    """Compute conversion funnel numbers."""
    counts = _events['event'].value_counts()
    views = int(counts.get('view', 0))
    carts = int(counts.get('addtocart', 0))
    purchases = int(counts.get('transaction', 0))
    return {
        'views': views,
        'carts': carts,
        'purchases': purchases,
        'view_to_cart': round(carts / views * 100, 2) if views else 0,
        'cart_to_purchase': round(purchases / carts * 100, 2) if carts else 0,
        'view_to_purchase': round(purchases / views * 100, 2) if views else 0,
    }