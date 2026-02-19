from dotenv import load_dotenv
from elasticsearch import Elasticsearch
import os
import json

load_dotenv()

ELASTIC_CLOUD_ID = os.getenv("ELASTIC_CLOUD_ID")
USERNAME = os.getenv("ELASTIC_USERNAME")
PASSWORD = os.getenv("ELASTIC_PASSWORD")

es = Elasticsearch(
    cloud_id=ELASTIC_CLOUD_ID,
    basic_auth=(USERNAME, PASSWORD)
)

# We will use Elastic's built-in Gemini model endpoint
INFERENCE_ID = ".google-gemini-2.5-flash-completion"

def generate_ai_analysis(threat):

    prompt = f"""
You are an expert SOC (Security Operations Center) AI analyst.

Threat Type: {threat.get("type")}
Risk Score: {threat.get("risk_score")}

Provide:
1. Threat summary
2. Business/Security impact
3. Recommended remediation steps
4. Severity level (Low/Medium/High/Critical)

Respond strictly in valid JSON format:
{{
  "summary": "...",
  "impact": "...",
  "remediation": ["step1", "step2"],
  "severity": "High"
}}
"""

    try:
        response = es.perform_request(
            "POST",
            f"/_inference/{INFERENCE_ID}",
            headers={
                "Content-Type": "application/vnd.elasticsearch+json; compatible-with=9",
                "Accept": "application/vnd.elasticsearch+json; compatible-with=9"
            },
            body={
                "input": prompt
            }
        )

        response = response.body

        # Extract model output safely (Elastic completion format)
        if "completion" in response and len(response["completion"]) > 0:
            result_text = response["completion"][0].get("result", "")

            # Remove ```json markdown formatting if present
            cleaned = result_text.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.replace("```json", "").replace("```", "").strip()

            return cleaned

        return json.dumps({
            "error": "No completion returned from inference endpoint",
            "raw_response": response
        })

    except Exception as e:
        return json.dumps({"error": str(e)})