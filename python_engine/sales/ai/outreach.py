import os
import instructor
from openai import OpenAI
from pydantic import BaseModel, Field

# Initialize Instructor
gemini_key = os.getenv("GEMINI_API_KEY")
openai_key = os.getenv("OPENAI_API_KEY")

if gemini_key and gemini_key != "mock_key":
    print(f"INFO: Initializing RainmakerAI with Gemini (Key: {gemini_key[:8]}...)")
    api_key = gemini_key
    base_url = "https://generativelanguage.googleapis.com/v1beta/openai/"
    model_name = "gemini-2.0-flash"
elif openai_key and openai_key != "mock_key":
    print(f"INFO: Initializing RainmakerAI with OpenAI (Key: {openai_key[:8]}...)")
    api_key = openai_key
    base_url = None
    model_name = "gpt-4-turbo-preview"
else:
    print("WARNING: No valid AI key found. Using mock_key (EXPECT 401).")
    api_key = "mock_key"
    base_url = None
    model_name = "gpt-4-turbo-preview"

client = instructor.patch(OpenAI(api_key=api_key, base_url=base_url))

class OutreachEmail(BaseModel):
    subject: str = Field(..., description="2-3 words, all lowercase")
    body: str = Field(..., description="50-70 words, casual, no AI jargon")

class RainmakerAI:
    """
    Generates "Anti-Robot" outreach content based on lead data.
    """
    SYSTEM_PROMPT = """
    You are an Elite B2B Growth Hacker. Write a founder-to-founder email.
    
    CRITICAL RULES:
    1. MAX 70 WORDS. 
    2. Start with a hyper-specific LinkedIn/Twitter detail.
    3. NO AI WORDS: delve, testament, synergy, elevate, imperative, robust.
    4. NO FORMAL GREETINGS. Start with 'Hey [Name]'.
    5. SUBJECT: 2-3 words, lowercase.
    6. CTA: Low friction (e.g., 'send over a report?').
    """

    @staticmethod
    def generate_outreach(name: str, startup: str, hook: str) -> OutreachEmail:
        prompt = f"""
        Lead Name: {name}
        Startup: {startup}
        Context/Hook: {hook}
        
        Write the email now.
        """
        
        try:
            email = client.chat.completions.create(
                model=model_name,
                response_model=OutreachEmail,
                messages=[
                    {"role": "system", "content": RainmakerAI.SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ]
            )
            
            # Additional validation layer to strip formalisms
            email.body = email.body.replace("I hope this email finds you well", "").strip()
            return email
        except Exception as e:
            print(f"AI Generation failed: {e}")
            return OutreachEmail(
                subject="quick question",
                body=f"Hey {name}, saw the news about {startup}. Insane growth recently. Mind if I send over a 1-min predictive report on your 3-yr success probability?"
            )
