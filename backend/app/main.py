import sys
import os
import logging
import requests
import imaplib
import email
from email.header import decode_header
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from backend.app.routes_send import router_send
from backend.app.routes_read import router_read




# --- API Key Auth ---
from app.routes_send import router_send
from app.routes_read import router_read
from app.auth_utils import api_key_auth

# Ensure logs are flushed to the console
import sys
logging.basicConfig(level=logging.INFO, stream=sys.stdout, format='%(asctime)s - %(levelname)s - %(message)s', force=True, encoding='utf-8')
app = FastAPI()


# Middleware log ทุก request
class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        return response
app.add_middleware(LoggingMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins temporarily for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)




# Register routers for send/read mail
app.include_router(router_send)
app.include_router(router_read)

# Expected endpoints config
EXPECTED_ENDPOINTS = [
    {"path": "/send-email/", "methods": ["POST", "OPTIONS"]},
    {"path": "/predefined-messages/", "methods": ["GET", "HEAD"]},
    {"path": "/healthz", "methods": ["GET", "HEAD"]},
    {"path": "/system-status", "methods": ["GET", "HEAD"]},
]

def get_actual_endpoints():
    endpoints = []
    for route in app.routes:
        if hasattr(route, 'methods'):
            endpoints.append({
                "path": route.path,
                "methods": sorted(list(route.methods))
            })
    return endpoints

def check_frontend():
    try:
        resp = requests.get("http://localhost:3000", timeout=2)
        if resp.status_code == 200:
            return True, "ok"
        return False, f"status {resp.status_code}"
    except Exception as e:
        return False, str(e)

@app.get("/system-status")
async def system_status():
    # Endpoint check
    actual = get_actual_endpoints()
    found = 0
    for exp in EXPECTED_ENDPOINTS:
        for act in actual:
            if exp["path"] == act["path"] and all(m in act["methods"] for m in exp["methods"]):
                found += 1
                break
    all_endpoints_ok = found == len(EXPECTED_ENDPOINTS)

    # Backend status
    backend_status = "running"
    backend_detail = "ok"

    # Frontend status
    frontend_ok, frontend_detail = check_frontend()
    frontend_status = "running" if frontend_ok else "failed"

    # All service
    all_service = "running" if all([backend_status == "running", frontend_status == "running"]) else "failed"

    return {
        "endpoints_found": found,
        "endpoints_expected": len(EXPECTED_ENDPOINTS),
        "endpoints": actual,
        "all_endpoints_ok": all_endpoints_ok,
        "backend": backend_status,
        "frontend": frontend_status,
        "all_service": all_service,
        "details": {
            "backend": backend_detail,
            "frontend": frontend_detail
        }
    }
