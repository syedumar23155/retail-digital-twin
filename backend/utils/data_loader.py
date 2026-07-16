"""
Backend data loader — cached access to Module 1-4 processed outputs.
Single source of truth for the entire Flask API layer.
Every endpoint imports load_twins()/load_events() from here instead of
reading CSVs directly, so we only pay the load cost once per process.
"""
from pathlib import Path
from functools import lru_cache
import pandas as pd


def get_project_root() -> Path:
    """Auto-detect project root — works regardless of who runs it or from where."""
    current = Path(__file__).resolve()
    for parent in current.parents:
        if (parent / 'datasets').exists():
            return parent
    raise FileNotFoundError("Could not locate project root ('datasets' folder not found)")


ROOT = get_project_root()


@lru_cache(maxsize=1)
def load_twins() -> pd.DataFrame:
    """Digital Twin profiles with Module 3 predictions merged in."""
    path = ROOT / 'datasets' / 'processed' / 'digital_twins_with_predictions_v2.csv'
    return pd.read_csv(path)


@lru_cache(maxsize=1)
def load_events() -> pd.DataFrame:
    """Raw RetailRocket events with parsed datetime."""
    path = ROOT / 'datasets' / 'raw' / 'events.csv'
    df = pd.read_csv(path)
    df['datetime'] = pd.to_datetime(df['timestamp'], unit='ms')
    df['date'] = df['datetime'].dt.date
    return df