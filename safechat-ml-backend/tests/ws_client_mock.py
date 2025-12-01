"""
Mock WebSocket client to exercise the moderation stream.
Run: python safechat-ml-backend/tests/ws_client_mock.py
"""
import asyncio
import json

import websockets

WS_URL = "ws://localhost:8000/ws/moderation"


async def main():
    async with websockets.connect(WS_URL) as ws:
        payload = {"text": "hello world", "user_id": 1, "chat_id": 1}
        await ws.send(json.dumps(payload))
        result = await ws.recv()
        print("Result:", result)

        payload = {"text": "I hate you", "user_id": 2, "chat_id": 2}
        await ws.send(json.dumps(payload))
        result = await ws.recv()
        print("Result:", result)


if __name__ == "__main__":
    asyncio.run(main())

