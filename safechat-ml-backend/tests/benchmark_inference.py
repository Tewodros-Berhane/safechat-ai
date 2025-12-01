"""
Quick inference benchmark to measure latency for short texts.
Run: python safechat-ml-backend/tests/benchmark_inference.py
"""
import asyncio
import statistics
import time

from app.services.ai_model import AIModel


async def benchmark(runs: int = 20):
    model = AIModel("Tewodros-Berhane/safechat-distilroberta-toxic-v1")
    await model.load()
    await model.warmup()

    samples = ["hello there", "you are terrible", "let's meet up", "awful message"] * (
        runs // 4 + 1
    )
    samples = samples[:runs]
    latencies = []
    for text in samples:
        start = time.time()
        await model.predict(text)
        latencies.append((time.time() - start) * 1000)
    print(f"Runs: {runs}")
    print(f"Avg ms: {statistics.mean(latencies):.2f}")
    print(f"P95 ms: {statistics.quantiles(latencies, n=20)[-1]:.2f}")
    print(f"Min/Max ms: {min(latencies):.2f}/{max(latencies):.2f}")


if __name__ == "__main__":
    asyncio.run(benchmark())

