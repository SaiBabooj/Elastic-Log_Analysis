from fastapi import FastAPI
from dotenv import load_dotenv
import os
from elasticsearch import Elasticsearch

from .incident_service import get_all_incidents, get_metrics
from incident_commander import run_incident_commander

load_dotenv()

app = FastAPI(title="Incident AI Backend")

ELASTIC_CLOUD_ID = os.getenv("ELASTIC_CLOUD_ID")
ELASTIC_USERNAME = os.getenv("ELASTIC_USERNAME", "elastic")
ELASTIC_PASSWORD = os.getenv("ELASTIC_PASSWORD")

es = Elasticsearch(
    cloud_id=ELASTIC_CLOUD_ID,
    basic_auth=(ELASTIC_USERNAME, ELASTIC_PASSWORD)
)

@app.get("/")
def root():
    return {"status": "Backend Running"}

@app.get("/incidents")
def fetch_incidents():
    return get_all_incidents(es)

@app.get("/metrics")
def fetch_metrics():
    return get_metrics(es)

@app.post("/run-detection")
def trigger_detection():
    result = run_incident_commander()
    return result