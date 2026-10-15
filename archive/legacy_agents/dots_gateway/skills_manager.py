import os
import re
import time
from pathlib import Path
from typing import Any, Dict, List, Optional
from pydantic import BaseModel
import requests

from dots_gateway.config import settings

class SkillInfo(BaseModel):
    name: str
    category: str
    description: str
    path: str
    full_content: str
    created_at: float
    is_custom: bool = False

class SkillsManager:
    def __init__(self, root_skills_dir: Path = settings.SKILLS_PATH):
        self.root_dir = Path(root_skills_dir).resolve()
        self.custom_dir = self.root_dir / "custom"
        self.custom_dir.mkdir(parents=True, exist_ok=True)

    def list_skills(self) -> List[Dict[str, Any]]:
        results: List[Dict[str, Any]] = []
        if not self.root_dir.exists():
            return results

        for root, _, files in os.walk(self.root_dir):
            for file in files:
                if file.lower() == "skill.md":
                    skill_file = Path(root) / file
                    try:
                        rel_path = skill_file.relative_to(self.root_dir).as_posix()
                        parts = rel_path.split("/")
                        category = parts[0] if len(parts) > 1 else "general"
                        
                        content = skill_file.read_text(encoding="utf-8", errors="replace")
                        metadata = self._parse_frontmatter(content)
                        stat = skill_file.stat()

                        name = metadata.get("name") or (parts[-2] if len(parts) > 1 else skill_file.parent.name)
                        desc = metadata.get("description") or "Hermes automated skill workflow"

                        results.append({
                            "name": name,
                            "category": category,
                            "description": desc,
                            "path": rel_path,
                            "size_bytes": stat.st_size,
                            "modified_at": stat.st_mtime,
                            "is_custom": category == "custom",
                            "full_content": content
                        })
                    except Exception as e:
                        print(f"Error parsing skill at {skill_file}: {e}")
                        continue

        results.sort(key=lambda s: s["modified_at"], reverse=True)
        return results

    def _parse_frontmatter(self, content: str) -> Dict[str, str]:
        meta = {}
        if content.startswith("---"):
            end_idx = content.find("---", 3)
            if end_idx != -1:
                frontmatter_raw = content[3:end_idx].strip()
                for line in frontmatter_raw.splitlines():
                    if ":" in line:
                        k, v = line.split(":", 1)
                        meta[k.strip()] = v.strip().strip("'\"")
        return meta

    def get_skill_content(self, relative_path: str) -> Dict[str, Any]:
        root = self.root_dir.resolve()
        target = (self.root_dir / relative_path).resolve()
        if target != root and not str(target).startswith(str(root) + os.sep):
            return {"error": "Skill file not found"}
        if not target.is_file():
            return {"error": "Skill file not found"}
        return {
            "path": relative_path,
            "content": target.read_text(encoding="utf-8", errors="replace")
        }

    async def distill_and_retain_skill(
        self,
        task_name: str,
        goal: str,
        solution_summary: str,
        commands_run: List[str] = [],
        category: str = "custom"
    ) -> Dict[str, Any]:
        """
        Hermes Skill Retention Loop:
        Automatically synthesizes and writes a version-controlled SKILL.md
        upon successful task execution.
        """
        slug = re.sub(r"[^a-z0-9_-]", "-", task_name.lower().strip()).strip("-")
        if not slug:
            slug = f"skill-{int(time.time())}"
        slug = slug[:60].strip("-") or f"skill-{int(time.time())}"
        cat = re.sub(r"[^a-z0-9_-]", "-", category.lower().strip()).strip("-") or "custom"

        skill_folder = self.root_dir / cat / slug
        skill_folder.mkdir(parents=True, exist_ok=True)
        skill_file = skill_folder / "SKILL.md"

        # Construct standard Hermes SKILL.md format
        frontmatter = f"""---
name: {slug}
description: {goal[:120]}
created_by: hermes-agent-skill-retention-loop
retained_at: {time.strftime("%Y-%m-%d %H:%M:%S")}
---

# {task_name} Skill

## Purpose
{goal}

## Verified Autonomous Workflow
{solution_summary}

## Reusable Commands & Scripts
"""
        if commands_run:
            frontmatter += "```bash\n" + "\n".join(commands_run) + "\n```\n"
        else:
            frontmatter += "Executed via Hermes internal autonomous LLM reasoning loop.\n"

        frontmatter += f"""
## Verification Standard
- Task marked as completed with 0 errors.
- Version-controlled under skills/{cat}/{slug}/SKILL.md.
"""

        skill_file.write_text(frontmatter, encoding="utf-8")

        return {
            "status": "retained",
            "skill_name": slug,
            "category": cat,
            "path": f"{cat}/{slug}/SKILL.md",
            "content": frontmatter
        }

skills_manager = SkillsManager()
