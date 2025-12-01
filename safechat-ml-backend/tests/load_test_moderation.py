"""
Simple load test helper for the moderation API.
Run with: python -m pytest safechat-ml-backend/tests/load_test_moderation.py -s
or execute directly: python safechat-ml-backend/tests/load_test_moderation.py
"""
import asyncio
import time

import httpx

URL = "http://localhost:8000/moderate"


async def fire_request(client: httpx.AsyncClient, idx: int):
    payload = {"text": f"test message {idx}", "user_id": idx, "chat_id": 1}
    resp = await client.post(URL, json=payload)
    resp.raise_for_status()
    return resp.json()


async def run_load_test(total: int = 100):
    start = time.time()
    async with httpx.AsyncClient(timeout=10) as client:
        tasks = [fire_request(client, i) for i in range(total)]
        results = await asyncio.gather(*tasks, return_exceptions=True)
    duration = time.time() - start
    successes = sum(1 for r in results if not isinstance(r, Exception))
    print(f"Sent {total} requests in {duration:.2f}s ({total/duration:.1f} req/s)")
    print(f"Successes: {successes}/{total}")
    failures = [r for r in results if isinstance(r, Exception)]
    if failures:
        print(f"Failures: {len(failures)} - sample: {failures[0]}")


if __name__ == "__main__":
    asyncio.run(run_load_test())

