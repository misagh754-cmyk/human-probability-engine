from pydantic import BaseModel, Field
from typing import List, Optional

class FounderStructuralData(BaseModel):
    age: int
    education: str
    years_experience: int
    previous_exits: int
    capital_raised: float
    is_solo: bool

class PsychologicalParameters(BaseModel):
    openness: float = Field(..., ge=0, le=1)
    conscientiousness: float = Field(..., ge=0, le=1)
    extraversion: float = Field(..., ge=0, le=1)
    agreeableness: float = Field(..., ge=0, le=1)
    neuroticism: float = Field(..., ge=0, le=1)
    risk_tolerance: float = Field(..., ge=0, le=1)
    stress_capacity: float = Field(..., ge=0, le=1)
    decision_stability: float = Field(..., ge=0, le=1)

class FounderProfile(BaseModel):
    name: str
    structural: FounderStructuralData
    behavioral: PsychologicalParameters
    raw_bio: str
    actual_outcome: Optional[str] = None # "SUCCESS" or "FAILURE"
