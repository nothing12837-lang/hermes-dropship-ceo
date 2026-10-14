import asyncio
import os
import time
from contextlib import asynccontextmanager
from typing import Any, Dict, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel

from dots_gateway.config import settings
from dots_gateway.engine import dot_engine, DotState
from dots_gateway.file_manager import file_manager
from dots_gateway.scheduler import scheduler, CronJobModel

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Launch 24/7 background cron scheduler
    await scheduler.start()
    yield
    # Shutdown: Stop scheduler
    await scheduler.stop()

app = FastAPI(
    title="Hermes Dots Gateway API",
    description="Production API Gateway & Sandboxed Dashboard Wrapper for Hermes Agent (OpenAI Dots Clone)",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class ChatRequest(BaseModel):
    prompt: str
    session_id: Optional[str] = None

class ExecuteRequest(BaseModel):
    command: str
    cwd: Optional[str] = None

class ApprovalResponse(BaseModel):
    approved: bool
    feedback: Optional[str] = ""

class CreateCronRequest(BaseModel):
    name: str
    prompt: str
    interval_seconds: int = 1800

class UpdateCronRequest(BaseModel):
    enabled: Optional[bool] = None
    interval_seconds: Optional[int] = None

class WebhookTriggerRequest(BaseModel):
    source: str = "custom"
    event_type: str = "webhook"
    payload: Dict[str, Any] = {}

class MemoryUpdateRequest(BaseModel):
    target: str = "memory"  # 'memory' or 'user'
    content: str

# ----------------- Health & Status -----------------
@app.get("/health")
@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "online",
        "service": "Hermes Dots Gateway",
        "agent_state": dot_engine.state.value,
        "current_task": dot_engine.current_task,
        "session_id": dot_engine.session_id,
        "timestamp": time.time(),
        "pending_approvals_count": len(dot_engine.pending_approvals)
    }

# ----------------- WebSocket for Realtime Terminal & Approvals -----------------
@app.websocket("/ws/terminal/{session_id}")
async def websocket_terminal_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    dot_engine.register_websocket(websocket)
    
    # Send initial state snapshot
    try:
        await websocket.send_json({
            "type": "init",
            "state": dot_engine.state.value,
            "session_id": session_id,
            "logs": dot_engine.execution_logs[-50:],
            "pending_approvals": [
                {
                    "action_id": a.action_id,
                    "command": a.command,
                    "reason": a.reason,
                    "created_at": a.created_at
                }
                for a in dot_engine.pending_approvals.values()
            ]
        })
        
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")
            
            if msg_type == "execute":
                cmd = data.get("command", "")
                if cmd:
                    asyncio.create_task(dot_engine.execute_sandboxed_command(cmd))
            
            elif msg_type == "approve":
                action_id = data.get("action_id", "")
                approved = bool(data.get("approved", False))
                feedback = data.get("feedback", "")
                dot_engine.resolve_approval(action_id, approved, feedback)
                
            elif msg_type == "ping":
                await websocket.send_json({"type": "pong", "timestamp": time.time()})

    except WebSocketDisconnect:
        dot_engine.unregister_websocket(websocket)
    except Exception as e:
        dot_engine.unregister_websocket(websocket)

# ----------------- Chat Endpoint -----------------
@app.post("/api/v1/chat")
async def chat_endpoint(req: ChatRequest):
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
    
    # Streaming response generator
    async def event_stream():
        import json
        async for chunk in dot_engine.process_chat_message(req.prompt):
            yield f"data: {json.dumps(chunk)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")

# ----------------- Direct Sandbox Execution -----------------
@app.post("/api/v1/execute")
async def execute_endpoint(req: ExecuteRequest):
    exit_code, stdout, stderr = await dot_engine.execute_sandboxed_command(req.command, req.cwd)
    return {
        "exit_code": exit_code,
        "stdout": stdout,
        "stderr": stderr,
        "state": dot_engine.state.value
    }

# ----------------- External Webhook Trigger -----------------
@app.post("/api/v1/dot-triggers")
async def webhook_trigger_endpoint(req: WebhookTriggerRequest):
    result = await scheduler.handle_webhook(req.source, req.event_type, req.payload)
    return result

# ----------------- Human-In-The-Loop Approvals -----------------
@app.get("/api/v1/approvals")
async def list_pending_approvals():
    return [
        {
            "action_id": a.action_id,
            "command": a.command,
            "reason": a.reason,
            "details": a.details,
            "created_at": a.created_at
        }
        for a in dot_engine.pending_approvals.values()
    ]

@app.post("/api/v1/approvals/{action_id}")
async def resolve_approval_endpoint(action_id: str, body: ApprovalResponse):
    success = dot_engine.resolve_approval(action_id, body.approved, body.feedback or "")
    if not success:
        raise HTTPException(status_code=404, detail="Pending approval action ID not found or already resolved.")
    return {"status": "resolved", "action_id": action_id, "approved": body.approved}

# ----------------- Cron Scheduler -----------------
@app.get("/api/v1/crons")
async def get_cron_jobs():
    return scheduler.list_jobs()

@app.post("/api/v1/crons")
async def create_cron_job(req: CreateCronRequest):
    job = scheduler.add_job(req.name, req.prompt, req.interval_seconds)
    return job.model_dump()

@app.patch("/api/v1/crons/{job_id}")
async def update_cron_job(job_id: str, req: UpdateCronRequest):
    updated = scheduler.update_job(job_id, req.enabled, req.interval_seconds)
    if not updated:
        raise HTTPException(status_code=404, detail="Cron job not found")
    return updated.model_dump()

@app.delete("/api/v1/crons/{job_id}")
async def delete_cron_job(job_id: str):
    success = scheduler.delete_job(job_id)
    if not success:
        raise HTTPException(status_code=404, detail="Cron job not found")
    return {"status": "deleted", "job_id": job_id}

@app.post("/api/v1/crons/{job_id}/run")
async def run_cron_job_now(job_id: str, background_tasks: BackgroundTasks):
    job = scheduler.jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Cron job not found")
    background_tasks.add_task(scheduler.execute_job, job)
    return {"status": "triggered", "job_id": job_id}

# ----------------- File Explorer & Sandboxed Artifacts -----------------
@app.get("/api/v1/files")
async def get_files(limit: int = 150):
    return file_manager.list_files(limit=limit)

@app.get("/api/v1/files/content")
async def get_file_content(path: str = Query(..., description="Relative path in workspace")):
    res = file_manager.read_file_content(path)
    if "error" in res:
        raise HTTPException(status_code=400, detail=res["error"])
    return res

# ----------------- Long-term Memory (~/.hermes or RADHA_MEMORY) -----------------
@app.get("/api/v1/memory")
async def get_memory():
    return dot_engine.read_memory_state()

@app.post("/api/v1/memory")
async def update_memory(req: MemoryUpdateRequest):
    target_path = settings.MEMORY_MD_PATH if req.target == "memory" else settings.USER_MD_PATH
    try:
        target_path.parent.mkdir(parents=True, exist_ok=True)
        target_path.write_text(req.content, encoding="utf-8")
        return {"status": "updated", "target": req.target, "path": str(target_path)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update memory file: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("dots_gateway.main:app", host=settings.HOST, port=settings.PORT, reload=True)
