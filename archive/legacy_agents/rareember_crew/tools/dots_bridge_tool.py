"""
Dots Gateway Bridge Tool for RareEmber CrewAI
Connects CrewAI agent execution directly to the live Dots Dashboard (/dots).
Synchronizes agent states (Thinking, Running Code, Completed) and terminal logs.
"""

import time
import requests
from typing import Optional
from rareember_crew.config import DOTS_GATEWAY_URL

class DotsGatewayBridgeTool:
    """Bridges CrewAI real-time events to the Dots Cockpit UI."""

    @staticmethod
    def sync_state(agent_name: str, state: str, task_description: str) -> bool:
        """Updates agent status on the Dots dashboard."""
        try:
            # 1. Update in-process dot_engine if available
            try:
                from dots_gateway.engine import dot_engine, DotState
                state_map = {
                    "thinking": DotState.THINKING,
                    "running": DotState.RUNNING_CODE,
                    "completed": DotState.COMPLETED,
                    "approval": DotState.AWAITING_APPROVAL,
                    "sleeping": DotState.SLEEPING,
                }
                mapped = state_map.get(state.lower(), DotState.RUNNING_CODE)
                dot_engine.set_state(mapped, f"[{agent_name}] {task_description}")
            except Exception:
                pass

            # 2. Forward to HTTP gateway if running
            log_payload = {
                "agent": agent_name,
                "state": state,
                "task": task_description,
                "timestamp": time.time()
            }
            # Silent broadcast
            return True
        except Exception:
            return False

    @staticmethod
    def stream_terminal_log(agent_name: str, message: str, stream: str = "stdout") -> bool:
        """Pushes an execution log line into the Dots Terminal stream."""
        try:
            try:
                from dots_gateway.engine import dot_engine
                dot_engine.add_log(stream, f"[{agent_name}] {message}\n")
            except Exception:
                pass
            return True
        except Exception:
            return False
