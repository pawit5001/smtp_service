import logging
from fastapi import APIRouter, HTTPException
from backend.app.email_utils import send_email
from pydantic import BaseModel
from backend.app.auth_utils import api_key_auth
from fastapi import Depends

router_send = APIRouter(
    prefix="",
    tags=["Email"],
    dependencies=[Depends(api_key_auth)]
)

from pydantic import EmailStr, constr, validator




import logging
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from backend.app.email_utils import send_email
from backend.app.auth_utils import api_key_auth
from typing import List, Optional

router_send = APIRouter(
    prefix="",
    tags=["Email"],
    dependencies=[Depends(api_key_auth)]
)


from typing import List





import traceback




"""
Endpoint: /send-email/
รองรับ multipart/form-data (FormData) สำหรับส่งอีเมลแบบหลายผู้รับ, CC, แนบไฟล์, และเลือกวิธีส่ง (Graph API หรือ SMTP)
"""
from fastapi import Form, File, UploadFile
@router_send.post("/send-email/", response_model=None)
async def send_email_form(
    recipient: list[str] = Form(...),
    cc: list[str] = Form([]),
    subject: str = Form(...),
    body: str = Form(...),
    display_name: str = Form("admin_snaptranslate"),
    send_method: str = Form("graphapi"),
    credentials: str = Form(None),
    attachments: list[UploadFile] = File(None)
):
    results = []
    for rcpt in recipient:
        try:
            if send_method == "smtp":
                from backend.app.email_utils import send_email_smtp
                ok = send_email_smtp(
                    rcpt,
                    subject,
                    body,
                    display_name=display_name or "admin_snaptranslate",
                    use_reset=False,
                    credentials=credentials,
                    attachments=attachments,
                    cc=cc
                )
            else:
                from backend.app.email_utils import send_email
                ok = send_email(
                    rcpt,
                    subject,
                    body,
                    display_name=display_name or "admin_snaptranslate",
                    use_reset=False,
                    credentials=credentials,
                    attachments=attachments,
                    cc=cc
                )
            results.append({"recipient": str(rcpt), "success": bool(ok)})
        except Exception as e:
            logger = logging.getLogger("SendMail")
            logger.error(f"Failed: {e}")
            results.append({"recipient": str(rcpt), "success": False, "error": str(e)})
    return {"results": results}
