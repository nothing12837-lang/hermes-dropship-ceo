"""
Hermes Memory Compatibility Module
Proxies 1:1 to radha_ceo.memory for seamless backwards compatibility.
"""

from radha_ceo.memory import (
    save_memory,
    get_memory,
    record_daily_goal,
    get_latest_goal
)

__all__ = [
    "save_memory",
    "get_memory",
    "record_daily_goal",
    "get_latest_goal"
]
