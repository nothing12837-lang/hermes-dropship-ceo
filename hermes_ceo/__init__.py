"""
Hermes CEO Package
Autonomous Cloud Dropshipping Intelligence for RareEmber
"""

import os
from pathlib import Path
try:
    from dotenv import load_dotenv
    _env_path = Path(__file__).resolve().parent.parent / ".env"
    if _env_path.exists():
        load_dotenv(_env_path)
    else:
        load_dotenv()
except Exception:
    pass

from hermes_ceo.brain import HermesBrain
from hermes_ceo.memory import save_memory, get_memory, record_daily_goal, get_latest_goal
from hermes_ceo.team import (
    VikramSales, AaravSEO, PoojaOperations,
    MeeraCreative, KabirFinance, ArjunScout
)
from hermes_ceo.evaa import build_evaa_video_reel

__all__ = [
    "HermesBrain",
    "save_memory",
    "get_memory",
    "record_daily_goal",
    "get_latest_goal",
    "VikramSales",
    "AaravSEO",
    "PoojaOperations",
    "MeeraCreative",
    "KabirFinance",
    "ArjunScout",
    "build_evaa_video_reel"
]
