import os
import instructor
from openai import OpenAI
from core.models import PsychologicalParameters, FounderProfile
from typing import Optional

# Initialize Instructor with OpenAI
client = instructor.patch(OpenAI(api_key=os.getenv("OPENAI_API_KEY", "mock_key")))

class NLPNormalizer:
    @staticmethod
    def extract_psych_params(bio: str, history: str) -> PsychologicalParameters:
        """
        Translates raw bio and history into numerical psychological parameters using LLM.
        """
        prompt = f"""
        Analyze the following founder bio and history. 
        Map the qualitative data to quantitative Big Five and behavioral traits (0.0 to 1.0).
        
        Bio: {bio}
        History: {history}
        
        Rules:
        - High job hopping without growth -> Low Decision Stability.
        - Long tenure at prestigious firms -> High Conscientiousness.
        - Multiple previous ventures -> High Risk Tolerance.
        """
        
        try:
            # Note: In a real environment, this calls the LLM.
            # For this MVP, we provide a robust structure that uses Instructor for valid JSON schema.
            params = client.chat.completions.create(
                model="gpt-4-turbo-preview",
                response_model=PsychologicalParameters,
                messages=[{"role": "user", "content": prompt}]
            )
            return params
        except Exception as e:
            print(f"LLM Extraction failed: {e}. Falling back to default baseline.")
            return PsychologicalParameters(
                openness=0.5, conscientiousness=0.5, extraversion=0.5,
                agreeableness=0.5, neuroticism=0.5, risk_tolerance=0.5,
                stress_capacity=0.5, decision_stability=0.5
            )

    @staticmethod
    def normalize_profile(name: str, bio: str, history: str, structural_json: dict) -> FounderProfile:
        psych_params = NLPNormalizer.extract_psych_params(bio, history)
        
        return FounderProfile(
            name=name,
            structural=structural_json,
            behavioral=psych_params,
            raw_bio=bio
        )
