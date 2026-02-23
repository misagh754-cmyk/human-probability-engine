from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel
from tasks import process_founder_etl
from core.simulation import SimulationEngine
from core.models import FounderProfile
import uuid

app = FastAPI(title="HPE Data Acquisition Engine")

class ETLRequest(BaseModel):
    founder_name: str
    startup_name: str

@app.get("/")
async def root():
    return {"status": "Human Probability Engine Acquisition Layer Active"}

@app.post("/acquisition/trigger")
async def trigger_etl(request: ETLRequest):
    """
    Triggers an asynchronous ETL job for a specific founder/startup pair.
    """
    job_id = str(uuid.uuid4())
    
    # Trigger Celery Task (In mock mode, this uses the local worker logic)
    # process_founder_etl.delay(request.founder_name, request.startup_name)
    
    # For immediate demonstration in this MVP sandbox:
    # process_founder_etl(request.founder_name, request.startup_name)
    
    return {
        "message": f"ETL Job triggered for {request.founder_name}",
        "job_id": job_id,
        "status": "QUEUED"
    }

@app.get("/acquisition/status/{job_id}")
async def get_status(job_id: str):
    # In a real app, check Redis/Postgres for the job status
    return {
        "job_id": job_id,
        "status": "COMPLETED",
        "result_preview": "Founder profile normalized and saved."
    }

@app.post("/api/v1/simulate")
async def simulate_founder(profile: FounderProfile):
    """
    Runs a 10,000 iteration Monte Carlo simulation for a given founder profile.
    Returns success/failure probabilities and the Scenario Tree (DAG).
    """
    try:
        engine = SimulationEngine(iterations=10000)
        results = engine.run_monte_carlo(profile)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
