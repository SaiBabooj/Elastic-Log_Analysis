import random
from datetime import datetime, timedelta
import json

services = ["payment-service", "inventory-service", "user-service"]
hosts = ["server-1", "server-2", "server-3"]

start_time = datetime.now() - timedelta(hours=1)
logs = []

for i in range(1000):
    timestamp = start_time + timedelta(seconds=i * 5)


    if 500 <= i <= 650:
        log_level = "ERROR"
        error_code = random.choice(["DB_CONN_FAIL", "TIMEOUT"])
        response_time = random.randint(1000, 3000)
        message = "Database connection pool exhausted"
        service = "payment-service"
    else:
        log_level = "INFO"
        error_code = None
        response_time = random.randint(50, 200)
        message = "Request processed successfully"
        service = random.choice(services)

    log_entry = {
        "@timestamp": timestamp.isoformat(),
        "service_name": service,
        "log_level": log_level,
        "message": message,
        "error_code": error_code,
        "response_time_ms": response_time,
        "host": random.choice(hosts)
    }

    logs.append(log_entry)

with open("logs.json", "w") as f:
    for log in logs:
        f.write(json.dumps(log) + "\n")

print("Generated logs.json successfully")