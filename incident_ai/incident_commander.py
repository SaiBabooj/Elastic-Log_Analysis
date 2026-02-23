import os
from dotenv import load_dotenv
load_dotenv()
from elasticsearch import Elasticsearch
import json
from datetime import datetime, timezone, timedelta
from backend.mitre_mapper import map_to_mitre 

# ========================
# CONFIGURATION
# ========================

ELASTIC_CLOUD_ID = os.getenv("ELASTIC_CLOUD_ID")
USERNAME = os.getenv("ELASTIC_USERNAME", "elastic")
PASSWORD = os.getenv("ELASTIC_PASSWORD")



# ========================
# CONNECT ELASTIC
# ========================

es = Elasticsearch(
    cloud_id=ELASTIC_CLOUD_ID,
    basic_auth=(USERNAME, PASSWORD)
)


# ========================
# TOOL 1: Detect High-Risk Security Events
# ========================

def detect_security_threat():
    query = {
        "query": {
            "range": {
                "risk_score": {"gte": 70}
            }
        },
        "sort": [{"@timestamp": {"order": "desc"}}],
        "size": 1
    }

    response = es.search(index="security-logs", body=query)
    hits = response["hits"]["hits"]

    if not hits:
        return None

    return hits[0]["_source"]


# ========================
# TOOL 2: Generate AI Analysis (Placeholder)
# ========================

def generate_ai_analysis(threat):
    return {
        "summary": f"Detected high-risk activity of type {threat.get('threat_type')}.",
        "impact": "Potential unauthorized access or malicious behavior detected.",
        "remediation": [
            "Investigate the source IP and user account.",
            "Review authentication logs.",
            "Apply least privilege enforcement.",
            "Reset compromised credentials if necessary."
        ],
        "severity": "Critical" if threat.get("risk_score", 0) >= 90 else "High"
    }


def is_duplicate_incident(source_ip, threat_type):
    ten_minutes_ago = datetime.now(timezone.utc) - timedelta(minutes=10)

    query = {
        "query": {
            "bool": {
                "must": [
                    {"match": {"source_ip": source_ip}},
                    {"match": {"threat_type": threat_type}},
                    {
                        "range": {
                            "@timestamp": {
                                "gte": ten_minutes_ago.isoformat()
                            }
                        }
                    }
                ]
            }
        }
    }

    response = es.search(index="incidents", body=query)
    return response["hits"]["total"]["value"] > 0

def count_recent_occurrences(source_ip, threat_type):
    thirty_minutes_ago = datetime.now(timezone.utc) - timedelta(minutes=30)

    query = {
        "query": {
            "bool": {
                "must": [
                    {"match": {"source_ip": source_ip}},
                    {"match": {"threat_type": threat_type}},
                    {
                        "range": {
                            "@timestamp": {
                                "gte": thirty_minutes_ago.isoformat()
                            }
                        }
                    }
                ]
            }
        }
    }

    response = es.search(index="incidents", body=query)
    return response["hits"]["total"]["value"]


# ========================
# MAIN ORCHESTRATOR (SOC MODE)
# ========================

def run_incident_commander():

    print("🚨 Running SOC Threat Detection...\n")

    threat = detect_security_threat()

    if not threat:
        return {"status": "NO_INCIDENT"}

    risk_score = threat.get("risk_score", 0)

    if risk_score >= 90:
        severity = "CRITICAL"
    elif risk_score >= 70:
        severity = "HIGH"
    else:
        severity = "MEDIUM"

    ai_analysis = generate_ai_analysis(threat)
    mitre_info = map_to_mitre(threat.get("threat_type"))

    if not mitre_info:
        from backend.mitre_mapper import ai_mitre_fallback
        mitre_info = ai_mitre_fallback(threat.get("threat_type"))

    source_ip = threat.get("source_ip")
    threat_type = threat.get("threat_type")

    if is_duplicate_incident(source_ip, threat_type):
        return {
            "status": "DUPLICATE_SKIPPED",
            "message": "Incident already exists within last 10 minutes."
        }

    occurrence_count = count_recent_occurrences(source_ip, threat_type) + 1

    repeat_offender = False

    if occurrence_count >= 3:
        repeat_offender = True
        severity = "CRITICAL"

    incident_data = {
        "status": "INCIDENT_FOUND",
        "incident_stage": "OPEN",
        "threat_type": threat.get("threat_type"),
        "source_ip": threat.get("source_ip"),
        "user": threat.get("user"),
        "risk_score": risk_score,
        "severity": severity,
        "repeat_offender": repeat_offender,
        "occurrence_count": occurrence_count,
        "ai_analysis": ai_analysis,
        "mitre": mitre_info
    }

    save_incident(incident_data)
    return incident_data


# ========================
# SAVE INCIDENT TO ELASTIC
# ========================

def save_incident(incident_data):
    incident_data["@timestamp"] = datetime.now(timezone.utc).isoformat()

    es.index(
        index="incidents",
        document=incident_data
    )


if __name__ == "__main__":
    run_incident_commander()