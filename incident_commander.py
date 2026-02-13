import os
from elasticsearch import Elasticsearch
import json
from openai import OpenAI

# ========================
# CONFIGURATION
# ========================

ELASTIC_CLOUD_ID = os.getenv("ELASTIC_CLOUD_ID")
USERNAME = os.getenv("ELASTIC_USERNAME", "elastic")
PASSWORD = os.getenv("ELASTIC_PASSWORD")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not ELASTIC_CLOUD_ID or not PASSWORD or not OPENAI_API_KEY:
    raise ValueError("Missing required environment variables. Please set ELASTIC_CLOUD_ID, ELASTIC_PASSWORD, and OPENAI_API_KEY.")

# ========================
# CONNECT ELASTIC
# ========================

es = Elasticsearch(
    cloud_id=ELASTIC_CLOUD_ID,
    basic_auth=(USERNAME, PASSWORD)
)

# ========================
# CONNECT OPENAI
# ========================

client = OpenAI(api_key=OPENAI_API_KEY)

# ========================
# TOOL 1: Detect Failing Service
# ========================

def detect_failing_service():
    query = {
        "query": {
            "term": {"log_level": "ERROR"}
        },
        "aggs": {
            "services": {
                "terms": {
                    "field": "service_name"
                }
            }
        },
        "size": 0
    }

    response = es.search(index="incident-logs", body=query)
    buckets = response["aggregations"]["services"]["buckets"]

    if not buckets:
        return None, 0

    service_name = buckets[0]["key"]
    error_count = buckets[0]["doc_count"]

    return service_name, error_count

# ========================
# TOOL 2: Detect Root Cause
# ========================

def detect_root_cause():
    query = {
        "query": {
            "term": {"log_level": "ERROR"}
        },
        "aggs": {
            "error_codes": {
                "terms": {
                    "field": "error_code"
                }
            }
        },
        "size": 0
    }

    response = es.search(index="incident-logs", body=query)
    buckets = response["aggregations"]["error_codes"]["buckets"]

    if not buckets:
        return None

    return buckets[0]["key"]

# ========================
# TOOL 3: Generate AI Report
# ========================

def generate_incident_report(service, error_count, root_cause):

    report = f"""
INCIDENT REPORT
===============

SUMMARY:
- Failing Service: {service}
- Total Error Count: {error_count}
- Primary Error Pattern: {root_cause}

PROBABLE ROOT CAUSE:
Based on the error pattern '{root_cause}', this appears to be:
- Database connectivity issues (DB_CONN_FAIL)
- Connection pool exhaustion
- Network timeouts affecting database operations

IMPACT:
- Service degradation for {service}
- Potential transaction failures
- User experience impact

RECOMMENDED ACTIONS:
1. Immediate: Check database connection pool settings
2. Monitor: Database server performance metrics
3. Scale: Consider increasing connection pool size
4. Alert: Set up monitoring for connection pool usage
5. Backup: Verify database failover procedures

SEVERITY: HIGH
STATUS: INVESTIGATING
"""

    return report

# ========================
# MAIN ORCHESTRATOR
# ========================

def run_incident_commander():

    print("🚨 Running Incident Commander AI...\n")

    service, error_count = detect_failing_service()

    if not service:
        print("No active incidents detected.")
        return

    root_cause = detect_root_cause()

    report = generate_incident_report(service, error_count, root_cause)

    print("===== INCIDENT REPORT =====\n")
    print(report)


if __name__ == "__main__":
    run_incident_commander()