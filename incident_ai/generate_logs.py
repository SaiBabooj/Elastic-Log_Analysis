import json
import random
from datetime import datetime, timedelta

EVENT_TYPES = [
    "login_attempt",
    "api_access",
    "file_access"
]

USERS = ["alice", "bob", "charlie", "david", "eve"]
RESOURCES = ["auth-service", "payment-service", "admin-panel", "database"]
COUNTRIES = ["India", "US", "Germany", "Russia", "China"]

def random_ip():
    return ".".join(str(random.randint(1, 255)) for _ in range(4))

logs = []
now = datetime.utcnow()

# -----------------------------
# Normal Activity Logs
# -----------------------------
for _ in range(300):
    logs.append({
        "@timestamp": (now - timedelta(minutes=random.randint(0, 60))).isoformat(),
        "event_type": random.choice(EVENT_TYPES),
        "source_ip": random_ip(),
        "user": random.choice(USERS),
        "action": "access",
        "status": "SUCCESS",
        "resource": random.choice(RESOURCES),
        "geo_location": random.choice(COUNTRIES),
        "severity": "LOW"
    })

# -----------------------------
# Brute Force Attack Simulation
# -----------------------------
attacker_ip = random_ip()
target_user = random.choice(USERS)

for _ in range(80):
    logs.append({
        "@timestamp": (now - timedelta(minutes=random.randint(0, 5))).isoformat(),
        "event_type": "login_attempt",
        "source_ip": attacker_ip,
        "user": target_user,
        "action": "login",
        "status": "FAILED",
        "resource": "auth-service",
        "geo_location": "Russia",
        "severity": "HIGH"
    })

# -----------------------------
# Privilege Escalation Attempt
# -----------------------------
logs.append({
    "@timestamp": now.isoformat(),
    "event_type": "privilege_escalation",
    "source_ip": random_ip(),
    "user": "bob",
    "action": "admin_access",
    "status": "FAILED",
    "resource": "admin-panel",
    "geo_location": "China",
    "severity": "CRITICAL"
})

with open("security_logs.json", "w") as f:
    json.dump(logs, f, indent=2)

print("✅ Security attack simulation logs generated successfully.")