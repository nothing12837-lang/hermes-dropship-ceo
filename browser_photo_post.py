import os
import sys
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

USER_DATA_DIR = Path("dots_gateway/browser_data").resolve()

def post_feed_photo(photo_path: str, caption: str):
    """
    Publishes a 1080x1350 or 1:1 feed photo to @RareEmber on Instagram
    using the verified Playwright persistent browser session.
    """
    abs_photo = Path(photo_path).resolve()
    if not abs_photo.exists():
        print(f"❌ Error: Photo file not found: {abs_photo}")
        return {"ok": False, "reason": f"File not found: {abs_photo}"}

    print(f"🚀 Publishing Feed Photo to @RareEmber: {abs_photo.name} ({abs_photo.stat().st_size} bytes)...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch_persistent_context(
            user_data_dir=str(USER_DATA_DIR),
            headless=True,
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 800}
        )
        page = browser.pages[0] if browser.pages else browser.new_page()
        
        try:
            print("🌐 Navigating to Instagram home...")
            page.goto("https://www.instagram.com/", timeout=45000)
            page.wait_for_timeout(3000)

            # Clear any leftover dialogs
            page.keyboard.press("Escape")
            page.wait_for_timeout(500)
            discard = page.locator('button:has-text("Discard")')
            if discard.count() > 0:
                discard.first.click()
                page.wait_for_timeout(1000)

            # 1. Click Create button
            create_elem = page.locator('svg[aria-label="New post"]').first
            if create_elem.count() == 0:
                create_elem = page.locator('span:text-is("Create"), a:has-text("Create")').first

            if create_elem.count() == 0:
                print("❌ Create button not found. Not logged in?")
                page.screenshot(path="ig_photo_auth_fail.jpg")
                browser.close()
                return {"ok": False, "reason": "Not logged in or Create button missing"}

            print("➕ Clicking Create button...")
            create_elem.click()
            page.wait_for_timeout(1000)

            # Select Post if menu dropdown appears
            post_option = page.locator('div[role="dialog"] a, div[role="menu"] div, span:text-is("Post")').first
            if post_option.count() > 0 and post_option.is_visible():
                post_option.click()
                page.wait_for_timeout(1500)

            # 2. Attach Image File
            file_input = page.locator('input[type="file"]').first
            if file_input.count() == 0:
                print("❌ File input element not found!")
                browser.close()
                return {"ok": False, "reason": "File input not found"}

            print(f"📤 Uploading photo file {abs_photo.name}...")
            file_input.set_input_files(str(abs_photo))
            page.wait_for_timeout(3000)

            # Locate the Create Dialog
            dialog = page.locator('div[role="dialog"]').first
            if dialog.count() == 0:
                dialog = page

            # Step 1: Click Next on preview
            next1 = dialog.locator('div[role="button"]:has-text("Next")').first
            if next1.count() > 0 and next1.is_visible():
                print("➡️ Clicking Next (Preview -> Filter)...")
                next1.click()
                page.wait_for_timeout(2000)

            # Step 2: Click Next on filter
            next2 = dialog.locator('div[role="button"]:has-text("Next")').first
            if next2.count() > 0 and next2.is_visible():
                print("➡️ Clicking Next (Filter -> Caption)...")
                next2.click()
                page.wait_for_timeout(2500)

            # Step 3: Fill Caption
            cap = dialog.locator('div[aria-label="Add a caption..."]').first
            if cap.count() > 0 and cap.is_visible():
                print("✍️ Filling post caption...")
                cap.fill(caption)
                page.wait_for_timeout(1500)
            else:
                print("⚠️ Caption field not detected, continuing...")

            # Step 4: Click Share in the Dialog Header
            share_btn = dialog.locator('div[role="button"]:has-text("Share")').first
            if share_btn.count() > 0:
                print("🚀 Clicking 'Share' button in dialog header...")
                share_btn.click()
                
                print("⏳ Waiting for Instagram photo upload to complete...")
                shared_confirmed = False
                for _ in range(12):
                    page.wait_for_timeout(2500)
                    shared_dialog = page.locator('span:has-text("Your post has been shared"), div:has-text("Your post has been shared")')
                    if shared_dialog.count() > 0:
                        print("🎉 Confirmed: 'Your post has been shared.' displayed by Instagram!")
                        shared_confirmed = True
                        break
                
                # Navigate to profile to verify live post
                post_url = ""
                try:
                    print("🔍 Verifying post on profile...")
                    page.goto("https://www.instagram.com/rareember/", timeout=30000)
                    page.wait_for_timeout(4000)
                    first_post = page.locator('article a, a[href*="/p/"]').first
                    if first_post.count() > 0:
                        href = first_post.get_attribute("href")
                        post_url = f"https://www.instagram.com{href}"
                        print(f"🔗 Live post link: {post_url}")
                    page.screenshot(path="ig_verified_grid.jpg")
                except Exception as pe:
                    print(f"Profile verification notice: {pe}")

                browser.close()
                return {"ok": True, "post_url": post_url, "reason": ""}
            else:
                print("❌ Dialog Share button not found!")
                browser.close()
                return {"ok": False, "reason": "Dialog Share button not found"}

        except Exception as e:
            print(f"❌ Exception during photo publishing: {e}")
            try:
                page.screenshot(path="ig_photo_exception.jpg")
            except Exception:
                pass
            browser.close()
            return {"ok": False, "reason": str(e)}

if __name__ == "__main__":
    test_photo = "generated_posts/post_meesho-water-sensor-led-diyas-pack-of-12_20261015_080945.jpg"
    test_caption = "Testing RareEmber Feed Image Autopilot 🪔✨"
    if len(sys.argv) > 1:
        test_photo = sys.argv[1]
    if len(sys.argv) > 2:
        test_caption = sys.argv[2]
    res = post_feed_photo(test_photo, test_caption)
    print("Result:", res)
