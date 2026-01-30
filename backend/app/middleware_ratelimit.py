from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from fastapi import Request
import time
from collections import defaultdict
import threading

# Simple in-memory rate limiter (per IP, per endpoint)
class RateLimiterMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_requests=10, window_seconds=60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = defaultdict(list)  # {ip: [timestamps]}
        self.lock = threading.Lock()

    async def dispatch(self, request: Request, call_next):
        ip = request.client.host
        endpoint = request.url.path
        key = f"{ip}:{endpoint}"
        now = time.time()
        with self.lock:
            timestamps = self.requests[key]
            # Remove old timestamps
            self.requests[key] = [t for t in timestamps if now - t < self.window_seconds]
            if len(self.requests[key]) >= self.max_requests:
                return JSONResponse(
                    status_code=429,
                    content={"detail": f"Rate limit exceeded: {self.max_requests} requests per {self.window_seconds} seconds"}
                )
            self.requests[key].append(now)
        return await call_next(request)
