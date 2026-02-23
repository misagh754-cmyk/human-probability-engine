import asyncio
from infrastructure.controller import ScalingController, StealthSender
from ai.outreach import RainmakerAI
from datetime import datetime

class RainmakerEngine:
    """
    The main autonomous loop for the $100k MRR target.
    """
    def __init__(self, current_mrr: float):
        self.controller = ScalingController(current_mrr)
        self.ai = RainmakerAI()
        
    async def run_daily_cycle(self, leads: list):
        print(f"--- RAINMAKER CYCLE START: {datetime.now()} ---")
        
        # 1. Check Pacing & Scale
        scaling_result = self.controller.trigger_scaling_if_needed()
        print(f"SCALING STATUS: {scaling_result}")
        
        # 2. Process Leads
        for lead in leads:
            # Generate personalized content
            outreach = self.ai.generate_outreach(
                name=lead['name'], 
                startup=lead['startup'], 
                hook=lead['hook']
            )
            
            print(f"SUBJECT: {outreach.subject}")
            print(f"BODY: {outreach.body}")
            
            # 3. Stealth Dispatch
            await StealthSender.send_with_delay(outreach.body, lead['email'])
            
            # In a real environment, we'd limit to 40/account/day
            # For this loop, we process a batch
            await asyncio.sleep(1) # Internal loop delay

if __name__ == "__main__":
    # Mock Leads
    sample_leads = [
        {
            "name": "Sarah", 
            "startup": "NebulaAI", 
            "email": "sarah@nebula.ai",
            "hook": "Saw your post about closing the seed round yesterday. Congrats."
        }
    ]
    
    # Run the engine
    engine = RainmakerEngine(current_mrr=35000.0) # Behind target (35k vs ~46k)
    asyncio.run(engine.run_daily_cycle(sample_leads))
