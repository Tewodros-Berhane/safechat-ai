import time
from typing import Any, Awaitable, Callable, Tuple


async def measure_latency_ms(coro: Callable[..., Awaitable[Any]], *args, **kwargs) -> Tuple[Any, float]:
    start = time.perf_counter()
    result = await coro(*args, **kwargs)
    end = time.perf_counter()
    latency_ms = (end - start) * 1000
    return result, latency_ms

