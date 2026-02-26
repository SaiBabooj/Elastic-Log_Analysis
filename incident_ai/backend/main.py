from fastapi import FastAPI
from dotenv import load_dotenv
import os
from elasticsearch import Elasticsearch

from incident_service import get_all_incidents, get_metrics
from elasticsearch import NotFoundError
from fastapi import HTTPException
from incident_commander import run_incident_commander
from fastapi.middleware.cors import CORSMiddleware
from ai_reasoner import generate_deep_investigation, generate_closure_report

load_dotenv()

app = FastAPI(title="Incident AI Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


# New lifecycle endpoint for updating incident stage
@app.put("/incidents/{incident_id}/update-stage")
def update_incident_stage(incident_id: str, payload: dict):
    allowed_stages = ["OPEN", "INVESTIGATING", "CONTAINED", "RESOLVED", "FALSE_POSITIVE"]

    new_stage = payload.get("new_stage")
    notes = payload.get("notes", "")

    if new_stage not in allowed_stages:
        raise HTTPException(status_code=400, detail="Invalid stage provided.")

    try:
        # Fetch existing incident
        response = es.get(index="incidents", id=incident_id)
        incident = response["_source"]

        current_stage = incident.get("incident_stage", "OPEN")

        # Prevent backward transitions except FALSE_POSITIVE
        valid_transitions = {
            "OPEN": ["INVESTIGATING", "FALSE_POSITIVE"],
            "INVESTIGATING": ["CONTAINED", "FALSE_POSITIVE"],
            "CONTAINED": ["RESOLVED", "FALSE_POSITIVE"],
            "RESOLVED": [],
            "FALSE_POSITIVE": []
        }

        if new_stage not in valid_transitions.get(current_stage, []) and new_stage != current_stage:
            raise HTTPException(status_code=400, detail="Invalid stage transition.")

        from datetime import datetime, timezone

        current_time = datetime.now(timezone.utc).isoformat()

        # Update stage
        incident["incident_stage"] = new_stage
        incident["updated_at"] = current_time

        # Deep Investigation Logic
        generated_object = None
        if new_stage == "INVESTIGATING" and current_stage != "INVESTIGATING":
            # Only generate deep investigation if it doesn't already exist
            if "deep_investigation" not in incident:
                try:
                    generated_object = generate_deep_investigation(incident)
                    generated_object["generated_at"] = current_time
                except Exception as e:
                    print(f"Error during deep investigation: {e}")

        # Closure Report Logic
        closure_report = None
        if new_stage == "RESOLVED" and current_stage != "RESOLVED":
            if "closure_report" not in incident:
                try:
                    closure_report = generate_closure_report(incident)
                    if "generated_at" not in closure_report:
                        closure_report["generated_at"] = current_time
                except Exception as e:
                    print(f"Error during closure report generation: {e}")

        # Append history
        updated_history = incident.get("history", [])
        updated_history.append({
            "stage": new_stage,
            "timestamp": current_time,
            "notes": notes
        })

        # Explicit partial update payload
        update_doc = {
            "incident_stage": new_stage,
            "updated_at": current_time,
            "history": updated_history
        }
        
        if generated_object:
            update_doc["deep_investigation"] = generated_object
            
        if closure_report:
            update_doc["closure_report"] = closure_report

        # Save back to Elasticsearch using atomic update
        es.update(index="incidents", id=incident_id, doc=update_doc)

        return {"message": "Incident stage updated successfully."}

    except NotFoundError:
        raise HTTPException(status_code=404, detail="Incident not found.")