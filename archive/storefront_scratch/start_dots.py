"""
Launcher script for Hermes Dots Gateway (OpenAI Dots Clone)
Run: python start_dots.py
"""

import sys
import os

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

import uvicorn
from dots_gateway.config import settings

def main():
    print("=" * 65)
    print(" [HERMES DOTS GATEWAY] // OPENAI DOTS ARCHITECTURE CLONE")
    print("=" * 65)
    print(f" * Host:           {settings.HOST}")
    print(f" * Port:           {settings.PORT}")
    print(f" * Workspace:      {settings.WORKSPACE_PATH}")
    print(f" * Memory Path:    {settings.MEMORY_PATH}")
    print(f" * Terminal WS:    ws://{settings.HOST}:{settings.PORT}/ws/terminal/{{session_id}}")
    print(f" * REST Gateway:   http://{settings.HOST}:{settings.PORT}/api/v1/health")
    print(f" * Virtual Laptop: http://{settings.HOST}:{settings.PORT}/api/v1/browser/status")
    print(f" * UI Dashboard:   http://localhost:3002/dots (via Next.js)")
    print("=" * 65)
    print(" Starting Uvicorn Gateway with 24/7 background scheduler...")
    
    uvicorn.run(
        "dots_gateway.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=False
    )

if __name__ == "__main__":
    main()
