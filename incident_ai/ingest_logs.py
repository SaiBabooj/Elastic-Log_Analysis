from elasticsearch import Elasticsearch
import json

ELASTIC_CLOUD_ID = "Node_Usage:YXAtc291dGgtMS5hd3MuZWxhc3RpYy1jbG91ZC5jb206NDQzJDZiMjA1NzYyMmUzNDQxZjQ5NzI0NWQ4MTJmMTJmNThmJDZhMjI1YWFhOTQxMjQ3NzNhZWVlYWY1MWU3OWM0YTg5"
USERNAME = "elastic"
PASSWORD = "Wd5zQA1JUj2Qgk4dANVRYL6o"

es = Elasticsearch(
    cloud_id=ELASTIC_CLOUD_ID,
    basic_auth=(USERNAME, PASSWORD)
)

with open("logs.json") as f:
    for line in f:
        doc = json.loads(line)
        es.index(index="incident-logs", document=doc)

print("Logs ingested successfully")
