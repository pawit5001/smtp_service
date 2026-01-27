import logging
from fastapi import APIRouter, HTTPException
from app.email_utils import send_email
from pydantic import BaseModel
from app.auth_utils import api_key_auth
from fastapi import Depends

router_send = APIRouter(
    prefix="",
    tags=["Email"],
    dependencies=[Depends(api_key_auth)]
)

class EmailRequest(BaseModel):
    recipient: str
    subject: str
    body: str
    display_name: str = "admin_snaptranslate"

@router_send.post("/send-email/")
async def send_email_endpoint(email_request: EmailRequest):
    try:
        result = send_email(
            email_request.recipient,
            email_request.subject,
            email_request.body,
            display_name=email_request.display_name if hasattr(email_request, 'display_name') and email_request.display_name else "admin_snaptranslate"
        )
        if not result:
            raise Exception("Failed to send email (SMTP/OAuth2 error)")
        return {"message": "Email sent successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
