import os
from pathlib import Path
from typing import Any
from dots_gateway.config import settings

SAFE_EXTENSIONS = {
    ".md": "markdown",
    ".txt": "text",
    ".py": "python",
    ".json": "json",
    ".csv": "csv",
    ".ts": "typescript",
    ".tsx": "typescript-react",
    ".js": "javascript",
    ".html": "html",
    ".css": "css",
    ".yml": "yaml",
    ".yaml": "yaml",
    ".jpg": "image",
    ".png": "image",
    ".mp4": "video"
}

IGNORED_DIRS = {
    ".git",
    "node_modules",
    "__pycache__",
    ".next",
    ".vercel",
    ".turbo",
    "dist",
    "build"
}

class FileManager:
    def __init__(self, root_dir: Path | str = settings.WORKSPACE_PATH):
        self.root_dir = Path(root_dir).resolve()

    def list_files(self, limit: int = 150) -> list[dict[str, Any]]:
        results = []
        try:
            for root, dirs, files in os.walk(self.root_dir):
                dirs[:] = [d for d in dirs if d not in IGNORED_DIRS and not d.startswith(".")]
                for file in files:
                    file_path = Path(root) / file
                    try:
                        rel_path = file_path.relative_to(self.root_dir).as_posix()
                        stat = file_path.stat()
                        ext = file_path.suffix.lower()
                        results.append({
                            "name": file,
                            "path": rel_path,
                            "extension": ext,
                            "type": SAFE_EXTENSIONS.get(ext, "file"),
                            "size_bytes": stat.st_size,
                            "modified_at": stat.st_mtime,
                            "is_image": ext in [".jpg", ".png", ".webp", ".svg"],
                            "is_code": ext in [".py", ".ts", ".tsx", ".js", ".json", ".sql", ".sh"]
                        })
                    except Exception:
                        continue
                    if len(results) >= limit:
                        break
                if len(results) >= limit:
                    break
        except Exception as e:
            print(f"File listing error: {e}")
        results.sort(key=lambda x: x["modified_at"], reverse=True)
        return results

    def read_file_content(self, relative_path: str) -> dict[str, Any]:
        target = (self.root_dir / relative_path).resolve()
        # Security: Prevent Directory Traversal
        if not str(target).startswith(str(self.root_dir)):
            return {"error": "Access Denied: Path outside workspace sandbox"}
        if not target.exists() or not target.is_file():
            return {"error": "File not found"}
        
        ext = target.suffix.lower()
        if ext in [".jpg", ".png", ".jpeg", ".mp4", ".pdf"]:
            return {
                "path": relative_path,
                "name": target.name,
                "is_binary": True,
                "type": SAFE_EXTENSIONS.get(ext, "binary"),
                "size_bytes": target.stat().st_size
            }

        try:
            with open(target, "r", encoding="utf-8", errors="replace") as f:
                content = f.read(500_000) # Max 500KB preview
            return {
                "path": relative_path,
                "name": target.name,
                "is_binary": False,
                "type": SAFE_EXTENSIONS.get(ext, "text"),
                "content": content,
                "size_bytes": target.stat().st_size
            }
        except Exception as e:
            return {"error": f"Failed to read file: {str(e)}"}

file_manager = FileManager()
