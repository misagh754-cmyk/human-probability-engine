import asyncio
from playwright.async_api import async_playwright

async def test():
    try:
        async with async_playwright() as p:
            print("Launching browser...")
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            print("Navigating to ProtonMail...")
            await page.goto("https://mail.proton.me/login")
            
            print("Filling credentials...")
            await page.wait_for_selector('#username', timeout=10000)
            await page.fill('#username', 'hpe.global2026')
            await page.fill('#password', 'HPE_Global_Sales_2026!')
            await page.click('button[type="submit"]')
            
            print("Waiting for Inbox to load...")
            # Wait for the "New message" button or inbox wrapper
            await page.wait_for_selector('[data-testid="sidebar:compose"]', timeout=20000)
            print("Login successful! Inbox loaded.")
            
            await browser.close()
    except Exception as e:
        print(f"Error during test: {e}")

asyncio.run(test())
