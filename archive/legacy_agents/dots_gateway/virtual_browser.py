"""
Hermes Dots Virtual Browser Engine
Powers the agent's dedicated virtual laptop screen using Playwright Headless Chromium.
"""

import os
import sys
import asyncio
import base64
import time
from typing import Optional, Dict, Any, List

# Try importing Playwright
PLAYWRIGHT_AVAILABLE = False
try:
    from playwright.async_api import async_playwright, Browser, Page, Playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    pass

class VirtualBrowserManager:
    def __init__(self):
        self.playwright: Optional[Any] = None
        self.browser: Optional[Any] = None
        self.page: Optional[Any] = None
        self.current_url: str = "https://rareember-store.vercel.app"
        self.current_title: str = "RareEmber | Rare finds, daily drops"
        self.last_screenshot_b64: str = ""
        self.logs: List[Dict[str, Any]] = []
        self.is_navigating: bool = False
        self._lock = asyncio.Lock()
        self.started_at: float = time.time()
        self.history: List[str] = [self.current_url]
        self.history_index: int = 0

    def _log(self, action: str, details: str, level: str = "info"):
        entry = {
            "timestamp": time.time(),
            "time_str": time.strftime("%H:%M:%S"),
            "action": action,
            "details": details,
            "level": level
        }
        self.logs.append(entry)
        if len(self.logs) > 100:
            self.logs = self.logs[-100:]
        print(f"[{entry['time_str']}] [VirtualLaptop] {action}: {details}")

    async def initialize(self):
        """Initializes headless Chromium browser."""
        if not PLAYWRIGHT_AVAILABLE:
            self._log("init_warning", "Playwright not installed, running in mock/screenshot fallback mode", "warn")
            return

        async with self._lock:
            if self.browser is not None:
                return

            try:
                self.playwright = await async_playwright().start()
                self.browser = await self.playwright.chromium.launch(
                    headless=True,
                    args=[
                        "--no-sandbox",
                        "--disable-setuid-sandbox",
                        "--disable-dev-shm-usage",
                        "--disable-accelerated-2d-canvas",
                        "--disable-gpu"
                    ]
                )
                context = await self.browser.new_context(
                    viewport={"width": 1280, "height": 800},
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 RadhaExecutive/1.0"
                )
                self.page = await context.new_page()
                self._log("init_success", "Playwright Chromium 128 initialized (1280x800)", "info")
                
                # Navigate to default store URL
                await self._navigate_internal(self.current_url)
            except Exception as e:
                self._log("init_error", str(e), "error")

    async def _navigate_internal(self, url: str) -> Dict[str, Any]:
        """Internal page navigation and screenshot capture."""
        if not url.startswith("http://") and not url.startswith("https://"):
            url = "https://" + url

        self.current_url = url
        self.is_navigating = True
        start_time = time.time()
        self._log("navigate_start", f"Navigating to {url}", "info")

        if self.page is not None:
            try:
                await self.page.goto(url, wait_until="domcontentloaded", timeout=20000)
                self.current_title = await self.page.title()
                
                # Take screenshot as base64 png
                screenshot_bytes = await self.page.screenshot(type="jpeg", quality=75)
                self.last_screenshot_b64 = f"data:image/jpeg;base64,{base64.b64encode(screenshot_bytes).decode('utf-8')}"
                
                duration = round(time.time() - start_time, 2)
                self._log("navigate_success", f"Loaded '{self.current_title}' in {duration}s", "info")
                self.is_navigating = False
                return {
                    "url": self.current_url,
                    "title": self.current_title,
                    "duration_seconds": duration,
                    "screenshot": self.last_screenshot_b64,
                    "status": "ok"
                }
            except Exception as e:
                self.is_navigating = False
                self._log("navigate_error", f"Failed to load {url}: {e}", "error")
                return {
                    "url": self.current_url,
                    "title": f"Navigation Error: {url}",
                    "error": str(e),
                    "status": "error",
                    "screenshot": self.last_screenshot_b64
                }
        else:
            # Fallback if browser failed to start
            self.is_navigating = False
            self.current_title = f"Preview: {url}"
            self._log("navigate_simulated", f"Simulated navigation to {url}", "info")
            return {
                "url": self.current_url,
                "title": self.current_title,
                "status": "simulated",
                "screenshot": ""
            }

    async def navigate(self, url: str) -> Dict[str, Any]:
        if self.page is None:
            await self.initialize()

        async with self._lock:
            res = await self._navigate_internal(url)
            if self.history[-1] != self.current_url:
                self.history.append(self.current_url)
                self.history_index = len(self.history) - 1
            return res

    async def click(self, selector: str) -> Dict[str, Any]:
        """Simulate mouse click on an element."""
        if not self.page:
            return {"error": "Browser not initialized", "status": "error"}

        async with self._lock:
            try:
                self._log("mouse_click", f"Clicking selector '{selector}'", "info")
                await self.page.click(selector, timeout=5000)
                await asyncio.sleep(0.5)
                # refresh screenshot
                screenshot_bytes = await self.page.screenshot(type="jpeg", quality=75)
                self.last_screenshot_b64 = f"data:image/jpeg;base64,{base64.b64encode(screenshot_bytes).decode('utf-8')}"
                self.current_title = await self.page.title()
                return {
                    "status": "ok",
                    "action": "click",
                    "selector": selector,
                    "title": self.current_title,
                    "screenshot": self.last_screenshot_b64
                }
            except Exception as e:
                self._log("click_error", str(e), "error")
                return {"status": "error", "error": str(e)}

    async def extract_data(self) -> Dict[str, Any]:
        """Extracts text, headings, and images from the active page."""
        if not self.page:
            return {"error": "Browser not initialized", "status": "error"}

        async with self._lock:
            try:
                title = await self.page.title()
                url = self.page.url
                
                # Run JS evaluation to get structured page content
                data = await self.page.evaluate('''() => {
                    const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.innerText.trim()).filter(Boolean).slice(0, 10);
                    const prices = Array.from(document.querySelectorAll('*')).filter(el => /₹\s*[\d,]+|\$\s*[\d.]+/.test(el.innerText)).map(el => el.innerText.trim()).slice(0, 10);
                    const images = Array.from(document.querySelectorAll('img')).map(img => img.src).filter(src => src.startsWith('http')).slice(0, 8);
                    const bodySnippet = document.body ? document.body.innerText.slice(0, 500).replace(/\\s+/g, ' ') : '';
                    return { headings, prices, images, bodySnippet };
                }''')
                
                self._log("extract_success", f"Extracted {len(data.get('headings', []))} headings and {len(data.get('images', []))} images from {url}", "info")
                return {
                    "status": "ok",
                    "url": url,
                    "title": title,
                    "data": data
                }
            except Exception as e:
                self._log("extract_error", str(e), "error")
                return {"status": "error", "error": str(e)}

    async def take_screenshot(self) -> str:
        """Returns base64 screenshot."""
        if not self.page:
            return self.last_screenshot_b64

        async with self._lock:
            try:
                screenshot_bytes = await self.page.screenshot(type="jpeg", quality=75)
                self.last_screenshot_b64 = f"data:image/jpeg;base64,{base64.b64encode(screenshot_bytes).decode('utf-8')}"
                return self.last_screenshot_b64
            except Exception as e:
                self._log("screenshot_error", str(e), "error")
                return self.last_screenshot_b64

    def get_status(self) -> Dict[str, Any]:
        """Returns metadata regarding the virtual browser laptop."""
        return {
            "browser_engine": "Chromium 128 (Headless)",
            "os_environment": "Ubuntu Linux / Windows Virtual Host",
            "resolution": "1280x800 (16:10 Laptop Canvas)",
            "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 RadhaExecutive/1.0",
            "current_url": self.current_url,
            "current_title": self.current_title,
            "is_navigating": self.is_navigating,
            "has_screenshot": bool(self.last_screenshot_b64),
            "logs_count": len(self.logs),
            "recent_logs": self.logs[-10:],
            "history": self.history,
            "uptime_seconds": round(time.time() - self.started_at, 1)
        }

    async def close(self):
        async with self._lock:
            if self.browser:
                await self.browser.close()
                self.browser = None
            if self.playwright:
                await self.playwright.stop()
                self.playwright = None

# Global instance
virtual_browser = VirtualBrowserManager()
