import random
import asyncio
from datetime import datetime, timedelta
from typing import Dict, Any, List
from core.models import FounderProfile # Reusing model if possible or defining specific ones

class ScalingController:
    """
    Monitors MRR and triggers horizontal scaling (domain/account acquisition).
    """
    TARGET_MRR = 100000.0
    
    def __init__(self, current_mrr: float):
        self.current_mrr = current_mrr
        
    def get_pacing(self) -> float:
        """
        Calculates if we are on track for the month.
        """
        day_of_month = datetime.now().day
        days_in_month = 30 # Approximation
        target_pacing = (self.TARGET_MRR / days_in_month) * day_of_month
        return self.current_mrr / target_pacing

    def trigger_scaling_if_needed(self):
        pacing = self.get_pacing()
        if pacing < 0.9: # Behind by > 10%
            print(f"PACING CRITICAL: {pacing:.2f}. Initializing Stealth Scale-Out...")
            return self._auto_acquire_infrastructure()
        return "Pacing optimal. Maintaining current stealth volume."

    def _auto_acquire_infrastructure(self):
        # Mocking API calls to Namecheap/AWS Route53
        new_domains = ["gethpe.ai", "humanprob.co", "foundervision.io"]
        selected = random.choice(new_domains)
        return {
            "action": "DOMAIN_ACQUIRED",
            "domain": selected,
            "tasks": ["SET_SPF_DKIM", "START_WARMUP", "GENERATE_ACCOUNTS"]
        }

class StealthSender:
    """
    Handles outbound logic with human-like delays.
    """
    @staticmethod
    async def send_with_delay(email_content: str, recipient: str):
        # Human delay: 7 to 22 minutes
        delay_seconds = random.randint(7 * 60, 22 * 60)
        print(f"STEALTH: Queuing email to {recipient}. Delay: {delay_seconds/60:.1f} mins.")
        
        # In a real app, this would be handled by a task queue (Celery/Redis)
        # await asyncio.sleep(delay_seconds)
        
        print(f"SENT: Outreach successfully delivered to {recipient} via Stealth Pipeline.")
        return True
