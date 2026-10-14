import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent
WORKSPACE_DIR = BASE_DIR
MEMORY_DIR = BASE_DIR / "RADHA_MEMORY"
HERMES_DIR = Path(os.path.expanduser("~/.hermes"))

class Settings(BaseModel):
    # Gateway Server
    HOST: str = os.getenv("DOTS_HOST", "0.0.0.0")
    PORT: int = int(os.getenv("DOTS_PORT", "8000"))
    
    # LLM Orchestration (OpenAI-compatible)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    DEFAULT_MODEL: str = os.getenv("DOTS_MODEL", "google/gemini-2.5-flash")
    LLM_BASE_URL: str = os.getenv("LLM_BASE_URL", "https://openrouter.ai/api/v1")
    
    # Hermes Integration
    HERMES_LOCAL_RPC: str = os.getenv("HERMES_RPC_URL", "http://localhost:8002")
    WORKSPACE_PATH: Path = WORKSPACE_DIR
    MEMORY_PATH: Path = MEMORY_DIR
    USER_MD_PATH: Path = HERMES_DIR / "USER.md" if (HERMES_DIR / "USER.md").exists() else BASE_DIR / "USER.md"
    MEMORY_MD_PATH: Path = HERMES_DIR / "MEMORY.md" if (HERMES_DIR / "MEMORY.md").exists() else BASE_DIR / "MEMORY.md"
    
    # Security Interceptor
    DESTRUCTIVE_COMMAND_PATTERNS: list[str] = [
        r"rm\s+-rf",
        r"drop\s+table",
        r"delete\s+from",
        r"truncate",
        r"git\s+push",
        r"format\s+",
        r"mkfs",
        r"shutdown",
        r"reboot",
        r"send_payment",
        r"transfer_funds"
    ]

settings = Settings()
