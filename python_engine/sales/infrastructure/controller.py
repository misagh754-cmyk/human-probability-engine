import os
import random
import asyncio
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from typing import Dict, Any, List

# ── Gmail SMTP Configuration ──
# ProtonMail free does NOT support SMTP. Using Gmail with App Password.
# To generate: Google Account → Security → 2-Step Verification → App Passwords
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "misagh754@gmail.com")
SMTP_PASS = os.getenv("SMTP_PASS", "")  # Gmail App Password (16-char code)

class ScalingController:
    """
    Monitors MRR and triggers horizontal scaling.
    """
    TARGET_MRR = 100000.0

    def __init__(self, current_mrr: float):
        self.current_mrr = current_mrr

    def get_pacing(self) -> float:
        day_of_month = datetime.now().day
        days_in_month = 30
        target_pacing = (self.TARGET_MRR / days_in_month) * day_of_month
        if target_pacing == 0:
            return 1.0
        return self.current_mrr / target_pacing

    def trigger_scaling_if_needed(self):
        pacing = self.get_pacing()
        if pacing < 0.9:
            print(f"PACING CRITICAL: {pacing:.2f}. Maintaining stealth volume.")
            return {"action": "MAINTAIN_VOLUME", "pacing": pacing}
        return {"action": "PACING_OPTIMAL", "pacing": pacing}


class StealthSender:
    """
    Production SMTP sender via ProtonMail Bridge with human-like delays.
    """
    _sent_count = 0
    DAILY_LIMIT = 40  # ProtonMail safe limit per account per day

    @staticmethod
    async def send_email(subject: str, body: str, recipient: str, sender_name: str = "HPE Analytics") -> bool:
        """
        Sends a real email via ProtonMail SMTP.
        """
        if not SMTP_PASS:
            print(f"ERROR: SMTP_PASS not set. Cannot send email to {recipient}.")
            return False

        if StealthSender._sent_count >= StealthSender.DAILY_LIMIT:
            print(f"LIMIT: Daily send limit ({StealthSender.DAILY_LIMIT}) reached. Pausing until next cycle.")
            return False

        msg = MIMEMultipart("alternative")
        msg["From"] = f"{sender_name} <{SMTP_USER}>"
        msg["To"] = recipient
        msg["Subject"] = subject
        msg["X-Mailer"] = ""  # Strip mailer header

        # Plain text version
        msg.attach(MIMEText(body, "plain"))

        # HTML version with minimal formatting
        html_body = f"""<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; color: #333; line-height: 1.6;">
{body.replace(chr(10), '<br>')}
<br><br>
<span style="color: #999; font-size: 11px;">Sent from HPE Analytics | <a href="https://human-probability-enginehuman.onrender.com" style="color: #0ea5e9;">humanprobability.ai</a></span>
</div>"""
        msg.attach(MIMEText(html_body, "html"))

        try:
            await aiosmtplib.send(
                msg,
                hostname=SMTP_HOST,
                port=SMTP_PORT,
                start_tls=True,
                username=SMTP_USER,
                password=SMTP_PASS,
            )
            StealthSender._sent_count += 1
            print(f"✓ SENT [{StealthSender._sent_count}]: Email to {recipient} | Subject: {subject}")
            return True
        except Exception as e:
            print(f"✗ SMTP ERROR sending to {recipient}: {e}")
            return False

    @staticmethod
    async def send_with_delay(subject: str, body: str, recipient: str):
        """
        Sends with a human-like random delay (2-8 minutes in production).
        """
        delay_seconds = random.randint(120, 480)  # 2 to 8 minutes
        print(f"STEALTH: Queuing email to {recipient}. Delay: {delay_seconds/60:.1f} mins.")
        await asyncio.sleep(delay_seconds)
        return await StealthSender.send_email(subject, body, recipient)
