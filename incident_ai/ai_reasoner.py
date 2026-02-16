from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_ai_analysis(threat_data):
    prompt = f"""
You are an expert SOC (Security Operations Center) AI Analyst.

Analyze the following detected threat:

Threat Type: {threat_data.get("type")}
Risk Score: {threat_data.get("risk_score")}

Provide a structured security analysis in JSON format with these fields:

- threat_summary
- attacker_objective
- business_impact
- immediate_containment_steps (list)
- long_term_prevention (list)
- executive_summary

Return ONLY valid JSON.
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2
    )

    return response.choices[0].message.content