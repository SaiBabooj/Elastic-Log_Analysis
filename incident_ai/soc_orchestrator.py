import os
from elasticsearch import Elasticsearch
from dotenv import load_dotenv
from ai_reasoner import generate_ai_analysis

load_dotenv()

ELASTIC_CLOUD_ID = os.getenv("ELASTIC_CLOUD_ID")
USERNAME = os.getenv("ELASTIC_USERNAME")
PASSWORD = os.getenv("ELASTIC_PASSWORD")

es = Elasticsearch(
    cloud_id=ELASTIC_CLOUD_ID,
    basic_auth=(USERNAME, PASSWORD)
)

INDEX_NAME = "security-events"


def detect_brute_force():
    query = {
        "size": 0,
        "query": {
            "bool": {
                "must": [
                    {"term": {"event_type": "login_attempt"}},
                    {"term": {"status": "FAILED"}}
                ]
            }
        },
        "aggs": {
            "by_ip": {
                "terms": {"field": "source_ip", "size": 5},
                "aggs": {
                    "failed_count": {
                        "value_count": {"field": "status"}
                    }
                }
            }
        }
    }

    response = es.search(index=INDEX_NAME, body=query)
    buckets = response["aggregations"]["by_ip"]["buckets"]

    for bucket in buckets:
        if bucket["doc_count"] > 50:
            return {
                "type": "BRUTE_FORCE",
                "source_ip": bucket["key"],
                "attempts": bucket["doc_count"],
                "risk_score": min(100, bucket["doc_count"])
            }

    return None


def detect_privilege_escalation():
    query = {
        "query": {
            "term": {"event_type": "privilege_escalation"}
        }
    }

    response = es.search(index=INDEX_NAME, body=query)

    if response["hits"]["total"]["value"] > 0:
        return {
            "type": "PRIVILEGE_ESCALATION",
            "risk_score": 95
        }

    return None


def run_soc_orchestrator():
    brute_force = detect_brute_force()
    privilege = detect_privilege_escalation()

    threat = None

    if privilege:
        threat = privilege
    elif brute_force:
        threat = brute_force
    else:
        return {"status": "NO_THREAT"}

    # Trigger AI reasoning only for high-risk threats
    if threat.get("risk_score", 0) > 80:
        try:
            ai_analysis = generate_ai_analysis(threat)
            threat["ai_analysis"] = ai_analysis
        except Exception as e:
            threat["ai_analysis_error"] = str(e)

    return threat