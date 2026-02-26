import asyncio
import os
import sys

# Add python_engine to path so imports work
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "python_engine"))

# Inject the provided App Password
os.environ["SMTP_PASS"] = "lqqnoolxcahfcdir"
os.environ["SMTP_USER"] = "misagh754@gmail.com"

from sales.infrastructure.controller import StealthSender

async def main():
    print("="*60)
    print("IGNITING FULL FIRE MODE: Dispatching CEO Verification Email...")
    print("="*60)
    success = await StealthSender.send_email(
        subject="rainmaker is live",
        body=(
            "Hey CEO,\n\n"
            "This is an automated verification email from THE RAINMAKER.\n\n"
            "The autonomous outreach engine is now LIVE and operational.\n"
            "Daily Limit: 40 emails/day\n"
            "Price Point: $199/conversion\n\n"
            "The engine will now begin processing the 342 identified startup leads.\n\n"
            "— HPE Rainmaker Engine v2.0"
        ),
        recipient="misagh754@gmail.com",
        sender_name="HPE Rainmaker"
    )
    if success:
        print("✓ FULL FIRE TEST EMAIL SENT TO INBOX")
    else:
        print("✗ EMAIL SEND FAILED (Check App Password formatting)")

asyncio.run(main())
