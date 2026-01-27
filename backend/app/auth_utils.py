import os
from fastapi import HTTPException, Request

API_KEY = os.getenv("REACT_APP_API_KEY", "changeme")

def api_key_auth(request: Request):
    auth = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid API Key")
    key = auth.split(" ", 1)[1]
    if key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API Key")
    return True
