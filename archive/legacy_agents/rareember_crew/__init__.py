"""
RareEmber Autonomous CrewAI Suite
Next-Gen Multi-Agent Corporate Growth Engine for RareEmber Dropshipping & Print-on-Demand.
Powered by CrewAI, Supabase, Telegram, and Dots Architecture.
"""

from .crew import RareEmberCrew
from .agents import (
    create_ceo_agent,
    create_procurement_agent,
    create_seo_agent,
    create_pricing_agent,
    create_creative_agent,
    create_operations_agent,
    create_cfo_agent,
)

__all__ = [
    "RareEmberCrew",
    "create_ceo_agent",
    "create_procurement_agent",
    "create_seo_agent",
    "create_pricing_agent",
    "create_creative_agent",
    "create_operations_agent",
    "create_cfo_agent",
]
