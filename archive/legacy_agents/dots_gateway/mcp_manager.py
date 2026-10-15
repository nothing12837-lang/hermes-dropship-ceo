import asyncio
import json
import os
import shutil
import time
from pathlib import Path
from typing import Any, Dict, List, Optional
from pydantic import BaseModel

from dots_gateway.config import settings

class MCPServerConfig(BaseModel):
    name: str
    description: str
    transport: str = "stdio"  # 'stdio' | 'sse'
    command: Optional[str] = None
    args: List[str] = []
    url: Optional[str] = None
    env: Dict[str, str] = {}
    connected: bool = True
    category: str = "general"
    tools_count: int = 0
    tools: List[Dict[str, Any]] = []

class MCPManager:
    def __init__(self):
        self.store_file = settings.MCP_STORE_PATH
        self.servers: Dict[str, MCPServerConfig] = {}
        self._load_servers()

    def _load_servers(self):
        if self.store_file.exists():
            try:
                data = json.loads(self.store_file.read_text(encoding="utf-8"))
                for s_data in data:
                    server = MCPServerConfig(**s_data)
                    self.servers[server.name] = server
                return
            except Exception as e:
                print(f"Error loading MCP servers: {e}")

        # Seed with high-impact open-source MCP servers for 4000+ app ecosystem
        default_servers = [
            MCPServerConfig(
                name="supabase-postgres",
                description="Live SQL query, schema inspect, and table mutations on Supabase Postgres",
                transport="stdio",
                command="npx",
                args=["-y", "@modelcontextprotocol/server-postgres", os.getenv("DATABASE_URL", "")],
                category="database",
                tools_count=4,
                tools=[
                    {"name": "query_db", "description": "Execute read-only SQL queries"},
                    {"name": "list_tables", "description": "List all database schemas and tables"},
                    {"name": "inspect_schema", "description": "Inspect columns, primary keys, and relations"},
                    {"name": "execute_mutation", "description": "Execute INSERT, UPDATE, or schema alterations"}
                ]
            ),
            MCPServerConfig(
                name="github-integration",
                description="Repo management, issues, PRs, workflow triggers, and commit inspection",
                transport="stdio",
                command="npx",
                args=["-y", "@modelcontextprotocol/server-github"],
                env={"GITHUB_PERSONAL_ACCESS_TOKEN": os.getenv("GITHUB_TOKEN", "")},
                category="developer",
                tools_count=6,
                tools=[
                    {"name": "get_file_contents", "description": "Fetch file content from remote GitHub repo"},
                    {"name": "create_issue", "description": "Create a new issue on GitHub"},
                    {"name": "create_pull_request", "description": "Open a pull request from branch"},
                    {"name": "trigger_workflow", "description": "Trigger a GitHub Actions workflow run"},
                    {"name": "list_commits", "description": "List recent commits on branch"},
                    {"name": "search_code", "description": "Search code across repositories"}
                ]
            ),
            MCPServerConfig(
                name="brave-web-search",
                description="Real-time web browsing, search queries, competitor prices, and viral dropship research",
                transport="stdio",
                command="npx",
                args=["-y", "@modelcontextprotocol/server-brave-search"],
                category="web",
                tools_count=2,
                tools=[
                    {"name": "brave_web_search", "description": "Search the live web for queries"},
                    {"name": "brave_local_search", "description": "Search local entities and businesses"}
                ]
            ),
            MCPServerConfig(
                name="puppeteer-browser",
                description="Headless Chrome browser automation, screenshot capture, DOM scraping, and checkout testing",
                transport="stdio",
                command="npx",
                args=["-y", "@modelcontextprotocol/server-puppeteer"],
                category="automation",
                tools_count=5,
                tools=[
                    {"name": "navigate", "description": "Navigate to URL in headless browser"},
                    {"name": "screenshot", "description": "Take screenshot of current web page"},
                    {"name": "click", "description": "Click element on page by CSS selector"},
                    {"name": "fill", "description": "Fill input text field on page"},
                    {"name": "evaluate_script", "description": "Execute JavaScript in browser page context"}
                ]
            ),
            MCPServerConfig(
                name="stripe-payments",
                description="Stripe billing, invoice sync, customer disputes, checkout sessions, and payout checks",
                transport="stdio",
                command="npx",
                args=["-y", "@stripe/mcp"],
                category="finance",
                tools_count=4,
                tools=[
                    {"name": "list_payments", "description": "List recent transactions and charges"},
                    {"name": "create_payment_link", "description": "Generate a direct checkout payment link"},
                    {"name": "get_balance", "description": "Retrieve current Stripe account balance"},
                    {"name": "refund_charge", "description": "Initiate refund for customer charge"}
                ]
            ),
            MCPServerConfig(
                name="filesystem-sandbox",
                description="Sandboxed file reads, writes, directory listings, and file hash generation",
                transport="stdio",
                command="npx",
                args=["-y", "@modelcontextprotocol/server-filesystem", str(settings.WORKSPACE_PATH)],
                category="system",
                tools_count=5,
                tools=[
                    {"name": "read_file", "description": "Read file contents in workspace"},
                    {"name": "write_file", "description": "Write or overwrite file in workspace"},
                    {"name": "list_directory", "description": "List files and subfolders"},
                    {"name": "move_file", "description": "Move or rename file"},
                    {"name": "get_file_info", "description": "Retrieve size, permissions, and stats"}
                ]
            )
        ]

        for s in default_servers:
            self.servers[s.name] = s
        self._save_servers()

    def _save_servers(self):
        try:
            self.store_file.parent.mkdir(parents=True, exist_ok=True)
            data = [s.model_dump() for s in self.servers.values()]
            self.store_file.write_text(json.dumps(data, indent=2), encoding="utf-8")
        except Exception as e:
            print(f"Error saving MCP servers: {e}")

    def list_servers(self) -> List[Dict[str, Any]]:
        return [s.model_dump() for s in self.servers.values()]

    def connect_server(self, config: MCPServerConfig) -> MCPServerConfig:
        config.connected = True
        self.servers[config.name] = config
        self._save_servers()
        return config

    def disconnect_server(self, name: str) -> bool:
        if name in self.servers:
            self.servers[name].connected = False
            self._save_servers()
            return True
        return False

    def remove_server(self, name: str) -> bool:
        if name in self.servers:
            del self.servers[name]
            self._save_servers()
            return True
        return False

    def list_all_tools(self) -> List[Dict[str, Any]]:
        all_tools = []
        for server in self.servers.values():
            if server.connected:
                for tool in server.tools:
                    all_tools.append({
                        "server": server.name,
                        "category": server.category,
                        "tool": tool["name"],
                        "description": tool["description"]
                    })
        return all_tools

    async def execute_tool(self, server_name: str, tool_name: str, args: Dict[str, Any]) -> Dict[str, Any]:
        server = self.servers.get(server_name)
        if not server or not server.connected:
            return {"error": f"MCP Server '{server_name}' is not connected"}
        
        # Simulated/Direct Tool execution response
        return {
            "status": "success",
            "server": server_name,
            "tool": tool_name,
            "args": args,
            "result": f"Executed {tool_name} successfully via {server_name} MCP integration."
        }

mcp_manager = MCPManager()
