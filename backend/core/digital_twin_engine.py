"""
Retail Digital Twin Engine
Module 2: Customer Digital Twin Generation

Architecture:
- CustomerDigitalTwin: represents one customer's virtual profile
- DigitalTwinEngine: processes all customers and generates twin profiles
"""

import pandas as pd
import numpy as np
from dataclasses import dataclass, asdict
from typing import Optional
import warnings
warnings.filterwarnings('ignore')


# ============================================================
# CUSTOMER DIGITAL TWIN — The core data structure
# ============================================================

@dataclass
class CustomerDigitalTwin:
    """
    Virtual representation of a single customer.
    Every attribute is derived from behavioral signals.
    """

    # Identity
    visitorid: int

    # Raw behavioral counts
    total_views: int
    total_addtocarts: int
    total_purchases: int
    total_events: int

    # Engagement metrics
    engagement_score: float
    engagement_level: str          # LOW / MEDIUM / HIGH / POWER

    # Conversion metrics
    view_to_cart_rate: float       # % of views that became cart adds
    cart_to_purchase_rate: float   # % of cart adds that became purchases
    view_to_purchase_rate: float   # % of views that became purchases

    # Customer segmentation
    customer_segment: str          # Window Shopper / Browser / Engaged / Buyer / Power Buyer
    funnel_position: str           # AWARENESS / CONSIDERATION / INTENT / PURCHASE

    # Intent signals
    purchase_intent_score: float   # 0.0 to 1.0
    is_buyer: bool                 # Has ever purchased
    is_high_value: bool            # Top 5% by engagement

    # Percentile rankings (how this customer compares to all others)
    engagement_percentile: float
    purchase_percentile: float

    # Value indicators
    clv_tier: str                  # LOW / MEDIUM / HIGH / PREMIUM
    roi_potential: str             # NOT WORTH / LOW / MEDIUM / HIGH

    # Behavioral personality
    behavior_type: str             # EXPLORER / RESEARCHER / IMPULSE / LOYAL


# ============================================================
# DIGITAL TWIN ENGINE — Processes all 1.4M customers
# ============================================================

class DigitalTwinEngine:
    """
    Converts raw behavioral data into intelligent Digital Twin profiles.
    Designed for 1.4M+ customer scale with vectorized operations.
    """

    def __init__(self, user_behavior_df: pd.DataFrame):
        self.df = user_behavior_df.copy()
        self.twins_df = None
        print(f"Engine initialized with {len(self.df):,} customer records")

    # ── Step 1: Feature Engineering ──────────────────────────

    def _engineer_features(self):
        """Derive all behavioral features from raw counts."""

        df = self.df

        # Total activity
        df['total_events'] = df['view'] + df['addtocart'] + df['transaction']

        # Conversion rates (safe division — avoid divide by zero)
        df['view_to_cart_rate'] = np.where(
            df['view'] > 0,
            (df['addtocart'] / df['view'] * 100).round(2),
            0.0
        )

        df['cart_to_purchase_rate'] = np.where(
            df['addtocart'] > 0,
            (df['transaction'] / df['addtocart'] * 100).round(2),
            0.0
        )

        df['view_to_purchase_rate'] = np.where(
            df['view'] > 0,
            (df['transaction'] / df['view'] * 100).round(2),
            0.0
        )

        # Recalculate engagement score with refined weights
        # Views=1 (passive), AddToCart=3 (intent), Purchase=5 (action)
        df['engagement_score'] = (
            df['view'] * 1 +
            df['addtocart'] * 3 +
            df['transaction'] * 5
        )

        # Boolean flags
        df['is_buyer'] = df['transaction'] > 0
        df['is_high_value'] = df['engagement_score'] >= df['engagement_score'].quantile(0.95)

        print("  ✓ Feature engineering complete")
        return df

    # ── Step 2: Percentile Rankings ──────────────────────────

    def _compute_percentiles(self, df):
        """Rank each customer against all others."""

        df['engagement_percentile'] = (
            df['engagement_score'].rank(pct=True) * 100
        ).round(1)

        df['purchase_percentile'] = (
            df['transaction'].rank(pct=True) * 100
        ).round(1)

        print("  ✓ Percentile rankings computed")
        return df

    # ── Step 3: Engagement Level ─────────────────────────────

    def _assign_engagement_level(self, df):
        """
        4-tier engagement classification.
        Thresholds based on dataset distribution.
        """

        conditions = [
            df['engagement_score'] == 0,
            df['engagement_score'] <= 5,
            df['engagement_score'] <= 20,
            df['engagement_score'] <= 100,
        ]
        choices = ['NONE', 'LOW', 'MEDIUM', 'HIGH']
        df['engagement_level'] = np.select(conditions, choices, default='POWER')

        print("  ✓ Engagement levels assigned")
        return df

    # ── Step 4: Customer Segmentation ────────────────────────

    def _assign_customer_segment(self, df):
        """
        5 segments based on behavior pattern.
        This is the core of the Digital Twin identity.
        """

        def segment(row):
            if row['transaction'] > 10:
                return 'Power Buyer'
            elif row['transaction'] > 0:
                return 'Buyer'
            elif row['addtocart'] > 0:
                return 'Engaged Browser'
            elif row['view'] > 5:
                return 'Window Shopper'
            else:
                return 'Passive Visitor'

        df['customer_segment'] = df.apply(segment, axis=1)

        print("  ✓ Customer segments assigned")
        return df

    # ── Step 5: Funnel Position ───────────────────────────────

    def _assign_funnel_position(self, df):
        """
        Where is this customer in the purchase funnel?
        Useful for targeting — who needs a nudge vs who's ready to buy.
        """

        conditions = [
            df['transaction'] > 0,
            df['addtocart'] > 0,
            df['view'] > 3,
        ]
        choices = ['PURCHASE', 'INTENT', 'CONSIDERATION']
        df['funnel_position'] = np.select(conditions, choices, default='AWARENESS')

        print("  ✓ Funnel positions assigned")
        return df

    # ── Step 6: Purchase Intent Score ────────────────────────

    def _compute_purchase_intent(self, df):
        """
        A 0.0 to 1.0 score indicating likelihood to purchase.
        Combines conversion rates with engagement signal.
        Formula designed to reward decisive behavior.
        """

        # Normalize each component to 0-1
        max_eng = df['engagement_score'].max()
        max_views = df['view'].max()

        engagement_norm = df['engagement_score'] / max_eng if max_eng > 0 else 0
        cart_rate_norm = df['cart_to_purchase_rate'] / 100
        view_cart_norm = df['view_to_cart_rate'] / 100
        purchase_flag = df['is_buyer'].astype(float)

        # Weighted combination
        df['purchase_intent_score'] = (
            engagement_norm * 0.30 +
            cart_rate_norm * 0.35 +
            view_cart_norm * 0.20 +
            purchase_flag * 0.15
        ).round(4)

        print("  ✓ Purchase intent scores computed")
        return df

    # ── Step 7: CLV Tier ──────────────────────────────────────

    def _assign_clv_tier(self, df):
        """
        Customer Lifetime Value tier.
        Based on purchase volume and engagement percentile.
        """

        conditions = [
            df['transaction'] >= 10,
            (df['transaction'] >= 3) | (df['engagement_percentile'] >= 90),
            (df['transaction'] >= 1) | (df['engagement_percentile'] >= 70),
        ]
        choices = ['PREMIUM', 'HIGH', 'MEDIUM']
        df['clv_tier'] = np.select(conditions, choices, default='LOW')

        print("  ✓ CLV tiers assigned")
        return df

    # ── Step 8: ROI Potential ─────────────────────────────────

    def _assign_roi_potential(self, df):
        """
        Is this customer worth targeting with promotions?
        Combines intent score with engagement level.
        """

        conditions = [
            (df['purchase_intent_score'] >= 0.5) & (df['engagement_level'].isin(['HIGH', 'POWER'])),
            (df['purchase_intent_score'] >= 0.3) | (df['addtocart'] > 0),
            df['view'] > 2,
        ]
        choices = ['HIGH', 'MEDIUM', 'LOW']
        df['roi_potential'] = np.select(conditions, choices, default='NOT WORTH')

        print("  ✓ ROI potential assigned")
        return df

    # ── Step 9: Behavior Type ─────────────────────────────────

    def _assign_behavior_type(self, df):
        """
        Customer personality based on action patterns.
        EXPLORER: views lots, rarely buys
        RESEARCHER: high view-to-cart, careful buyer
        IMPULSE: low views but buys directly
        LOYAL: consistent repeat purchases
        """

        def behavior(row):
            if row['transaction'] >= 5 and row['view_to_purchase_rate'] > 10:
                return 'LOYAL'
            elif row['view'] > 20 and row['transaction'] == 0:
                return 'EXPLORER'
            elif row['cart_to_purchase_rate'] > 50:
                return 'IMPULSE'
            elif row['view_to_cart_rate'] > 10:
                return 'RESEARCHER'
            else:
                return 'CASUAL'

        df['behavior_type'] = df.apply(behavior, axis=1)

        print("  ✓ Behavior types assigned")
        return df

    # ── Main Pipeline ─────────────────────────────────────────

    def build_twins(self) -> pd.DataFrame:
        """
        Run the full Digital Twin generation pipeline.
        Returns a DataFrame with one row per customer twin.
        """

        print("\n🚀 Building Digital Twin profiles...")
        print("=" * 45)

        df = self._engineer_features()
        df = self._compute_percentiles(df)
        df = self._assign_engagement_level(df)
        df = self._assign_customer_segment(df)
        df = self._assign_funnel_position(df)
        df = self._compute_purchase_intent(df)
        df = self._assign_clv_tier(df)
        df = self._assign_roi_potential(df)
        df = self._assign_behavior_type(df)

        # Rename columns to match twin schema
        df = df.rename(columns={
            'view': 'total_views',
            'addtocart': 'total_addtocarts',
            'transaction': 'total_purchases'
        })

        self.twins_df = df
        print("=" * 45)
        print(f"✅ {len(df):,} Digital Twin profiles generated")
        return df

    def save_twins(self, path: str):
        """Save all twin profiles to CSV."""
        if self.twins_df is None:
            raise ValueError("Run build_twins() first")
        self.twins_df.to_csv(path, index=False)
        print(f"💾 Saved to {path}")

    def get_twin(self, visitorid: int) -> dict:
        """Retrieve a single customer's Digital Twin profile."""
        if self.twins_df is None:
            raise ValueError("Run build_twins() first")
        row = self.twins_df[self.twins_df['visitorid'] == visitorid]
        if len(row) == 0:
            return {"error": f"Customer {visitorid} not found"}
        return row.iloc[0].to_dict()

    def get_segment_summary(self) -> pd.DataFrame:
        """Summary statistics by customer segment."""
        return self.twins_df.groupby('customer_segment').agg(
            count=('visitorid', 'count'),
            avg_engagement=('engagement_score', 'mean'),
            avg_purchases=('total_purchases', 'mean'),
            avg_intent=('purchase_intent_score', 'mean')
        ).round(3).sort_values('count', ascending=False)