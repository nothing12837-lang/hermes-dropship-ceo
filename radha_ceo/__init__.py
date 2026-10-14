"""
Radha CEO Package
Meta Muse-Grade Autonomous Cloud Dropshipping & Executive Intelligence for RareEmber
Founder & Owner: Ajay Rajbhar (ID: 5238068527)
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

from radha_ceo.brain import RadhaBrain, HermesBrain
from radha_ceo.memory import save_memory, get_memory, record_daily_goal, get_latest_goal
from radha_ceo.team import (
    VikramSales, AaravSEO, PoojaOperations,
    MeeraCreative, KabirFinance, ArjunScout
)
from radha_ceo.evaa import build_evaa_video_reel
from radha_ceo.perpetual import RadhaPerpetualEngine

__all__ = [
    "RadhaBrain",
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
    "build_evaa_video_reel",
    "RadhaPerpetualEngine"
]
