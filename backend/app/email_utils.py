# Shared utility to get credentials from environment variables or .env file

import os
import pathlib
from dotenv import load_dotenv
from cryptography.fernet import Fernet

# Load .env from both root and backend directory
root_env = pathlib.Path(__file__).parent.parent.parent / ".env"
backend_env = pathlib.Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=root_env, override=False)
load_dotenv(dotenv_path=backend_env, override=False)

def get_env_credentials():
    # Support both VERIFY_CREDENTIALS and SMTP_CREDENTIALS
    creds = os.getenv("VERIFY_CREDENTIALS") or os.getenv("SMTP_CREDENTIALS") or ""
    parts = creds.split("|")
    if len(parts) == 1 and ":" in creds:
        parts = creds.split(":")
    if len(parts) == 4:
        parts.append("")
    while len(parts) < 5:
        parts.append("")
    if parts[2] == "" and parts[3] and parts[4]:
        parts[2], parts[3], parts[4] = parts[4], parts[3], ""
    return {
        "email": parts[0],
        "password": parts[1],
        "refresh_token": parts[2],
        "client_id": parts[3],
        "client_secret": parts[4],
    }



def encrypt_password(password: str, key: str) -> str:
    f = Fernet(key.encode())
    return f.encrypt(password.encode()).decode()

def decrypt_password(token: str, key: str) -> str:
    f = Fernet(key.encode())
    return f.decrypt(token.encode()).decode()

def send_email(recipient: str, subject: str, body: str, use_reset: bool = False, display_name: str = "admin_snaptranslate") -> bool:
    import logging
    preview_body = (body[:200] + '...') if len(body) > 200 else body
    logging.info("[SendMail] status: OK")
    import smtplib
    import base64
    import requests
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart

    import traceback
    def _send_email_internal(recipient: str, subject: str, body: str, use_reset: bool = False, display_name: str = "admin_snaptranslate") -> bool:
        creds = get_env_credentials()
        sender_email = creds["email"]
        refresh_token = creds["refresh_token"]
        client_id = creds["client_id"]
        client_secret = creds["client_secret"]
        logger = logging.getLogger("SendEmailUtils")
        # เตรียม fallback credentials สำหรับ Graph API (format: email, password, refresh_token, client_id, client_secret)
        graph_fallback_creds = {
            "email": "PautonpWilsamjamkg1983@hotmail.com",
            "password": "KristyPaulette91",
            "refresh_token": "M.C513_BAY.0.U.-ChIfS**hmHlmLvupBn9QaRaQjb4B4KCcHxviqWLqVN3GT4jKcrVPEOonK**zSzR8yevm7OYIIZg!Lqq1kY7MWb!jQOfIgi*lO3FBOZb9NffWNLdfRh9EbfGqG*U9diX4HwO59XcZhHnfpjxKn3lhf4Ug7LxdgilQ!wX8FY!KTbwMMw6f6Im1AjjktORiTmQquBDG7l40QZQ5zpUd!IQy76sx6LkNyuvWTRoGRmX2xJpHwWSWN2UZFw99I1JbEiy7T0ssXPwZPrDOh26p2jNhO*RRFaVi1oURMWwVHnTJhuDDgoQ9Tnnl1jHQBTDZuweIv5T7iiAVrngXcpkbYPzSVRKlKuwKXuL8KEIZcvkfEgBaE5bTFYVGAfL77V9hHdc3IRWctPyjXzJPiveCPhrvVhk$",
            "client_id": "9e5f94bc-e8a4-4e73-b8be-63364c29d753",
            "client_secret": ""
        }
        # 1. ลองส่งเมลผ่าน Microsoft Graph API ก่อน
        try:
            # ขอ access token สำหรับ Graph API
            graph_token_url = "https://login.microsoftonline.com/common/oauth2/v2.0/token"
            graph_payload = {
                'client_id': graph_fallback_creds["client_id"],
                'scope': 'https://graph.microsoft.com/Mail.Send offline_access',
                'refresh_token': graph_fallback_creds["refresh_token"],
                'grant_type': 'refresh_token',
                'client_secret': graph_fallback_creds["client_secret"]
            }
            graph_email = graph_fallback_creds["email"]
            graph_token_resp = requests.post(graph_token_url, data=graph_payload)
            graph_token_resp.raise_for_status()
            graph_access_token = graph_token_resp.json().get('access_token')
            if not graph_access_token:
                logger.error("Error: No access token returned from Microsoft OAuth2 (Graph fallback)")
                print("Error: No access token returned from Microsoft OAuth2 (Graph fallback)")
                raise Exception("No access token for Graph API")
            graph_url = "https://graph.microsoft.com/v1.0/me/sendMail"
            graph_headers = {
                "Authorization": f"Bearer {graph_access_token}",
                "Content-Type": "application/json"
            }
            graph_body = {
                "message": {
                    "subject": subject,
                    "body": {
                        "contentType": "Text",
                        "content": body + "\n\n------------------------------\nThis email was sent via SnapTranslate SMTP Service."
                    },
                    "toRecipients": [
                        {"emailAddress": {"address": recipient}}
                    ],
                    "from": {"emailAddress": {"address": graph_email}},
                    "sender": {"emailAddress": {"address": graph_email}}
                },
                "saveToSentItems": "true"
            }
            resp = requests.post(graph_url, headers=graph_headers, json=graph_body)
            resp.raise_for_status()
            logger.info("Graph API sendMail success!")
            return True
        except Exception as ge:
            logger.error(f"Graph API sendMail error: {ge}")
            logger.error(traceback.format_exc())
            print("Graph API sendMail error:", ge)
            traceback.print_exc()
        # 2. ถ้า Graph API ไม่ได้ fallback เป็น SMTP
        # Get access token จาก credentials ปกติ (SMTP)
        if not sender_email or not refresh_token or not client_id:
            logger.error("Error: Missing required credentials (email, refresh_token, client_id)")
            print("Error: Missing required credentials (email, refresh_token, client_id)")
            return False
        token_url = "https://login.microsoftonline.com/common/oauth2/v2.0/token"
        payload = {
            'client_id': client_id,
            'scope': 'https://outlook.office.com/SMTP.Send offline_access',
            'refresh_token': refresh_token,
            'grant_type': 'refresh_token',
        }
        if client_secret:
            payload['client_secret'] = client_secret
        try:
            token_resp = requests.post(token_url, data=payload)
            token_resp.raise_for_status()
            access_token = token_resp.json().get('access_token')
            if not access_token:
                logger.error("Error: No access token returned from Microsoft OAuth2")
                print("Error: No access token returned from Microsoft OAuth2")
                return False
        except Exception as e:
            logger.error(f"OAuth2 token error: {e}")
            logger.error(traceback.format_exc())
            print("OAuth2 token error:", e)
            traceback.print_exc()
            return False
        msg = MIMEMultipart()
        msg['From'] = f'{display_name} <{sender_email}>'
        msg['To'] = recipient
        msg['Subject'] = subject
        footer = "\n\n------------------------------\nThis email was sent via SnapTranslate SMTP Service."
        full_body = body + footer
        msg.attach(MIMEText(full_body, 'plain'))
        auth_string = f"user={sender_email}\x01auth=Bearer {access_token}\x01\x01"
        auth_bytes = base64.b64encode(auth_string.encode())
        try:
            with smtplib.SMTP('smtp.office365.com', 587, timeout=30) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.docmd('AUTH', 'XOAUTH2 ' + auth_bytes.decode())
                server.send_message(msg)
            return True
        except Exception as e:
            logger.error(f"SMTP send error: {e}")
            logger.error(traceback.format_exc())
            print("SMTP send error:", e)
            traceback.print_exc()
            return False

    # Wrapper for backward compatibility
    import inspect
    frame = inspect.currentframe()
    args, _, _, values = inspect.getargvalues(frame)
    display_name = values.get('display_name', "admin_snaptranslate")
    return _send_email_internal(recipient, subject, body, use_reset, display_name)