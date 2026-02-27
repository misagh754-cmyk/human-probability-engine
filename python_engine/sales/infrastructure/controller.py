import os
import random
import asyncio
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from typing import Dict, Any, List

# ── Gmail SMTP Configuration ──
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))

HEARTBEAT_FILE = "/tmp/hpe_heartbeat.json"

class CredentialPool:
    """
    Manages a pool of SMTP credentials for round-robin sending.
    """
    def __init__(self):
        self.credentials = []
        self._current_index = 0
        self._load_credentials()

    def _load_credentials(self):
        # 1. Load from legacy single env vars
        user = os.getenv("SMTP_USER", "misagh754@gmail.com")
        password = os.getenv("SMTP_PASS") or "lqqnoolxcahfcdir"
        if user and password:
            self.credentials.append({"user": user, "pass": password})

        # 2. Load from numbered env vars (SMTP_USER_1, SMTP_PASS_1, etc.)
        for i in range(1, 22): # Support up to 21 accounts
            u = os.getenv(f"SMTP_USER_{i}")
            p = os.getenv(f"SMTP_PASS_{i}")
            if u and p:
                # Avoid duplicates if the same user is in SMTP_USER
                if not any(c["user"] == u for c in self.credentials):
                    self.credentials.append({"user": u, "pass": p})
        
        print(f"POOL: Loaded {len(self.credentials)} SMTP accounts.")

    def get_next(self) -> Dict[str, str]:
        if not self.credentials:
            return None
        cred = self.credentials[self._current_index]
        self._current_index = (self._current_index + 1) % len(self.credentials)
        return cred

# Singleton instance for the engine
CRED_POOL = CredentialPool()


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
    Production SMTP sender with round-robin support and human-like delays.
    """
    _sent_count = 0
    DAILY_LIMIT = 40  # Per account limit
    BLOCKED_DOMAINS = set()

    @staticmethod
    async def send_email(subject: str, body: str, recipient: str, sender_name: str = "HPE Analytics") -> bool:
        """
        Sends an email using the next available credential from the pool.
        """
        cred = CRED_POOL.get_next()
        if not cred:
            print(f"ERROR: No SMTP credentials available in pool. Cannot send to {recipient}.")
            return False

        domain = recipient.split('@')[-1] if '@' in recipient else ""
        if domain in StealthSender.BLOCKED_DOMAINS:
            print(f"🚫 BLOCKED: Skipping {recipient} because domain {domain} is blacklisted (Relay/Firewall block).")
            return False

        # Per-account daily limit tracking could be added here, 
        # but for now we use a global stealth count for the engine.
        if StealthSender._sent_count >= (StealthSender.DAILY_LIMIT * len(CRED_POOL.credentials)):
            print(f"LIMIT: Global daily send limit reached. Pausing.")
            return False

        msg = MIMEMultipart("alternative")
        msg["From"] = f"{sender_name} <{cred['user']}>"
        msg["To"] = recipient
        msg["Subject"] = subject
        msg["X-Mailer"] = "" 

        msg.attach(MIMEText(body, "plain"))

        html_body = f"""<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; color: #333; line-height: 1.6;">
{body.replace(chr(10), '<br>')}
<br><br>
Run your Deep Scale Analysis here ($199): <a href="https://human-probability-enginehuman.onrender.com" style="color: #0ea5e9;">https://human-probability-enginehuman.onrender.com</a>
<br><br>
<span style="color: #999; font-size: 11px;">Sent from HPE Analytics</span>
</div>"""
        msg.attach(MIMEText(html_body, "html"))

        try:
            await aiosmtplib.send(
                msg,
                hostname=SMTP_HOST,
                port=SMTP_PORT,
                start_tls=True,
                username=cred['user'],
                password=cred['pass'],
            )
            StealthSender._sent_count += 1
            print(f"✓ SENT [{StealthSender._sent_count}]: Email to {recipient} via {cred['user']}")
            return True
        except Exception as e:
            error_msg = str(e).lower()
            print(f"✗ SMTP ERROR using {cred['user']} for {recipient}: {e}")
            
            # Detect Relay blocks and hard bounces to protect reputation
            if "relay access denied" in error_msg or "554 5.7.1" in error_msg or "550 5.1.1" in error_msg or "does not exist" in error_msg:
                print(f"⚠️ SHIELD ACTIVATED: Blacklisting domain {domain} to prevent future bounces.")
                StealthSender.BLOCKED_DOMAINS.add(domain)
                
            return False

    @staticmethod
    def report_heartbeat(status: str = "ALIVE"):
        """Write a timestamps and status to a shared file for the API to read."""
        import json
        try:
            with open(HEARTBEAT_FILE, "w") as f:
                json.dump({
                    "timestamp": datetime.utcnow().isoformat(),
                    "status": status,
                    "sent_count": StealthSender._sent_count,
                    "accounts_online": len(CRED_POOL.credentials),
                    "daily_limit_combined": StealthSender.DAILY_LIMIT * len(CRED_POOL.credentials)
                }, f)
        except Exception as e:
            print(f"DEBUG: Heartbeat write failed: {e}")

    @staticmethod
    async def send_with_delay(subject: str, body: str, recipient: str):
        """
        Sends with a human-like random delay (15-30 minutes minimum).
        """
        delay_seconds = random.randint(15 * 60, 30 * 60)  # 15 to 30 minutes
        print(f"STEALTH: Queuing email to {recipient}. Delay: {delay_seconds/60:.1f} mins.")
        await asyncio.sleep(delay_seconds)
        return await StealthSender.send_email(subject, body, recipient)
