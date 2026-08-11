"""
Retail Digital Twin — Chart Builder
Reusable, professionally styled Plotly charts.
Consistent color palette and theming across all pages.
"""

import plotly.graph_objects as go
import plotly.express as px
import pandas as pd

# Brand color palette
COLORS = {
    'primary': '#4F46E5',
    'secondary': '#06B6D4',
    'success': '#10B981',
    'warning': '#F59E0B',
    'danger': '#EF4444',
    'purple': '#8B5CF6',
    'dark': '#1E293B',
    'light_bg': '#F8FAFC'
}

SEGMENT_COLORS = {
    'Power Buyer': '#10B981',
    'Buyer': '#4F46E5',
    'Engaged Browser': '#06B6D4',
    'Window Shopper': '#F59E0B',
    'Passive Visitor': '#94A3B8'
}

CHART_TEMPLATE = "plotly_white"


def build_funnel_chart(stats: dict) -> go.Figure:
    """Conversion funnel visualization."""
    fig = go.Figure(go.Funnel(
        y=["Views", "Add to Cart", "Purchases"],
        x=[stats['views'], stats['carts'], stats['purchases']],
        textposition="inside",
        textinfo="value+percent initial",
        marker={"color": [COLORS['secondary'], COLORS['primary'], COLORS['success']]},
        connector={"line": {"color": COLORS['dark'], "width": 1}}
    ))
    fig.update_layout(
        template=CHART_TEMPLATE,
        height=350,
        margin=dict(l=10, r=10, t=30, b=10),
        title="Customer Conversion Funnel"
    )
    return fig


def build_segment_pie(twins: pd.DataFrame) -> go.Figure:
    """Customer segment distribution donut chart."""
    seg_counts = twins['customer_segment'].value_counts()
    colors = [SEGMENT_COLORS.get(s, '#94A3B8') for s in seg_counts.index]

    fig = go.Figure(go.Pie(
        labels=seg_counts.index,
        values=seg_counts.values,
        hole=0.55,
        marker=dict(colors=colors),
        textinfo='label+percent',
        textposition='outside'
    ))
    fig.update_layout(
        template=CHART_TEMPLATE,
        height=350,
        margin=dict(l=10, r=10, t=30, b=10),
        title="Customer Segment Distribution",
        showlegend=True
    )
    return fig


def build_daily_activity_chart(events: pd.DataFrame) -> go.Figure:
    """Daily activity timeline across all event types."""
    daily = events.groupby(['date', 'event']).size().unstack(fill_value=0)

    fig = go.Figure()
    color_map = {
        'view': COLORS['secondary'],
        'addtocart': COLORS['warning'],
        'transaction': COLORS['success']
    }

    for col in daily.columns:
        fig.add_trace(go.Scatter(
            x=daily.index, y=daily[col],
            mode='lines', name=col.capitalize(),
            line=dict(color=color_map.get(col, COLORS['dark']), width=2)
        ))

    fig.update_layout(
        template=CHART_TEMPLATE,
        height=350,
        margin=dict(l=10, r=10, t=30, b=10),
        title="Activity Timeline (May - September 2015)",
        xaxis_title="Date",
        yaxis_title="Event Count",
        legend=dict(orientation="h", yanchor="bottom", y=1.02)
    )
    return fig


def build_clv_bar(twins: pd.DataFrame) -> go.Figure:
    """CLV tier distribution bar chart."""
    order = ['LOW', 'MEDIUM', 'HIGH', 'PREMIUM']
    clv_counts = twins['clv_tier'].value_counts().reindex(order, fill_value=0)

    fig = go.Figure(go.Bar(
        x=clv_counts.index,
        y=clv_counts.values,
        marker_color=[COLORS['danger'], COLORS['warning'],
                      COLORS['secondary'], COLORS['success']],
        text=clv_counts.values,
        textposition='outside'
    ))
    fig.update_layout(
        template=CHART_TEMPLATE,
        height=320,
        margin=dict(l=10, r=10, t=30, b=10),
        title="Customer Lifetime Value Tiers",
        xaxis_title="CLV Tier",
        yaxis_title="Customer Count"
    )
    return fig


def build_roi_bar(twins: pd.DataFrame) -> go.Figure:
    """ROI potential distribution."""
    order = ['NOT WORTH', 'LOW', 'MEDIUM', 'HIGH']
    roi_counts = twins['roi_potential'].value_counts().reindex(order, fill_value=0)

    fig = go.Figure(go.Bar(
        x=roi_counts.values,
        y=roi_counts.index,
        orientation='h',
        marker_color=[COLORS['dark'], COLORS['warning'],
                      COLORS['secondary'], COLORS['success']],
        text=roi_counts.values,
        textposition='outside'
    ))
    fig.update_layout(
        template=CHART_TEMPLATE,
        height=320,
        margin=dict(l=10, r=10, t=30, b=10),
        title="Marketing ROI Potential Distribution",
        xaxis_title="Customer Count"
    )
    return fig