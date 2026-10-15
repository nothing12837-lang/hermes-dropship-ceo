import json
import os
import sys
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

USER_DATA_DIR = Path("dots_gateway/browser_data")
USER_DATA_DIR.mkdir(parents=True, exist_ok=True)
COOKIES_FILE = Path("browser_cookies.json")

def start_login_or_verify(verification_code: str = None):
    print("Launching Chromium session...")
    with sync_playwright() as p:
        browser = p.chromium.launch_persistent_context(
            user_data_dir=str(USER_DATA_DIR),
            headless=True,
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 800}
        )
        page = browser.pages[0] if browser.pages else browser.new_page()

        if verification_code:
            print(f"Attempting to submit verification code: {verification_code}...")
            # We are entering code on whatever current screen or navigating back to login
            inputs = page.locator('input[type="text"], input[name="verificationCode"], input[name="code"], input[type="number"]').all()
            if inputs:
                inputs[0].fill(verification_code)
                time.sleep(1)
                # Look for Continue button
                btn = page.locator('button:has-text("Continue"), button:has-text("Confirm"), button[type="submit"]').first
                if btn.count() > 0:
                    btn.click()
                else:
                    inputs[0].press("Enter")
                page.wait_for_timeout(8000)
                print("After code submission URL:", page.url)
                page.screenshot(path="ig_after_code.jpg")
                cookies = browser.cookies()
                COOKIES_FILE.write_text(json.dumps(cookies, indent=2), encoding="utf-8")
                cookie_names = [c["name"] for c in cookies]
                if "sessionid" in cookie_names or "ds_user_id" in cookie_names:
                    print(">>> SUCCESS: Active authenticated session established & saved!")
                    browser.close()
                    return True
                else:
                    print(f"Cookies captured: {cookie_names}")
                    browser.close()
                    return False

        # Otherwise initial login flow
        print("Navigating to https://www.instagram.com/accounts/login/ ...")
        page.goto("https://www.instagram.com/accounts/login/", timeout=45000)
        page.wait_for_timeout(5000)

        # Check if already logged in
        if "instagram.com/accounts/login" not in page.url:
            print(f"Already logged in! Current URL: {page.url}")
            cookies = browser.cookies()
            COOKIES_FILE.write_text(json.dumps(cookies, indent=2), encoding="utf-8")
            browser.close()
            return True

        # Enter credentials
        print("Filling credentials for @RareEmber...")
        email_inp = page.locator('input[name="email"]')
        if email_inp.count() > 0:
            email_inp.fill("RareEmber")
            page.locator('input[name="pass"]').fill("Ajay@j@y#1860")
            page.locator('input[name="pass"]').press("Enter")
        else:
            page.locator('input[name="username"]').fill("RareEmber")
            page.locator('input[name="password"]').fill("Ajay@j@y#1860")
            page.locator('input[name="password"]').press("Enter")

        page.wait_for_timeout(8000)
        print("Current URL after submit:", page.url)
        page.screenshot(path="ig_status.jpg")

        cookies = browser.cookies()
        COOKIES_FILE.write_text(json.dumps(cookies, indent=2), encoding="utf-8")
        cookie_names = [c["name"] for c in cookies]

        if "sessionid" in cookie_names or "ds_user_id" in cookie_names:
            print(">>> SUCCESS: Active authenticated session established!")
            browser.close()
            return True
        else:
            body_text = page.locator("body").inner_text()
            if "Check your email" in body_text or "Enter the code" in body_text:
                print(">>> STATUS: Verification code sent to rareemberagency@gmail.com! Waiting for code...")
            else:
                print("Status snippet:", body_text[:250].encode("ascii", "ignore").decode())
            browser.close()
            return False

if __name__ == "__main__":
    code = sys.argv[1] if len(sys.argv) > 1 else None
    start_login_or_verify(code)
