"""
Retail Digital Twin — Module 4 Version 2
Hybrid Recommendation Engine

Architecture (reviewed and redesigned):
- Layer 1: Popularity-Based Recommender
- Layer 2: Co-occurrence Recommender (replaces cosine similarity)
- Layer 3: Segment-Aware Recommender
- Layer 4: Hybrid Combiner with buy-probability weighting
- Evaluator: Temporal train/test split with 5 metrics

Design decisions:
- Co-occurrence instead of cosine similarity (memory safe at scale)
- IDF dampening to avoid popularity bias in collaborative layer
- Explicit cold-start handling (< 1 interaction → skip collab)
- Temporal evaluation split (train pre-Sep, test Sep purchases)
"""

import pandas as pd
import numpy as np
from collections import defaultdict
import warnings
warnings.filterwarnings('ignore')


# ============================================================
# LAYER 1 — POPULARITY RECOMMENDER
# ============================================================

class PopularityRecommender:
    """
    Baseline recommender. Works for every customer including
    brand new ones with zero interaction history.

    Logic: Score every item by weighted event count.
    Purchase(5) > AddToCart(3) > View(1)
    Items that get purchased most rise to the top.
    """

    def __init__(self):
        self.popular_items = []
        self.item_scores = {}

    def fit(self, events_df: pd.DataFrame):
        """Build popularity ranking from all events."""
        weight_map = {'view': 1, 'addtocart': 3, 'transaction': 5}

        df = events_df.copy()
        df['weight'] = df['event'].map(weight_map).fillna(1)

        scores = (
            df.groupby('itemid')['weight']
            .sum()
            .sort_values(ascending=False)
        )

        self.item_scores = scores.to_dict()
        self.popular_items = scores.index.tolist()

        print(f"  ✓ Popularity: {len(self.popular_items):,} items ranked")
        return self

    def recommend(self, n: int = 10, exclude_items: set = None,
                  segment: str = None) -> list:
        """
        Return top-N popular items with diversity sampling.
        Takes top 200 items and samples proportionally to score
        to avoid always returning identical lists for every customer.
        """
        exclude = exclude_items or set()

        # Build candidate pool — top 200 items
        candidates = []
        for item in self.popular_items:
            if item not in exclude:
                candidates.append(item)
            if len(candidates) >= 200:
                break

        # If fewer candidates than needed, return all
        if n >= len(candidates):
            return candidates[:n]

        # Sample with probability proportional to score
        scores = np.array([
            self.item_scores.get(item, 1) for item in candidates
        ], dtype=float)
        scores = scores / scores.sum()

        sampled_indices = np.random.choice(
            len(candidates),
            size=min(n, len(candidates)),
            replace=False,
            p=scores
        )
        return [candidates[i] for i in sorted(sampled_indices)]


# ============================================================
# LAYER 2 — CO-OCCURRENCE RECOMMENDER
# ============================================================

class CoOccurrenceRecommender:
    """
    Item co-occurrence based collaborative filtering.

    Core idea: If customers who bought/carted item A also
    bought/carted item B frequently, then A and B are similar.

    Why NOT cosine similarity matrix:
    - Item-item cosine at 25K items = 2.5GB dense matrix
    - Would crash on standard laptops

    Why co-occurrence works:
    - Stored as sparse dict: {item_a: {item_b: score}}
    - Memory: O(U x k^2) where k = avg items per user
    - Build time: seconds not minutes
    - Same quality signal for sparse retail data

    IDF dampening: popular items co-occur with everything.
    We divide by item popularity to surface niche but
    relevant recommendations.
    """

    MIN_INTERACTIONS = 1

    def __init__(self):
        self.cooccurrence = defaultdict(lambda: defaultdict(float))
        self.item_popularity = {}
        self.user_items = {}
        self.fitted = False

    def fit(self, events_df: pd.DataFrame):
        """Build co-occurrence map from cart and purchase events."""
        strong = events_df[
            events_df['event'].isin(['addtocart', 'transaction'])
        ].copy()

        print(f"  Strong signal events: {len(strong):,}")

        user_item_groups = (
            strong.groupby('visitorid')['itemid']
            .apply(list)
            .to_dict()
        )
        self.user_items = user_item_groups

        item_counts = strong['itemid'].value_counts().to_dict()
        self.item_popularity = item_counts

        print(f"  Building co-occurrence map for {len(user_item_groups):,} users...")

        raw_cooccurrence = defaultdict(lambda: defaultdict(int))

        for items in user_item_groups.values():
            unique_items = list(set(items))
            for i in range(len(unique_items)):
                for j in range(len(unique_items)):
                    if i != j:
                        raw_cooccurrence[unique_items[i]][unique_items[j]] += 1

        print(f"  Applying IDF dampening...")

        for item_a, co_items in raw_cooccurrence.items():
            for item_b, count in co_items.items():
                pop_b = self.item_popularity.get(item_b, 1)
                dampened_score = count / np.log1p(pop_b)
                self.cooccurrence[item_a][item_b] = dampened_score

        self.fitted = True
        print(f"  ✓ Co-occurrence: {len(self.cooccurrence):,} items mapped")
        return self

    def recommend(self, visitorid: int, n: int = 10,
                  exclude_items: set = None) -> list:
        """
        Recommend items based on what co-occurs with user history.
        Returns empty list if user has < MIN_INTERACTIONS.
        """
        if not self.fitted:
            return []

        history = self.user_items.get(visitorid, [])

        if len(history) < self.MIN_INTERACTIONS:
            return []

        exclude = exclude_items or set(history)
        candidate_scores = defaultdict(float)

        for item in history:
            if item not in self.cooccurrence:
                continue
            for candidate, score in self.cooccurrence[item].items():
                if candidate not in exclude:
                    candidate_scores[candidate] += score

        ranked = sorted(
            candidate_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )
        return [item for item, _ in ranked[:n]]


# ============================================================
# LAYER 3 — SEGMENT-AWARE RECOMMENDER
# ============================================================

class SegmentAwareRecommender:
    """
    Group-level personalization based on Digital Twin segments.

    Each customer segment has different shopping patterns:
    - Power Buyer:      high-value, high-frequency items
    - Buyer:            complementary items
    - Engaged Browser:  items with high cart-to-buy ratio
    - Window Shopper:   most viewed aspirational items
    - Passive Visitor:  top popular items

    Works for ALL customers including cold start.
    """

    def __init__(self):
        self.segment_items = {}

    def fit(self, events_df: pd.DataFrame, twins_df: pd.DataFrame):
        """Build per-segment item pools."""
        weight_map = {'view': 1, 'addtocart': 3, 'transaction': 5}

        segment_map = (
            twins_df.set_index('visitorid')['customer_segment'].to_dict()
        )

        df = events_df.copy()
        df['segment'] = df['visitorid'].map(segment_map).fillna('Passive Visitor')
        df['weight'] = df['event'].map(weight_map).fillna(1)

        for segment in twins_df['customer_segment'].unique():
            seg_df = df[df['segment'] == segment]

            top_items = (
                seg_df.groupby('itemid')['weight']
                .sum()
                .sort_values(ascending=False)
                .head(500)
                .index.tolist()
            )
            self.segment_items[segment] = top_items

        print(f"  ✓ Segment-aware: pools built for {list(self.segment_items.keys())}")
        return self

    def recommend(self, segment: str, n: int = 10,
                  exclude_items: set = None) -> list:
        exclude = exclude_items or set()
        pool = self.segment_items.get(segment, [])
        result = [item for item in pool if item not in exclude]
        return result[:n]


# ============================================================
# LAYER 4 — HYBRID RECOMMENDER
# ============================================================

class HybridRecommender:
    """
    The brain of the recommendation system.

    Combines all 3 layers with intelligent weighting based on
    each customer's buy probability and interaction depth.

    Strategy matrix:

    HIGH_INTENT   (buy_prob >= 0.5, interactions >= 1)
    → 60% collaborative + 25% segment + 15% popularity

    MEDIUM_INTENT (buy_prob >= 0.2 OR interactions >= 1)
    → 35% collaborative + 40% segment + 25% popularity

    COLD_START    (zero interactions)
    → 0% collaborative + 50% segment + 50% popularity

    DISCOVERY     (low probability, minimal interactions)
    → 10% collaborative + 40% segment + 50% popularity
    """

    def __init__(self):
        self.popularity = PopularityRecommender()
        self.cooccurrence = CoOccurrenceRecommender()
        self.segment_aware = SegmentAwareRecommender()
        self.twins_index = {}
        self.is_fitted = False

    def fit(self, events_df: pd.DataFrame, twins_df: pd.DataFrame,
            train_before: str = None):
        """
        Train the hybrid recommender.

        train_before: if set (e.g. '2015-09-01'), only use events
        before this date for building interaction history.
        This prevents temporal contamination in evaluation.
        """
        print("\n🚀 Training Hybrid Recommendation Engine V2")
        print("=" * 55)

        if train_before:
            events_df_copy = events_df.copy()
            events_df_copy['datetime'] = pd.to_datetime(
                events_df_copy['timestamp'], unit='ms'
            )
            train_events = events_df_copy[
                events_df_copy['datetime'] < train_before
            ].drop(columns=['datetime'])
            print(f"Training on events before {train_before}")
            print(f"Train events: {len(train_events):,}")
        else:
            train_events = events_df

        self.twins_index = twins_df.set_index('visitorid').to_dict('index')

        print("Layer 1: Popularity Recommender")
        self.popularity.fit(train_events)

        print("Layer 2: Co-occurrence Recommender")
        self.cooccurrence.fit(train_events)

        print("Layer 3: Segment-Aware Recommender")
        self.segment_aware.fit(train_events, twins_df)

        self.is_fitted = True
        print("=" * 55)
        print("✅ Hybrid Recommender V2 ready")
        return self

    def _get_strategy(self, buy_prob: float,
                      n_interactions: int) -> tuple:
        """
        Determine layer weights based on customer state.
        Returns (collab_w, segment_w, popular_w, strategy_name)
        """
        has_signal = n_interactions >= self.cooccurrence.MIN_INTERACTIONS

        if buy_prob >= 0.5 and has_signal:
            return (0.60, 0.25, 0.15, 'HIGH_INTENT')
        elif buy_prob >= 0.2 or has_signal:
            return (0.35, 0.40, 0.25, 'MEDIUM_INTENT')
        elif n_interactions == 0:
            return (0.00, 0.50, 0.50, 'COLD_START')
        else:
            return (0.10, 0.40, 0.50, 'DISCOVERY')

    def recommend(self, visitorid: int, n: int = 10) -> dict:
        """
        Generate top-N recommendations for one customer.
        Returns dict with recommendations + metadata.
        """
        profile = self.twins_index.get(visitorid, {})
        segment = profile.get('customer_segment', 'Passive Visitor')
        buy_prob = float(profile.get('buy_probability', 0.0))

        history = set(self.cooccurrence.user_items.get(visitorid, []))
        n_interactions = len(history)

        collab_w, seg_w, pop_w, strategy = self._get_strategy(
            buy_prob, n_interactions
        )

        collab_n = round(n * collab_w)
        seg_n = round(n * seg_w)

        recommendations = []
        seen = set(history)

        # Collaborative slots
        if collab_n > 0:
            collab_recs = self.cooccurrence.recommend(
                visitorid, n=collab_n * 4, exclude_items=seen
            )
            for item in collab_recs[:collab_n]:
                recommendations.append({
                    'itemid': item,
                    'source': 'collaborative',
                    'rank': len(recommendations) + 1
                })
                seen.add(item)

        # Segment slots
        if seg_n > 0:
            seg_recs = self.segment_aware.recommend(
                segment, n=seg_n * 4, exclude_items=seen
            )
            for item in seg_recs[:seg_n]:
                recommendations.append({
                    'itemid': item,
                    'source': 'segment',
                    'rank': len(recommendations) + 1
                })
                seen.add(item)

        # Popularity fill
        remaining = n - len(recommendations)
        if remaining > 0:
            pop_recs = self.popularity.recommend(
                n=remaining * 4, exclude_items=seen
            )
            for item in pop_recs[:remaining]:
                recommendations.append({
                    'itemid': item,
                    'source': 'popularity',
                    'rank': len(recommendations) + 1
                })
                seen.add(item)

        return {
            'visitorid': visitorid,
            'segment': segment,
            'buy_probability': round(buy_prob, 4),
            'strategy': strategy,
            'n_interactions': n_interactions,
            'recommendations': recommendations[:n]
        }

    def recommend_batch(self, visitor_ids: list,
                        n: int = 10) -> pd.DataFrame:
        """Batch recommendations for a list of customers."""
        records = []
        for i, vid in enumerate(visitor_ids):
            if i % 100 == 0:
                print(f"  Processing customer {i+1}/{len(visitor_ids)}...",
                      end='\r')
            result = self.recommend(vid, n=n)
            for rec in result['recommendations']:
                records.append({
                    'visitorid': vid,
                    'segment': result['segment'],
                    'buy_probability': result['buy_probability'],
                    'strategy': result['strategy'],
                    'recommended_itemid': rec['itemid'],
                    'recommendation_rank': rec['rank'],
                    'source': rec['source']
                })
        print(f"\n  ✓ Batch complete: {len(visitor_ids)} customers")
        return pd.DataFrame(records)


# ============================================================
# EVALUATOR — TEMPORAL SPLIT EVALUATION
# ============================================================

class RecommendationEvaluator:
    """
    Temporal holdout evaluation with full diagnostics.

    Train period: May - August 2015
    Test period:  September 2015 purchases

    Key insight for sparse retail data:
    - Most customers buy very few items total
    - HitRate@10 is more meaningful than Precision@10 here
    - Coverage tells us how diverse our recommendations are
    """

    def __init__(self, k: int = 10):
        self.k = k

    def _precision(self, recommended: list, relevant: set) -> float:
        if not recommended or not relevant:
            return 0.0
        hits = sum(1 for item in recommended[:self.k] if item in relevant)
        return hits / self.k

    def _recall(self, recommended: list, relevant: set) -> float:
        if not relevant:
            return 0.0
        hits = sum(1 for item in recommended[:self.k] if item in relevant)
        return hits / len(relevant)

    def _ndcg(self, recommended: list, relevant: set) -> float:
        dcg = sum(
            1.0 / np.log2(i + 2)
            for i, item in enumerate(recommended[:self.k])
            if item in relevant
        )
        idcg = sum(
            1.0 / np.log2(i + 2)
            for i in range(min(self.k, len(relevant)))
        )
        return dcg / idcg if idcg > 0 else 0.0

    def _hit_rate(self, recommended: list, relevant: set) -> float:
        return float(
            any(item in relevant for item in recommended[:self.k])
        )

    def evaluate_popularity_baseline(self,
                                     recommender: 'HybridRecommender',
                                     full_events: pd.DataFrame) -> dict:
        """
        Evaluate pure popularity baseline for research comparison.
        Our hybrid must beat this to justify its complexity.
        """
        print("\n=== POPULARITY BASELINE EVALUATION ===")

        full_events = full_events.copy()
        full_events['datetime'] = pd.to_datetime(
            full_events['timestamp'], unit='ms'
        )

        test_events = full_events[
            (full_events['datetime'] >= '2015-09-01') &
            (full_events['event'] == 'transaction')
        ]

        ground_truth = (
            test_events.groupby('visitorid')['itemid']
            .apply(set).to_dict()
        )

        top_10_popular = recommender.popularity.popular_items[:10]

        hit_scores = []
        p_scores = []

        for visitorid, relevant_items in ground_truth.items():
            hit = float(any(
                item in relevant_items for item in top_10_popular
            ))
            hits = sum(
                1 for item in top_10_popular if item in relevant_items
            )
            hit_scores.append(hit)
            p_scores.append(hits / 10)

        return {
            'Baseline_HitRate@10':   round(np.mean(hit_scores), 4),
            'Baseline_Precision@10': round(np.mean(p_scores), 4),
            'Customers Evaluated':   len(hit_scores)
        }

    def evaluate(self, recommender: 'HybridRecommender',
                 full_events: pd.DataFrame) -> dict:
        """Full temporal evaluation on September 2015 purchases."""
        print("\n=== TEMPORAL EVALUATION ===")

        full_events = full_events.copy()
        full_events['datetime'] = pd.to_datetime(
            full_events['timestamp'], unit='ms'
        )

        train_events = full_events[full_events['datetime'] < '2015-09-01']
        test_events = full_events[
            (full_events['datetime'] >= '2015-09-01') &
            (full_events['event'] == 'transaction')
        ]

        print(f"Train events (May-Aug): {len(train_events):,}")
        print(f"Test transactions (Sep): {len(test_events):,}")

        ground_truth = (
            test_events.groupby('visitorid')['itemid']
            .apply(set).to_dict()
        )

        pre_sep_strong = train_events[
            train_events['event'].isin(['addtocart', 'transaction'])
        ]
        pre_sep_history = (
            pre_sep_strong.groupby('visitorid')['itemid']
            .apply(set).to_dict()
        )

        has_history = sum(
            1 for vid in ground_truth
            if vid in pre_sep_history
            and len(pre_sep_history[vid]) >= 1
        )
        has_collab = sum(
            1 for vid in ground_truth
            if vid in recommender.cooccurrence.user_items
            and len(recommender.cooccurrence.user_items[vid]) >= 1
        )

        print(f"Sep customers total:           {len(ground_truth):,}")
        print(f"With pre-Sep cart/buy history: {has_history:,}")
        print(f"With collab signal (>=1 act):  {has_collab:,}")

        p_scores, r_scores = [], []
        ndcg_scores, hit_scores = [], []
        all_recommended = set()

        for visitorid, relevant_items in ground_truth.items():
            result = recommender.recommend(visitorid, n=self.k)
            recommended = [r['itemid'] for r in result['recommendations']]
            all_recommended.update(recommended)

            hit_scores.append(self._hit_rate(recommended, relevant_items))
            p_scores.append(self._precision(recommended, relevant_items))
            r_scores.append(self._recall(recommended, relevant_items))
            ndcg_scores.append(self._ndcg(recommended, relevant_items))

        total_hits = sum(hit_scores)
        coverage = len(all_recommended) / full_events['itemid'].nunique()

        print(f"\nCustomers with at least 1 hit: {int(total_hits):,}")
        print(f"Total unique items recommended: {len(all_recommended):,}")

        return {
            f'Precision@{self.k}':        round(np.mean(p_scores), 4),
            f'Recall@{self.k}':           round(np.mean(r_scores), 4),
            f'NDCG@{self.k}':             round(np.mean(ndcg_scores), 4),
            f'HitRate@{self.k}':          round(np.mean(hit_scores), 4),
            'Coverage':                   round(coverage, 4),
            'Customers Evaluated':        len(p_scores),
            'Customers w/ Pre-History':   has_history,
            'Customers w/ Collab Signal': has_collab,
            'Total Hits':                 int(total_hits)
        }