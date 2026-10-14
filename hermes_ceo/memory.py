"""
Hermes Cloud Memory Module
Provides resilient, persistent episodic, semantic, and procedural memory
stored directly in Supabase Cloud PostgreSQL (zero local file reliance).
"""

import os
import json
import ssl
from datetime import datetime, timezone
import pg8000.native

DB_HOST = os.environ.get("SUPABASE_DB_HOST", "db.qdkkxpfhwrwyoardlceo.supabase.co").strip()
DB_USER = os.environ.get("SUPABASE_DB_USER", "postgres").strip()
DB_PASS = os.environ.get("SUPABASE_DB_PASS", "").strip()
DB_NAME = os.environ.get("SUPABASE_DB_NAME", "postgres").strip()

def _get_con():
    if not DB_PASS:
        return None
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        return pg8000.native.Connection(
            user=DB_USER,
            host=DB_HOST,
            port=5432,
            database=DB_NAME,
            password=DB_PASS,
            ssl_context=ctx
        )
    except Exception as e:
        print(f"[Memory DB] Connection error: {e}")
        return None

def save_memory(agent_name: str, memory_type: str, key: str, content: dict, confidence: float = 1.0):
    """Upserts memory record into Supabase agent_memory table."""
    con = _get_con()
    if not con:
        return False
    try:
        json_content = json.dumps(content) if isinstance(content, (dict, list)) else json.dumps({"value": str(content)})
        con.run("""
            INSERT INTO agent_memory (agent_name, memory_type, key, content, confidence, updated_at)
            VALUES (:agent, :type, :key, :content::jsonb, :conf, NOW())
            ON CONFLICT (agent_name, memory_type, key)
            DO UPDATE SET
                content = EXCLUDED.content,
                confidence = EXCLUDED.confidence,
                updated_at = NOW()
        """,
            agent=agent_name.upper().strip(),
            type=memory_type.lower().strip(),
            key=key.strip(),
            content=json_content,
            conf=float(confidence)
        )
        con.close()
        return True
    except Exception as e:
        print(f"[Memory Save Error] {agent_name}:{key} -> {e}")
        if con:
            try: con.close()
            except Exception: pass
        return False

def get_memory(agent_name: str, memory_type: str = None, key: str = None):
    """Retrieves memories for a given agent from Supabase."""
    con = _get_con()
    if not con:
        return []
    try:
        if key and memory_type:
            rows = con.run("""
                SELECT agent_name, memory_type, key, content, confidence, updated_at
                FROM agent_memory
                WHERE agent_name = :agent AND memory_type = :type AND key = :key
            """, agent=agent_name.upper().strip(), type=memory_type.lower().strip(), key=key.strip())
        elif memory_type:
            rows = con.run("""
                SELECT agent_name, memory_type, key, content, confidence, updated_at
                FROM agent_memory
                WHERE agent_name = :agent AND memory_type = :type
                ORDER BY updated_at DESC LIMIT 50
            """, agent=agent_name.upper().strip(), type=memory_type.lower().strip())
        else:
            rows = con.run("""
                SELECT agent_name, memory_type, key, content, confidence, updated_at
                FROM agent_memory
                WHERE agent_name = :agent
                ORDER BY updated_at DESC LIMIT 50
            """, agent=agent_name.upper().strip())
        con.close()

        results = []
        for r in rows:
            results.append({
                "agent": r[0],
                "type": r[1],
                "key": r[2],
                "content": r[3],
                "confidence": float(r[4] or 1.0),
                "updated_at": str(r[5])
            })
        return results
    except Exception as e:
        print(f"[Memory Get Error] {e}")
        if con:
            try: con.close()
            except Exception: pass
        return []

def record_daily_goal(period: str, gmv: float, conv: float = 0.0, aov: float = 0.0, rto: float = 0.0, target_gmv: float = 10000.0, notes: dict = None):
    """Records daily business performance and target alignment in store_goals table."""
    con = _get_con()
    if not con:
        return False
    try:
        progress = round((gmv / target_gmv) * 100, 2) if target_gmv > 0 else 0.0
        json_notes = json.dumps(notes or {})
        con.run("""
            INSERT INTO store_goals (
                period, target_gmv_inr, current_gmv_inr,
                target_conversion_pct, current_conversion_pct,
                target_aov_inr, current_aov_inr,
                target_rto_pct, current_rto_pct,
                progress_pct, notes, updated_at
            ) VALUES (
                :period, :tgmv, :cgmv,
                2.50, :cconv,
                1850.00, :caov,
                12.00, :crto,
                :prog, :notes::jsonb, NOW()
            )
            ON CONFLICT (period) DO UPDATE SET
                current_gmv_inr = EXCLUDED.current_gmv_inr,
                current_conversion_pct = EXCLUDED.current_conversion_pct,
                current_aov_inr = EXCLUDED.current_aov_inr,
                current_rto_pct = EXCLUDED.current_rto_pct,
                progress_pct = EXCLUDED.progress_pct,
                notes = EXCLUDED.notes,
                updated_at = NOW()
        """,
            period=period.strip(),
            tgmv=float(target_gmv),
            cgmv=float(gmv),
            cconv=float(conv),
            caov=float(aov),
            crto=float(rto),
            prog=float(progress),
            notes=json_notes
        )
        con.close()
        return True
    except Exception as e:
        print(f"[Goals Record Error] {e}")
        if con:
            try: con.close()
            except Exception: pass
        return False

def get_latest_goal():
    """Retrieves the latest store goals and metrics."""
    con = _get_con()
    if not con:
        return None
    try:
        rows = con.run("""
            SELECT period, target_gmv_inr, current_gmv_inr, target_conversion_pct,
                   current_conversion_pct, target_aov_inr, current_aov_inr,
                   target_rto_pct, current_rto_pct, progress_pct, notes, updated_at
            FROM store_goals
            ORDER BY updated_at DESC LIMIT 1
        """)
        con.close()
        if not rows:
            return None
        r = rows[0]
        return {
            "period": r[0],
            "target_gmv_inr": float(r[1] or 10000),
            "current_gmv_inr": float(r[2] or 0),
            "target_conversion_pct": float(r[3] or 2.5),
            "current_conversion_pct": float(r[4] or 0),
            "target_aov_inr": float(r[5] or 1850),
            "current_aov_inr": float(r[6] or 0),
            "target_rto_pct": float(r[7] or 12.0),
            "current_rto_pct": float(r[8] or 0),
            "progress_pct": float(r[9] or 0),
            "notes": r[10] or {},
            "updated_at": str(r[11])
        }
    except Exception as e:
        print(f"[Goals Get Error] {e}")
        if con:
            try: con.close()
            except Exception: pass
        return None
