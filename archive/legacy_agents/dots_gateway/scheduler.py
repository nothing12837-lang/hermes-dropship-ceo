import asyncio
import json
import os
import time
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional
from pydantic import BaseModel

from dots_gateway.config import settings
from dots_gateway.engine import dot_engine, DotState

CRONS_STORAGE_FILE = settings.WORKSPACE_PATH / "dots_gateway" / "crons_store.json"

class CronJobModel(BaseModel):
    id: str
    name: str
    prompt: str
    interval_seconds: int = 1800  # Default 30 minutes
    enabled: bool = True
    last_run: Optional[float] = None
    next_run: Optional[float] = None
    created_at: float

class CronScheduler:
    def __init__(self):
        self.jobs: Dict[str, CronJobModel] = {}
        self.is_running: bool = False
        self._task: Optional[asyncio.Task] = None
        self._load_jobs()

    def _load_jobs(self):
        if CRONS_STORAGE_FILE.exists():
            try:
                data = json.loads(CRONS_STORAGE_FILE.read_text(encoding="utf-8"))
                for item in data:
                    job = CronJobModel(**item)
                    self.jobs[job.id] = job
                return
            except Exception as e:
                print(f"Error loading crons: {e}")

        # Seed default autonomous jobs
        now = time.time()
        default_jobs = [
            CronJobModel(
                id="cron_store_sync",
                name="Store Health & Live Inventory Sync",
                prompt="Check RareEmber store health and Supabase database connection status",
                interval_seconds=1800,
                enabled=True,
                last_run=None,
                next_run=now + 1800,
                created_at=now
            ),
            CronJobModel(
                id="cron_telegram_sync",
                name="Telegram Bot Autonomous Keepalive",
                prompt="Verify @rereemberbot heartbeat and queue status",
                interval_seconds=900,
                enabled=True,
                last_run=None,
                next_run=now + 900,
                created_at=now
            ),
            CronJobModel(
                id="cron_market_scrape",
                name="Viral Winning Products Scrape",
                prompt="run: python -c \"print('Scraping viral dropshipping trends for electronics and home decor...')\"",
                interval_seconds=7200,
                enabled=True,
                last_run=None,
                next_run=now + 7200,
                created_at=now
            )
        ]
        for job in default_jobs:
            self.jobs[job.id] = job
        self._save_jobs()

    def _save_jobs(self):
        try:
            CRONS_STORAGE_FILE.parent.mkdir(parents=True, exist_ok=True)
            serializable = [job.model_dump() for job in self.jobs.values()]
            CRONS_STORAGE_FILE.write_text(json.dumps(serializable, indent=2), encoding="utf-8")
        except Exception as e:
            print(f"Error saving crons: {e}")

    def list_jobs(self) -> List[Dict[str, Any]]:
        return [job.model_dump() for job in self.jobs.values()]

    def add_job(self, name: str, prompt: str, interval_seconds: int = 1800) -> CronJobModel:
        now = time.time()
        job_id = f"cron_{uuid.uuid4().hex[:6]}"
        job = CronJobModel(
            id=job_id,
            name=name,
            prompt=prompt,
            interval_seconds=max(30, interval_seconds),
            enabled=True,
            last_run=None,
            next_run=now + interval_seconds,
            created_at=now
        )
        self.jobs[job_id] = job
        self._save_jobs()
        return job

    def update_job(self, job_id: str, enabled: Optional[bool] = None, interval_seconds: Optional[int] = None) -> Optional[CronJobModel]:
        job = self.jobs.get(job_id)
        if not job:
            return None
        if enabled is not None:
            job.enabled = enabled
        if interval_seconds is not None:
            job.interval_seconds = max(30, interval_seconds)
            job.next_run = time.time() + job.interval_seconds
        self._save_jobs()
        return job

    def delete_job(self, job_id: str) -> bool:
        if job_id in self.jobs:
            del self.jobs[job_id]
            self._save_jobs()
            return True
        return False

    async def execute_job(self, job: CronJobModel):
        now = time.time()
        job.last_run = now
        job.next_run = now + job.interval_seconds
        self._save_jobs()

        await dot_engine.broadcast_terminal_output(
            "system",
            f"\n⏰ [CRON TRIGGER] Fired scheduled job '{job.name}' (ID: {job.id})\nTask: {job.prompt}\n"
        )

        try:
            if job.prompt.strip().startswith("run:"):
                cmd = job.prompt.strip().replace("run:", "").strip()
                await dot_engine.execute_sandboxed_command(cmd)
            else:
                async for chunk in dot_engine.process_chat_message(job.prompt):
                    pass
        except Exception as e:
            await dot_engine.broadcast_terminal_output("stderr", f"[CRON ERROR] Failed job {job.id}: {str(e)}\n")

    async def start(self):
        if self.is_running:
            return
        self.is_running = True
        self._task = asyncio.create_task(self._scheduler_loop())

    async def stop(self):
        self.is_running = False
        if self._task:
            self._task.cancel()
            self._task = None

    async def _scheduler_loop(self):
        while self.is_running:
            now = time.time()
            for job in list(self.jobs.values()):
                if job.enabled and job.next_run and now >= job.next_run:
                    # Execute in background so scheduler doesn't stall
                    asyncio.create_task(self.execute_job(job))
            await asyncio.sleep(5)

    async def handle_webhook(self, source: str, event_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Forces Hermes Dot out of IDLE/SLEEPING state to execute event-driven workflows.
        """
        dot_engine.set_state(DotState.THINKING)
        summary = f"Webhook trigger from [{source.upper()}] with event [{event_type}]."
        
        await dot_engine.broadcast_terminal_output(
            "system",
            f"\n⚡ [WEBHOOK RECEIVED] Source: {source} | Event: {event_type}\nPayload summary: {json.dumps(payload)[:200]}...\n"
        )

        prompt = f"External event received from {source} ({event_type}): {json.dumps(payload)}. Please process this event and take necessary actions."
        
        results = []
        async for chunk in dot_engine.process_chat_message(prompt):
            if chunk.get("type") == "message":
                results.append(chunk.get("content", ""))

        return {
            "status": "success",
            "source": source,
            "event_type": event_type,
            "agent_state": dot_engine.state.value,
            "response": "\n".join(results)
        }

scheduler = CronScheduler()
