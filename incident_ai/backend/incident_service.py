from elasticsearch import NotFoundError

def get_all_incidents(es):
    try:
        response = es.search(
            index="incidents",
            size=20,
            sort="@timestamp:desc"
        )
        hits = response["hits"]["hits"]
        return [hit["_source"] for hit in hits]
    except NotFoundError:
        # If index doesn't exist yet, return empty list instead of crashing
        return []

def get_metrics(es):
    try:
        total = es.count(index="incidents")["count"]

        high_query = {
            "query": {"term": {"severity": "HIGH"}}
        }
        high = es.count(index="incidents", body=high_query)["count"]

        critical_query = {
            "query": {"term": {"severity": "CRITICAL"}}
        }
        critical = es.count(index="incidents", body=critical_query)["count"]

        return {
            "total_incidents": total,
            "high_severity": high,
            "critical_severity": critical
        }
    except NotFoundError:
        # If index doesn't exist yet, return zeroed metrics
        return {
            "total_incidents": 0,
            "high_severity": 0,
            "critical_severity": 0
        }