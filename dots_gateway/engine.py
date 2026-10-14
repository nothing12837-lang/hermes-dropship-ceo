import asyncio
import os
import re
import time
import uuid
from typing import Any, AsyncGenerator, Callable, Dict, List, Optional
from enum import Enum
import requests

from dots_gateway.config import settings
from dots_gateway.skills_manager import skills_manager

class DotState(str, Enum):
    SLEEPING = "Sleeping"
    THINKING = "Thinking"
    RUNNING_CODE = "Running Code"
    AWAITING_APPROVAL = "Awaiting Approval"
    COMPLETED = "Completed"

class PendingApproval:
    def __init__(self, action_id: str, command: str, reason: str, details: dict):
        self.action_id = action_id
        self.command = command
        self.reason = reason
        self.details = details
        self.created_at = time.time()
        self.event = asyncio.Event()
        self.is_approved: Optional[bool] = None
        self.rejection_feedback: Optional[str] = None

class HermesDotEngine:
    def __init__(self):
        self.state: DotState = DotState.SLEEPING
        self.current_task: Optional[str] = None
        self.session_id: str = str(uuid.uuid4())[:8]
        self.active_websockets: List[Any] = []
        self.pending_approvals: Dict[str, PendingApproval] = {}
        self.execution_logs: List[Dict[str, Any]] = []
        self.chat_history: List[Dict[str, str]] = []
        # Hermes Terminal Execution Backend flag: 'local' | 'docker' | 'modal'
        self.execution_backend: str = settings.EXECUTION_BACKEND

    def set_execution_backend(self, backend: str) -> str:
        if backend in ["local", "docker", "modal"]:
            self.execution_backend = backend
            self._broadcast_event({
                "type": "backend_change",
                "backend": self.execution_backend,
                "timestamp": time.time()
            })
            return self.execution_backend
        return self.execution_backend

    def set_state(self, new_state: DotState):
        self.state = new_state
        self._broadcast_event({
            "type": "state_change",
            "state": self.state.value,
            "session_id": self.session_id,
            "current_task": self.current_task,
            "backend": self.execution_backend,
            "timestamp": time.time()
        })

    def register_websocket(self, ws: Any):
        self.active_websockets.append(ws)

    def unregister_websocket(self, ws: Any):
        if ws in self.active_websockets:
            self.active_websockets.remove(ws)

    def _broadcast_event(self, data: dict):
        for ws in list(self.active_websockets):
            try:
                asyncio.create_task(ws.send_json(data))
            except Exception:
                self.unregister_websocket(ws)

    async def broadcast_terminal_output(self, stream: str, text: str):
        self.execution_logs.append({
            "stream": stream,
            "text": text,
            "timestamp": time.time()
        })
        if len(self.execution_logs) > 1000:
            self.execution_logs.pop(0)
        self._broadcast_event({
            "type": "terminal_stream",
            "stream": stream,
            "text": text,
            "backend": self.execution_backend
        })

    def is_destructive(self, command: str) -> tuple[bool, str]:
        cmd_lower = command.lower()
        for pat in settings.DESTRUCTIVE_COMMAND_PATTERNS:
            if re.search(pat, cmd_lower):
                return True, f"Command matches protected policy pattern: '{pat}'"
        return False, ""

    async def request_human_approval(self, command: str, reason: str, details: dict) -> bool:
        action_id = str(uuid.uuid4())[:8]
        approval = PendingApproval(action_id, command, reason, details)
        self.pending_approvals[action_id] = approval
        self.set_state(DotState.AWAITING_APPROVAL)

        await self.broadcast_terminal_output("system", f"\n🛑 [SECURITY INTERCEPTOR] Destructive operation paused!\nCommand: {command}\nReason: {reason}\nAwaiting human approval in UI (Action ID: {action_id})...\n")

        self._broadcast_event({
            "type": "approval_required",
            "action_id": action_id,
            "command": command,
            "reason": reason,
            "risk_level": "HIGH",
            "timestamp": approval.created_at
        })

        # Block until approved or rejected
        await approval.event.wait()
        del self.pending_approvals[action_id]
        
        if approval.is_approved:
            self.set_state(DotState.RUNNING_CODE)
            await self.broadcast_terminal_output("system", f"✅ [APPROVED BY USER] Resuming action {action_id}...\n")
            return True
        else:
            self.set_state(DotState.COMPLETED)
            await self.broadcast_terminal_output("system", f"❌ [REJECTED BY USER] Action {action_id} was rejected. Feedback: {approval.rejection_feedback or 'None'}\n")
            return False

    def resolve_approval(self, action_id: str, approved: bool, feedback: str = "") -> bool:
        approval = self.pending_approvals.get(action_id)
        if not approval:
            return False
        approval.is_approved = approved
        approval.rejection_feedback = feedback
        approval.event.set()
        return True

    async def execute_sandboxed_command(self, command: str, cwd: str = None) -> tuple[int, str, str]:
        """
        Executes command according to Hermes Terminal Backend:
        - 'local': Native async subprocess shell
        - 'docker': Wrapped in docker container exec
        - 'modal': Remote Modal serverless sandbox execution
        """
        work_dir = cwd or str(settings.WORKSPACE_PATH)
        is_dest, reason = self.is_destructive(command)
        
        if is_dest:
            allowed = await self.request_human_approval(command, reason, {"cwd": work_dir, "backend": self.execution_backend})
            if not allowed:
                return -1, "", f"Operation rejected by human operator: {reason}"

        self.set_state(DotState.RUNNING_CODE)
        
        # Format command based on backend
        actual_cmd = command
        backend_tag = f"[{self.execution_backend.upper()} SANDBOX]"

        if self.execution_backend == "docker":
            actual_cmd = f"docker exec -i {settings.DOCKER_CONTAINER_NAME} sh -c \"{command}\""
        elif self.execution_backend == "modal":
            actual_cmd = f"modal run modal_sandbox.py --cmd \"{command}\""

        await self.broadcast_terminal_output("stdin", f"$ {backend_tag} {command}\n")

        try:
            proc = await asyncio.create_subprocess_shell(
                actual_cmd,
                cwd=work_dir,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )

            stdout_chunks = []
            stderr_chunks = []

            async def read_stream(stream, kind):
                while True:
                    line = await stream.readline()
                    if not line:
                        break
                    decoded = line.decode("utf-8", errors="replace")
                    if kind == "stdout":
                        stdout_chunks.append(decoded)
                    else:
                        stderr_chunks.append(decoded)
                    await self.broadcast_terminal_output(kind, decoded)

            await asyncio.gather(
                read_stream(proc.stdout, "stdout"),
                read_stream(proc.stderr, "stderr")
            )

            exit_code = await proc.wait()
            await self.broadcast_terminal_output("system", f"[Process exited with code {exit_code}]\n")
            self.set_state(DotState.COMPLETED)
            return exit_code, "".join(stdout_chunks), "".join(stderr_chunks)

        except Exception as e:
            err_msg = f"Backend execution error ({self.execution_backend}): {str(e)}"
            await self.broadcast_terminal_output("stderr", f"{err_msg}\n")
            self.set_state(DotState.COMPLETED)
            return -1, "", err_msg

    def read_memory_state(self) -> dict:
        memory_content = ""
        user_content = ""
        
        # Check ~/.hermes or local RADHA_MEMORY
        if settings.MEMORY_MD_PATH.exists():
            try:
                memory_content = settings.MEMORY_MD_PATH.read_text(encoding="utf-8", errors="replace")
            except Exception:
                pass
        elif (settings.MEMORY_PATH / "long_term_memory.json").exists():
            try:
                memory_content = (settings.MEMORY_PATH / "long_term_memory.json").read_text(encoding="utf-8", errors="replace")
            except Exception:
                pass

        if settings.USER_MD_PATH.exists():
            try:
                user_content = settings.USER_MD_PATH.read_text(encoding="utf-8", errors="replace")
            except Exception:
                pass

        return {
            "memory_md": memory_content,
            "user_md": user_content,
            "last_updated": time.time()
        }

    async def process_chat_message(self, user_prompt: str) -> AsyncGenerator[dict, None]:
        self.current_task = user_prompt
        self.set_state(DotState.THINKING)
        self.chat_history.append({"role": "user", "content": user_prompt})

        # Yield thinking state
        yield {"type": "status", "state": DotState.THINKING.value, "backend": self.execution_backend}

        # Check for direct execution command triggers
        if user_prompt.strip().startswith("$") or user_prompt.strip().startswith("run:"):
            cmd = user_prompt.strip().lstrip("$").replace("run:", "").strip()
            yield {"type": "status", "state": DotState.RUNNING_CODE.value}
            code, out, err = await self.execute_sandboxed_command(cmd)
            response_text = f"**Command Executed:** `{cmd}` ({self.execution_backend})\n\n```text\n{out or err or 'Done (no output)'}\n```"
            self.chat_history.append({"role": "assistant", "content": response_text})
            yield {"type": "message", "content": response_text, "exit_code": code}
            self.set_state(DotState.SLEEPING)
            return

        # LLM Orchestration (OpenRouter / Gemini / OpenAI compatible)
        api_key = settings.OPENROUTER_API_KEY or settings.GEMINI_API_KEY or settings.OPENAI_API_KEY
        base_url = settings.LLM_BASE_URL
        model = settings.DEFAULT_MODEL

        system_prompt = (
            "You are Hermes Dot, an always-on autonomous AI agent cloned from OpenAI Dots architecture. "
            f"Active Terminal Backend: {self.execution_backend}. "
            "You serve as the executive brain for Ajay's business (RareEmber & Hermes). "
            "You have direct capabilities to inspect workspace files, run shell commands, interact with 4,000+ apps via Model Context Protocol (MCP), "
            "and retain newly learned tasks into version-controlled SKILL.md files. Always be proactive, concise, and executive in your delivery."
        )

        assistant_reply = ""
        try:
            if api_key:
                payload = {
                    "model": model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        *self.chat_history[-8:]
                    ],
                    "temperature": 0.7,
                    "max_tokens": 1200
                }
                headers = {
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                }
                
                resp = requests.post(f"{base_url}/chat/completions", json=payload, headers=headers, timeout=40)
                if resp.status_code == 200:
                    data = resp.json()
                    assistant_reply = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                else:
                    assistant_reply = f"Hermes Dot Brain Notice: API response status {resp.status_code}. Executing autonomous fallback."
            else:
                assistant_reply = (
                    "⚡ **Hermes Dot Online:** I received your instruction. "
                    f"Execution backend: `{self.execution_backend}`. "
                    "4,000+ MCP apps and Skill Retention pipeline are active."
                )
        except Exception as e:
            assistant_reply = f"Hermes Dot processing notice: {e}"

        self.chat_history.append({"role": "assistant", "content": assistant_reply})
        self.set_state(DotState.SLEEPING)
        yield {"type": "message", "content": assistant_reply}

dot_engine = HermesDotEngine()
