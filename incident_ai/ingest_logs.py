import json
import os
from elasticsearch import Elasticsearch
from dotenv import load_dotenv

load_dotenv()

ELASTIC_CLOUD_ID = os.getenv("ELASTIC_CLOUD_ID")
USERNAME = os.getenv("ELASTIC_USERNAME")
PASSWORD = os.getenv("ELASTIC_PASSWORD")

es = Elasticsearch(
    cloud_id=ELASTIC_CLOUD_ID,
    basic_auth=(USERNAME, PASSWORD)
)

INDEX_NAME = "security-events"

with open("security_logs.json", "r") as f:
    logs = json.load(f)

for log in logs:
    es.index(index=INDEX_NAME, document=log)

print(f"✅ Successfully ingested {len(logs)} security events into Elasticsearch!")