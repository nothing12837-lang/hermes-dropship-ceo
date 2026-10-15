"""
Radha Cloud & Persistent Memory Module
Provides resilient, multi-tiered episodic, semantic, and procedural memory
stored directly in Supabase Cloud PostgreSQL with local fallback cache.
Zero laptop load — cloud-native architecture.
"""

import os
import json
import ssl
from pathlib import Path
from datetime import datetime, timezone

try:
    from dotenv import load_dotenv
    _env_path = Path(__file__).resolve().parent.parent / ".env"
    if _env_path.exists():
        load_dotenv(_env_path)
    else:
        load_dotenv()
except Exception:
    pass

import pg8000.native

BASE_DIR = Path(__file__).resolve().parent.parent
LOCAL_MEMORY_DIR = BASE_DIR / "RADHA_MEMORY"
LOCAL_MEMORY_DIR.mkdir(parents=True, exist_ok=True)
LEGACY_MEMORY_DIR = BASE_DIR / "HERMES_MEMORY"

def _get_con():
    db_pass = os.environ.get("SUPABASE_DB_PASS", "").strip()
    if not db_pass:
        return None
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        return pg8000.native.Connection(
            user=os.environ.get("SUPABASE_DB_USER", "postgres").strip(),
            host=os.environ.get("SUPABASE_DB_HOST", "db.qdkkxpfhwrwyoardlceo.supabase.co").strip(),
            port=5432,
            database=os.environ.get("SUPABASE_DB_NAME", "postgres").strip(),
            password=db_pass,
            ssl_context=ctx
        )
    except Exception as e:
        print(f"[Radha Memory DB] Connection note: {e}")
        return None

def save_memory(agent_name: str, memory_type: str, key: str, content: dict, confidence: float = 1.0):
    """
    Upserts memory record into Supabase agent_memory table.
    Also caches to local disk for offline resilience.
    """
    normalized_agent = agent_name.upper().strip()
    # Normalize HERMES to RADHA_CEO for unified memory
    if normalized_agent in ("HERMES", "HERMES_CEO"):
        normalized_agent = "RADHA_CEO"

    con = _get_con()
    saved_cloud = False
    if con:
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
                agent=normalized_agent,
                type=memory_type.lower().strip(),
                key=key.strip(),
                content=json_content,
                conf=float(confidence)
            )
            con.close()
            saved_cloud = True
        except Exception as e:
            print(f"[Radha Memory Save Error] {normalized_agent}:{key} -> {e}")
            if con:
                try: con.close()
                except Exception: pass

    # Always keep local backup JSON
    try:
        backup_file = LOCAL_MEMORY_DIR / f"{normalized_agent.lower()}_memory.json"
        data = {}
        if backup_file.exists():
            try:
                with open(backup_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
            except Exception:
                data = {}
        if memory_type not in data:
            data[memory_type] = {}
        data[memory_type][key] = {
            "content": content,
            "confidence": confidence,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        with open(backup_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception:
        pass

    return saved_cloud

def get_memory(agent_name: str, memory_type: str = None, key: str = None):
    """
    Retrieves memories for a given agent from Supabase with local fallback.
    """
    normalized_agent = agent_name.upper().strip()
    if normalized_agent in ("HERMES", "HERMES_CEO"):
        normalized_agent = "RADHA_CEO"

    con = _get_con()
    if con:
        try:
            if key and memory_type:
                rows = con.run("""
                    SELECT agent_name, memory_type, key, content, confidence, updated_at
                    FROM agent_memory
                    WHERE (agent_name = :agent OR agent_name = 'HERMES_CEO') AND memory_type = :type AND key = :key
                """, agent=normalized_agent, type=memory_type.lower().strip(), key=key.strip())
            elif memory_type:
                rows = con.run("""
                    SELECT agent_name, memory_type, key, content, confidence, updated_at
                    FROM agent_memory
                    WHERE (agent_name = :agent OR agent_name = 'HERMES_CEO') AND memory_type = :type
                    ORDER BY updated_at DESC LIMIT 50
                """, agent=normalized_agent, type=memory_type.lower().strip())
            else:
                rows = con.run("""
                    SELECT agent_name, memory_type, key, content, confidence, updated_at
                    FROM agent_memory
                    WHERE agent_name = :agent OR agent_name = 'HERMES_CEO'
                    ORDER BY updated_at DESC LIMIT 50
                """, agent=normalized_agent)
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
            if results:
                return results
        except Exception as e:
            print(f"[Radha Memory Get Error] {e}")
            if con:
                try: con.close()
                except Exception: pass

    # Fallback to local memory file
    try:
        backup_file = LOCAL_MEMORY_DIR / f"{normalized_agent.lower()}_memory.json"
        if not backup_file.exists() and LEGACY_MEMORY_DIR.exists():
            legacy_file = LEGACY_MEMORY_DIR / f"{normalized_agent.lower()}_memory.json"
            if legacy_file.exists():
                backup_file = legacy_file
        if backup_file.exists():
            with open(backup_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                if memory_type and key:
                    entry = data.get(memory_type, {}).get(key)
                    return [entry] if entry else []
                elif memory_type:
                    return list(data.get(memory_type, {}).values())
                else:
                    all_entries = []
                    for t in data.values():
                        all_entries.extend(t.values())
                    return all_entries
    except Exception:
        pass

    return []

def record_daily_goal(period: str, gmv: float, conv: float = 0.0, aov: float = 0.0, rto: float = 0.0, target_gmv: float = 10000.0, notes: dict = None):
    """
    Records daily business performance and target alignment in store_goals table.
    """
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
        print(f"[Radha Goal Save Error] {e}")
        if con:
            try: con.close()
            except Exception: pass
        return False

def get_latest_goal():
    """Retrieves the most recent store goal and actual achievement."""
    con = _get_con()
    if not con:
        return None
    try:
        rows = con.run("""
            SELECT period, target_gmv_inr, current_gmv_inr,
                   target_conversion_pct, current_conversion_pct,
                   target_aov_inr, current_aov_inr,
                   target_rto_pct, current_rto_pct,
                   progress_pct, notes, updated_at
            FROM store_goals
            ORDER BY period DESC LIMIT 1
        """)
        con.close()
        if not rows:
            return None
        r = rows[0]
        return {
            "period": r[0],
            "target_gmv_inr": float(r[1] or 0),
            "current_gmv_inr": float(r[2] or 0),
            "target_conversion_pct": float(r[3] or 0),
            "current_conversion_pct": float(r[4] or 0),
            "target_aov_inr": float(r[5] or 0),
            "current_aov_inr": float(r[6] or 0),
            "target_rto_pct": float(r[7] or 0),
            "current_rto_pct": float(r[8] or 0),
            "progress_pct": float(r[9] or 0),
            "notes": r[10],
            "updated_at": str(r[11])
        }
    except Exception as e:
        print(f"[Radha Goal Get Error] {e}")
        if con:
            try: con.close()
            except Exception: pass
        return None
