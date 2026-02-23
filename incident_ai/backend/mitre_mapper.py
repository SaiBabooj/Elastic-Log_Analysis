# ========================
# STATIC MITRE MAPPING
# ========================

MITRE_STATIC_MAP = {
    "PRIVILEGE_ESCALATION": {
        "tactic": "Privilege Escalation",
        "technique": "T1068",
        "confidence": 0.95
    },
    "LATERAL_MOVEMENT": {
        "tactic": "Lateral Movement",
        "technique": "T1021",
        "confidence": 0.90
    },
    "CREDENTIAL_DUMPING": {
        "tactic": "Credential Access",
        "technique": "T1003",
        "confidence": 0.92
    },
    "DATA_EXFILTRATION": {
        "tactic": "Exfiltration",
        "technique": "T1041",
        "confidence": 0.93
    }
}


def map_to_mitre(threat_type: str):
    if not threat_type:
        return None

    return MITRE_STATIC_MAP.get(threat_type.upper())


# ========================
# AI MITRE FALLBACK
# ========================
def ai_mitre_fallback(threat_type: str):
    """
    Placeholder AI-based MITRE classification.
    In production, this would call an LLM or inference endpoint.
    """

    if not threat_type:
        return {
            "tactic": "Unknown",
            "technique": "Unknown",
            "confidence": 0.50
        }

    threat_type = threat_type.upper()

    # Simple heuristic simulation (replace with real AI later)
    if "ESCALATION" in threat_type:
        return {
            "tactic": "Privilege Escalation",
            "technique": "T1068",
            "confidence": 0.80
        }

    if "LATERAL" in threat_type:
        return {
            "tactic": "Lateral Movement",
            "technique": "T1021",
            "confidence": 0.80
        }

    if "CREDENTIAL" in threat_type:
        return {
            "tactic": "Credential Access",
            "technique": "T1003",
            "confidence": 0.78
        }

    if "EXFIL" in threat_type:
        return {
            "tactic": "Exfiltration",
            "technique": "T1041",
            "confidence": 0.78
        }

    return {
        "tactic": "Unknown",
        "technique": "Unknown",
        "confidence": 0.50
    }