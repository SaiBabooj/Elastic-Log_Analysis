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
            st.metric("Service", incident["service"])
            st.metric("Error Count", incident["error_count"])

        with col2:
            st.metric("Root Cause", incident["root_cause"])

        st.markdown("### 📋 AI Generated Incident Report")
        st.write(incident["report"])

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

        with st.expander(f"{data['service']} | {data['severity']} | {data['error_count']} errors"):
            st.write(data["report"])
else:
    st.info("No previous incidents found.")