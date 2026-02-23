from celery import Celery
import os
import asyncio
from modules.extractors import DataExtractor
from nlp.normalizer import NLPNormalizer
from core.models import FounderStructuralData

# Configure Celery
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
app = Celery("hpe_tasks", broker=REDIS_URL, backend=REDIS_URL)

@app.task(name="extract_and_normalize_founder")
def process_founder_etl(founder_name: str, startup_name: str):
    """
    Asynchronous ETL pipeline: Extract -> Normalize -> Load
    """
    extractor = DataExtractor()
    
    # Run async gathering in sync Celery environment
    loop = asyncio.get_event_loop()
    raw_data = loop.run_until_complete(extractor.gather_all(founder_name, startup_name))
    
    # NLP Normalization
    structural_mock = FounderStructuralData(
        age=30, 
        education="Stanford", 
        years_experience=10, 
        previous_exits=1, 
        capital_raised=raw_data["crunchbase"]["funding_total"], 
        is_solo=False
    )
    
    profile = NLPNormalizer.normalize_profile(
        name=founder_name,
        bio=raw_data["bio"],
        history=f"Previous startup status: {raw_data['crunchbase']['status']}",
        structural_json=structural_mock
    )
    
    # Database Persistence (Simplified)
    print(f"LOAD: Saving profile for {profile.name} to Database...")
    print(f"Mapped Values: Conscientiousness={profile.behavioral.conscientiousness}, Risk={profile.behavioral.risk_tolerance}")
    
    return profile.dict()
