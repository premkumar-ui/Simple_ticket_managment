import redis
import json

redis_client = redis.Redis(
    host="localhost",
    port=6379,
    decode_responses=True
)


def set_cache(key, value, expire=60):
    redis_client.setex(key, expire, json.dumps(value))


def get_cache(key):
    data = redis_client.get(key)
    return json.loads(data) if data else None


def delete_cache(key):
    redis_client.delete(key)
    
def clear_ticket_cache():
    for key in redis_client.scan_iter("tickets:*"):
        redis_client.delete(key)

    redis_client.delete("ticket_stats")