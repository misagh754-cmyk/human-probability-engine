import asyncio
import json
import os
import sys
from datetime import datetime

# Add parent directory to path so we can import from sales/
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "sales"))

from dotenv import load_dotenv
load_dotenv()

from sales.infrastructure.controller import ScalingController, StealthSender
from sales.ai.outreach import RainmakerAI


LEADS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "leads.json")
SENT_LOG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sent_log.json")
CYCLE_INTERVAL = 86400  # 24 hours


def load_leads():
    """Load leads from JSON file."""
    try:
        with open(LEADS_FILE, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"ERROR: {LEADS_FILE} not found.")
        return []


def load_sent_log():
    """Load the log of already-sent emails to avoid duplicates."""
    try:
        with open(SENT_LOG, "r") as f:
            return set(json.load(f))
    except (FileNotFoundError, json.JSONDecodeError):
        return set()


def save_sent_log(sent_set):
    """Persist the sent log."""
    with open(SENT_LOG, "w") as f:
        json.dump(list(sent_set), f, indent=2)


async def run_cycle(leads, sent_log, ai):
    """Run one outreach cycle: generate + send for unsent leads."""
    controller = ScalingController(current_mrr=0.0)
    scaling = controller.trigger_scaling_if_needed()
    print(f"SCALING: {scaling}")

    sent_this_cycle = 0

    for lead in leads:
        email_addr = lead["email"]

        # Skip already contacted
        if email_addr in sent_log:
            print(f"SKIP: {email_addr} (already contacted)")
            continue

        # SANITY CHECK: Hard-filter fake/placeholder data
        if email_addr.lower().startswith("lead_") or "placeholder" in email_addr.lower() or "@" not in email_addr:
            print(f"⚠️  REJECTED FAKE LEAD: {email_addr} | Reason: Mock/Invalid address.")
            continue

        # Daily limit check
        if StealthSender._sent_count >= StealthSender.DAILY_LIMIT:
            print(f"DAILY LIMIT REACHED ({StealthSender.DAILY_LIMIT}). Stopping cycle.")
            break

        # Generate personalized email via Gemini
        print(f"\n--- Generating outreach for {lead['name']} ({lead['startup']}) ---")
        outreach = ai.generate_outreach(
            name=lead["name"],
            startup=lead["startup"],
            hook=lead["hook"]
        )

        print(f"  SUBJECT: {outreach.subject}")
        print(f"  BODY: {outreach.body[:80]}...")

        # Send with human-like delay
        success = await StealthSender.send_with_delay(
            subject=outreach.subject,
            body=outreach.body,
            recipient=email_addr
        )

        if success:
            sent_log.add(email_addr)
            save_sent_log(sent_log)
            sent_this_cycle += 1

    print(f"\n=== CYCLE COMPLETE: {sent_this_cycle} emails sent this cycle ===")
    return sent_this_cycle


async def send_test_email():
    """Send a single immediate test email to the CEO to verify pipeline."""
    print("\n" + "=" * 60)
    print("RAINMAKER TEST MODE: Sending verification email to CEO...")
    print("=" * 60)

    success = await StealthSender.send_email(
        subject="rainmaker is live",
        body=(
            "Hey CEO,\n\n"
            "This is an automated verification email from THE RAINMAKER.\n\n"
            "The autonomous outreach engine is now LIVE and operational.\n"
            f"Timestamp: {datetime.utcnow().isoformat()}Z\n"
            f"Daily Limit: {StealthSender.DAILY_LIMIT} emails/day\n"
            f"Price Point: $199/conversion\n\n"
            "The engine will now begin processing the lead queue.\n\n"
            "— HPE Rainmaker Engine v2.0"
        ),
        recipient="misagh754@gmail.com",
        sender_name="HPE Rainmaker"
    )

    if success:
        print("✓ TEST EMAIL SENT SUCCESSFULLY to misagh754@gmail.com")
    else:
        print("✗ TEST EMAIL FAILED — check SMTP credentials")

    return success


async def main():
    print("\n" + "=" * 60)
    print(f"THE RAINMAKER v2.0 — Starting at {datetime.utcnow().isoformat()}Z")
    print(f"SMTP User: {os.getenv('SMTP_USER', 'NOT SET')}")
    print(f"SMTP Pass: {'SET' if os.getenv('SMTP_PASS') else 'NOT SET'}")
    print(f"Gemini Key: {'SET' if os.getenv('GEMINI_API_KEY') else 'NOT SET'}")
    print("=" * 60)

    # Step 1: Load leads
    leads = load_leads()
    if not leads:
        print("WARNING: No leads loaded. Waiting for leads.json to be populated.")

    sent_log = load_sent_log()
    ai = RainmakerAI()

    print(f"\nLEADS LOADED: {len(leads)} total, {len(sent_log)} already contacted")
    print(f"REMAINING: {len(leads) - len(sent_log)} to process")

    # Step 3: Main loop
    while True:
        print(f"\n--- NEW CYCLE: {datetime.utcnow().isoformat()}Z ---")

        # Reset daily counter at cycle start
        StealthSender._sent_count = 0

        # Reload leads (allows hot-loading new leads)
        leads = load_leads()
        sent_log = load_sent_log()

        if leads:
            StealthSender.report_heartbeat("PROCESSING_QUEUE")
            await run_cycle(leads, sent_log, ai)
        else:
            StealthSender.report_heartbeat("IDLE_NO_LEADS")
            print("No leads to process. Sleeping until next cycle.")

        print(f"\nSLEEPING {CYCLE_INTERVAL // 3600} HOURS UNTIL NEXT CYCLE...")
        await asyncio.sleep(CYCLE_INTERVAL)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nRAINMAKER STOPPED BY OPERATOR.")
