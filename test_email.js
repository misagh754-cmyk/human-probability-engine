const { chromium } = require('playwright');

(async () => {
    console.log("PLAYWRIGHT: Initializing headless browser...");
    try {
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();

        console.log("1. Logging into ProtonMail...");
        await page.goto("https://mail.proton.me/login");
        await page.waitForSelector('#username', { timeout: 15000 });
        await page.fill('#username', 'hpe.global2026');
        await page.fill('#password', 'HPE_Global_Sales_2026!');
        await page.click('button[type="submit"]');

        console.log("2. Waiting for Inbox (compose button)...");
        await page.waitForSelector('[data-testid="sidebar:compose"]', { timeout: 30000 });

        console.log("3. Opening compose window...");
        await page.click('[data-testid="sidebar:compose"]');

        console.log("4. Filling email details...");
        const recipient = "misagh754@gmail.com";
        const subject = "rainmaker is live";
        const body = `Hey CEO,\n\nThis is an automated verification email from THE RAINMAKER.\n\nThe autonomous outreach engine is now LIVE and operational.\nTimestamp: ${new Date().toISOString()}\nDaily Limit: 40 emails/day\nPrice Point: $199/conversion\n\nThe engine will now begin processing the lead queue.\n\n— HPE Rainmaker Engine v2.0`;

        await page.waitForSelector('[data-testid="roster-autocomplete-container"] input', { timeout: 15000 });
        await page.fill('[data-testid="roster-autocomplete-container"] input', recipient);
        await page.keyboard.press("Enter");

        await page.fill('[data-testid="composer:subject"]', subject);

        // Proton composer uses an iframe
        const frameElement = await page.waitForSelector('.composer-editor iframe', { timeout: 15000 });
        const frame = await frameElement.contentFrame();
        await frame.click('body');

        // We will insert plain text into the editor iframe
        await frame.fill('body', body);

        console.log("5. Sending email...");
        await page.click('[data-testid="composer:send-button"]');

        console.log("6. Verifying 'Message sent' popup...");
        await page.waitForSelector('text="Message sent"', { timeout: 20000 });
        console.log(`✓ SENT: Verification Email to ${recipient} via Proton WEB UI`);

        await browser.close();
    } catch (e) {
        console.error("✗ PLAYWRIGHT ERROR:", e);
        process.exit(1);
    }
})();
