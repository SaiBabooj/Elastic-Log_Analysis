import os

ELASTIC_CLOUD_ID = os.getenv("ELASTIC_CLOUD_ID")
ELASTIC_PASSWORD = os.getenv("ELASTIC_PASSWORD")


import streamlit as st
from dotenv import load_dotenv
load_dotenv()

from incident_commander import run_incident_commander
from elasticsearch import Elasticsearch
import os

# ==============================
# CONFIG (Uses Environment Variables)
# ==============================

ELASTIC_CLOUD_ID = os.getenv("ELASTIC_CLOUD_ID")
USERNAME = os.getenv("ELASTIC_USERNAME", "elastic")
PASSWORD = os.getenv("ELASTIC_PASSWORD")

es = Elasticsearch(
    cloud_id=ELASTIC_CLOUD_ID,
    basic_auth=(USERNAME, PASSWORD)
)

# ==============================
# PAGE CONFIG
# ==============================

st.set_page_config(page_title="Incident Commander AI", layout="wide")

st.title("🚨 Incident Commander AI Dashboard")
st.markdown("AI-powered automated incident investigation using Elasticsearch + LLM")

# ==============================
# SOC OVERVIEW METRICS
# ==============================

st.markdown("## 📊 SOC Overview")

col_a, col_b, col_c = st.columns(3)

total_incidents = es.count(index="incidents")["count"]

high_risk_query = {
    "query": {
        "term": {"severity": "HIGH"}
    }
}
high_risk_count = es.count(index="incidents", body=high_risk_query)["count"]

critical_risk_query = {
    "query": {
        "term": {"severity": "CRITICAL"}
    }
}
critical_count = es.count(index="incidents", body=critical_risk_query)["count"]

col_a.metric("Total Incidents", total_incidents)
col_b.metric("High Severity", high_risk_count)
col_c.metric("Critical Severity", critical_count)

st.markdown("---")

# ==============================
# RUN INCIDENT BUTTON
# ==============================

if st.button("🔍 Run Incident Commander"):

    with st.spinner("Analyzing logs and investigating incident..."):
        incident = run_incident_commander()

    if incident["status"] == "NO_INCIDENT":
        st.success("✅ No active incidents detected.")
    else:
        severity = incident["severity"]

        if severity == "HIGH":
            st.error(f"🔥 Severity: {severity}")
        elif severity == "MEDIUM":
            st.warning(f"⚠ Severity: {severity}")
        else:
            st.info(f"ℹ Severity: {severity}")

        col1, col2 = st.columns(2)

        with col1:
            st.metric("Service", incident.get("service", "N/A"))
            st.metric("Error Count", incident.get("error_count", "N/A"))

        with col2:
            st.metric("Root Cause", incident.get("root_cause", "N/A"))

        st.markdown("### 🧠 AI Intelligence Analysis")

        import json

        try:
            ai_data = json.loads(incident.get("ai_analysis", "{}"))

            severity_ai = ai_data.get("severity", "UNKNOWN")

            if severity_ai == "Critical":
                st.error(f"🚨 AI Severity: {severity_ai}")
            elif severity_ai == "High":
                st.warning(f"⚠ AI Severity: {severity_ai}")
            else:
                st.info(f"ℹ AI Severity: {severity_ai}")

            st.markdown("#### 🔎 Summary")
            st.write(ai_data.get("summary", "N/A"))

            st.markdown("#### 💥 Impact")
            st.write(ai_data.get("impact", "N/A"))

            st.markdown("#### 🛠 Remediation Steps")
            for step in ai_data.get("remediation", []):
                st.write(f"- {step}")

        except Exception as e:
            st.error("Failed to parse AI analysis.")
            st.write(str(e))

# ==============================
# INCIDENT HISTORY
# ==============================

st.markdown("---")
st.subheader("📚 Previous Incidents")

response = es.search(
    index="incidents",
    size=5,
    sort="@timestamp:desc"
)

hits = response["hits"]["hits"]

if hits:
    for hit in hits:
        data = hit["_source"]

        with st.expander(f"{data.get('service', 'Unknown')} | {data.get('severity', 'Unknown')} | {data.get('error_count', 0)} errors"):
            st.write(data.get("report", "No report available."))
else:
    st.info("No previous incidents found.")