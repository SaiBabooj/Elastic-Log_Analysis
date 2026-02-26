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

def generate_deep_investigation(incident):
    prompt = f"""
You are a Level 2 SOC (Security Operations Center) AI analyst.
Perform a Deep AI Re-Investigation for this incident:

Threat Type: {incident.get("threat_type", "Unknown")}
Risk Score: {incident.get("risk_score", "Unknown")}
Original Summary: {incident.get("ai_analysis", {}).get("summary", "None")}
Repeat Offender: {incident.get("repeat_offender", False)}
Occurrence Count: {incident.get("occurrence_count", 1)}
MITRE Tactics/Techniques: {str(incident.get("mitre", "None"))}

Provide:
1. Expanded technical analysis
2. Potential attack chain progression
3. Recommended containment strategy
4. Risk if ignored

Respond strictly in valid JSON format:
{{
  "summary": "...",
  "attack_path_analysis": "...",
  "containment_strategy": "...",
  "risk_if_ignored": "..."
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
            body={"input": prompt}
        )
        response = response.body
        if "completion" in response and len(response["completion"]) > 0:
            result_text = response["completion"][0].get("result", "")
            cleaned = result_text.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.replace("```json", "").replace("```", "").strip()
            return dict(json.loads(cleaned))
            
        return {
            "summary": "Deep investigation failed: No completion returned.",
            "attack_path_analysis": "N/A",
            "containment_strategy": "N/A",
            "risk_if_ignored": "N/A"
        }
    except Exception as e:
        return {
            "summary": f"Deep investigation failed due to error: {str(e)}",
            "attack_path_analysis": "N/A",
            "containment_strategy": "N/A",
            "risk_if_ignored": "N/A"
        }

def generate_closure_report(incident):
    prompt = f"""
You are a Level 3 SOC (Security Operations Center) Lead closing an incident.
Provide a final executive closure report for this incident:

Threat Type: {incident.get("threat_type", "Unknown")}
Risk Score: {incident.get("risk_score", "Unknown")}
Original Analysis: {incident.get("ai_analysis", {}).get("summary", "None")}
Deep Analysis: {incident.get("deep_investigation", {}).get("attack_path_analysis", "None")}

Please provide:
1. Executive summary of the incident and resolution
2. Response actions taken to neutralize the threat
3. Residual risk remaining after closure
4. Lessons learned for future prevention

Respond strictly in valid JSON format:
{{
  "executive_summary": "...",
  "response_actions_taken": "...",
  "residual_risk": "...",
  "lessons_learned": "..."
}}
"""
    from datetime import datetime, timezone
    try:
        response = es.perform_request(
            "POST",
            f"/_inference/{INFERENCE_ID}",
            headers={
                "Content-Type": "application/vnd.elasticsearch+json; compatible-with=9",
                "Accept": "application/vnd.elasticsearch+json; compatible-with=9"
            },
            body={"input": prompt}
        )
        response = response.body
        if "completion" in response and len(response["completion"]) > 0:
            result_text = response["completion"][0].get("result", "")
            cleaned = result_text.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.replace("```json", "").replace("```", "").strip()
            parsed_result = dict(json.loads(cleaned))
            parsed_result["generated_at"] = datetime.now(timezone.utc).isoformat()
            return parsed_result
            
        return {
            "executive_summary": "Closure report generation failed: No completion returned.",
            "response_actions_taken": "N/A",
            "residual_risk": "N/A",
            "lessons_learned": "N/A",
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        return {
            "executive_summary": f"Closure report generated failed due to error: {str(e)}",
            "response_actions_taken": "N/A",
            "residual_risk": "N/A",
            "lessons_learned": "N/A",
            "generated_at": datetime.now(timezone.utc).isoformat()
        }