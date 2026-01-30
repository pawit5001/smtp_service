
from fastapi import APIRouter, HTTPException, Depends

import logging
from backend.app.auth_utils import api_key_auth
from backend.app.email_reader import fetch_recent_emails, fetch_recent_emails_graph

router_read = APIRouter()


# ปิดการใช้งานอ่านเมลผ่าน Microsoft Graph API ชั่วคราว และแจ้งเหตุผล
@router_read.get("/read-emails-graph", tags=["Email"], summary="Read recent emails via Graph API", description="Fetch recent emails from the inbox using Microsoft Graph API (requires API Key)")
async def read_emails_graph(auth=Depends(api_key_auth)):
    logging.info("[ReadMail] /read-emails-graph endpoint called (disabled)")
    reason = (
        "ขออภัย ขณะนี้ยังไม่รองรับการอ่านอีเมลผ่าน Microsoft Graph API "
        "เนื่องจาก scope/สิทธิ์ของแอปพลิเคชันไม่ตรงกับที่ Microsoft อนุญาต "
        "(Mail.Read ไม่สามารถใช้กับ refresh_token ปัจจุบันได้) "
        "กรุณาใช้ IMAP/POP3 สำหรับการอ่านอีเมล"
    )
    raise HTTPException(status_code=501, detail=reason)


from fastapi import Query, Body
from pydantic import constr


# รองรับทั้ง POST (body) และ GET (query)
@router_read.post("/read-emails", tags=["Email"], summary="Read recent emails (POST)", description="Fetch recent emails from the inbox (requires API Key)")
async def read_emails_post(
    auth=Depends(api_key_auth),
    sort: str = Query("desc", description="Sort order: desc (newest first) or asc (oldest first)"),
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    page_size: int = Query(10, ge=1, le=50, description="Emails per page"),
    credentials: str = Body(default=None, embed=True)
):
    logging.info(f"[ReadMail] /read-emails (POST) endpoint called sort={sort} page={page} page_size={page_size}")
    try:
        emails = await fetch_recent_emails(sort=sort, page=page, page_size=page_size, credentials=credentials)
        return {"emails": emails}
    except Exception as e:
        logging.error(f"[ReadMail] ERROR: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router_read.get("/read-emails", tags=["Email"], summary="Read recent emails (GET)", description="Fetch recent emails from the inbox (requires API Key)")
async def read_emails_get(
    auth=Depends(api_key_auth),
    sort: str = Query("desc", description="Sort order: desc (newest first) or asc (oldest first)"),
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    page_size: int = Query(10, ge=1, le=50, description="Emails per page"),
    credentials: str = Query(default=None, description="Credentials string (optional)")
):
    logging.info(f"[ReadMail] /read-emails (GET) endpoint called sort={sort} page={page} page_size={page_size}")
    try:
        emails = await fetch_recent_emails(sort=sort, page=page, page_size=page_size, credentials=credentials)
        return {"emails": emails}
    except Exception as e:
        logging.error(f"[ReadMail] ERROR: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
