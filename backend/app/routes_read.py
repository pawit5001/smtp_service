from fastapi import APIRouter, HTTPException, Depends
from app.auth_utils import api_key_auth
from app.email_reader import fetch_recent_emails
import logging

router_read = APIRouter()

@router_read.get("/read-emails", tags=["Email"], summary="Read recent emails", description="Fetch recent emails from the inbox (requires API Key)")
async def read_emails(auth=Depends(api_key_auth)):
    logging.info("[ReadMail] /read-emails endpoint called")
    try:
        emails = await fetch_recent_emails()  # Await the coroutine once and store the result
        return {"emails": emails}
    except Exception as e:
        logging.error(f"[ReadMail] ERROR: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
