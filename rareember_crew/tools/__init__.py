"""
Tools package for RareEmber CrewAI Agents.
Provides Virtual Laptop capabilities:
- database_tool: Direct Supabase database queries and updates
- telegram_tool: Live founder notification dispatch
- virtual_laptop_tool: Web scraping, Meesho product intelligence, image verification
- dots_bridge_tool: Live streaming to Dots cockpit (/dots) and dots_gateway
"""

from .database_tool import SupabaseDatabaseTool, get_db_connection
from .telegram_tool import TelegramBroadcasterTool, send_telegram_message
from .virtual_laptop_tool import VirtualLaptopBrowserTool
from .dots_bridge_tool import DotsGatewayBridgeTool

__all__ = [
    "SupabaseDatabaseTool",
    "get_db_connection",
    "TelegramBroadcasterTool",
    "send_telegram_message",
    "VirtualLaptopBrowserTool",
    "DotsGatewayBridgeTool",
]
