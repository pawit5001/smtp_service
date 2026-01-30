
import os
import pathlib
from dotenv import load_dotenv
from cryptography.fernet import Fernet

# Load .env from both root and backend directory (for flexible deployment)
root_env = pathlib.Path(__file__).parent.parent.parent / ".env"
backend_env = pathlib.Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=root_env, override=False)
load_dotenv(dotenv_path=backend_env, override=False)

def get_env_credentials(credentials: str = None, sender: str = None, send_method: str = None):
    """
    Parse credentials string or environment variable into dict.
    Supports both | and : as separators. Returns dict with keys:
    email, password, refresh_token, client_id, client_secret
    If credentials is None, will use SMTP_CREDENTIALS_SEND for sending, SMTP_CREDENTIALS for reading (legacy), or fallback.
    """
    # Hardcoded credentials for sending
    CREDS_SMTP = "scavelli20322@outlook.com:E9KFDQHK72:M.C525_BAY.0.U.-Cr2ahYnR0lKDamU!PsNLhZjitfSxG5nWVXX*e80FlN2v7ds8KjPnQJS49uWLNeSjm28StMZzxrMDkZcG!VCOEbLQPoAL47VUKF5LArrGFFumN1EEIdrJGgTsic31r3jgjWD9M6APy13ZA*Z!acADB0!UTuGWd9EDoX8fzHXz6pMRv7N25!UnxpP6xAVIkAiMO3Oc8y2qxUmXn*9H85yR6rzKHFxAfmJjVtR3QXkWrFo8svzckWd!1xEmQFuCpJf5yTqJT9HTPERq1WSTWSpuuKo4P*U9k3MMP5IbGbzf1q77GeNa3zEOBf0V6RBRH04N!JViKhoYPHg66SMg1pEcC35!ykJOdFDP5B87SRO3ue3JwMNC2BYvKSnvLzLvTOsdK140o8uwMKOTz01OGSHG7pnCKcQvWlyVw9RAFvdRkkcG2Utm9bL0JLMSZFZlpnKyo*Pm9EuZwpMI33ARhKQsYA4$:9e5f94bc-e8a4-4e73-b8be-63364c29d753"
    CREDS_GRAPH_API = "xvrifkhiss3889@hotmail.com|btkulnpgqc6633|M.C514_BAY.0.U.-CtJ7GCOdTQTBpb9P4kmJIg21RM72jCtBfhs0UTewbfrvLjb5Qi63vsnpSQoMrDnZmQ1M7wBZS2JdvFMM5xFmj2xcqDA6adQ6Qj3voyxcA!m8OzrSYOO4gn0KQkfeaoBBTIDAJxtrDy3CZy99MaoXzOqud8Iw22Pivbe0!G1vUXlDtOouwHAkuHCk!ErR8i5JRWZgpjKlKyCl18uubG*4HMoRo2yEo1cSnkHjImCRNa2GQ5SaVrMLTK8OUZTdHxaSau8zaejKaDXIdMXvjpXSW6KZxY9tHfIG1ANpb0o!2SFSsYmPyZQ59E8gjxlJYFe564wXlobB00G6TUO9f9Qzys5NEOPl5zx28vGMgP6alrIcA1HrX!ZpQIu3NbfmzWvGk1izNpFWpdbZyP0Z4sSiJmf6NMaN1bog5E9zxdZI9Y5y|9e5f94bc-e8a4-4e73-b8be-63364c29d753"
    import logging
    if credentials:
        creds = credentials
        logging.info(f"[get_env_credentials] Using explicit credentials param (len={len(creds)})")
        print(f"[get_env_credentials] Using explicit credentials param (len={len(creds)})")
    elif sender:
        if sender.lower().startswith("scavelli"):
            creds = CREDS_SMTP
            logging.info("[get_env_credentials] Using scavelli20322@outlook.com for send (explicit sender)")
            print("[get_env_credentials] Using scavelli20322@outlook.com for send (explicit sender)")
        elif sender.lower().startswith("xvrifkhiss3889"):
            creds = CREDS_GRAPH_API
            logging.info("[get_env_credentials] Using xvrifkhiss3889@hotmail.com for send (explicit sender)")
            print("[get_env_credentials] Using xvrifkhiss3889@hotmail.com for send (explicit sender)")
        else:
            creds = CREDS_SMTP
            logging.info("[get_env_credentials] Using scavelli20322@outlook.com for send (default fallback)")
            print("[get_env_credentials] Using scavelli20322@outlook.com for send (default fallback)")
    else:
        # Detect if this is a send or read operation by call context
        import inspect
        stack = inspect.stack()
        caller = stack[1].function if len(stack) > 1 else ""
        if caller in ["send_email", "send_email_smtp"]:
            creds = CREDS_SMTP
            logging.info("[get_env_credentials] Using scavelli20322@outlook.com for send (default)")
            print("[get_env_credentials] Using scavelli20322@outlook.com for send (default)")
        else:
            creds = CREDS_GRAPH_API
            logging.info("[get_env_credentials] Using xvrifkhiss3889@hotmail.com for read (default)")
            print("[get_env_credentials] Using xvrifkhiss3889@hotmail.com for read (default)")
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
    """Encrypt password with Fernet key (not used in main flow)"""
    f = Fernet(key.encode())
    return f.encrypt(password.encode()).decode()

def decrypt_password(token: str, key: str) -> str:
    """Decrypt password with Fernet key (not used in main flow)"""
    f = Fernet(key.encode())
    return f.decrypt(token.encode()).decode()

def send_email(recipient: str, subject: str, body: str, use_reset: bool = False, display_name: str = "admin_snaptranslate", credentials: str = None, attachments=None, cc=None, sender: str = None, send_method: str = None) -> bool:
    """
    Send email using Microsoft Graph API (primary) or fallback to SMTP if Graph fails.
    Supports attachments and CC. Returns True if sent, False if error.
    Uses SMTP_CREDENTIALS_SEND for sending by default (unless credentials is provided).
    """
    import logging
    import smtplib
    import base64
    import requests
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    import traceback
    preview_body = (body[:200] + '...') if len(body) > 200 else body
    logging.info("[SendMail] status: OK")
    creds = get_env_credentials(credentials, sender=sender, send_method=send_method)
    sender_email = creds["email"]
    refresh_token = creds["refresh_token"]
    client_id = creds["client_id"]
    client_secret = creds["client_secret"]
    logger = logging.getLogger("SendEmailUtils")
    # 1. ลองส่งเมลผ่าน Microsoft Graph API ก่อน (ใช้ user credentials ถ้ามี)
    try:
        graph_token_url = "https://login.microsoftonline.com/common/oauth2/v2.0/token"
        graph_payload = {
            'client_id': client_id,
            'scope': 'https://graph.microsoft.com/Mail.Send offline_access',
            'refresh_token': refresh_token,
            'grant_type': 'refresh_token',
        }
        if client_secret:
            graph_payload['client_secret'] = client_secret
        graph_email = sender_email
        graph_token_resp = requests.post(graph_token_url, data=graph_payload)
        print("[GraphAPI] Token response text:", graph_token_resp.text)
        graph_token_resp.raise_for_status()
        graph_access_token = graph_token_resp.json().get('access_token')
        if not graph_access_token:
            logger.error("Error: No access token returned from Microsoft OAuth2 (Graph)")
            print("Error: No access token returned from Microsoft OAuth2 (Graph)")
            raise Exception("No access token for Graph API")
        graph_url = "https://graph.microsoft.com/v1.0/me/sendMail"
        graph_headers = {
            "Authorization": f"Bearer {graph_access_token}",
            "Content-Type": "application/json"
        }
        # Build attachments for Graph API
        graph_attachments = []
        if attachments:
            for file in attachments:
                content_bytes = file.file.read()
                import base64 as b64
                graph_attachments.append({
                    "@odata.type": "#microsoft.graph.fileAttachment",
                    "name": file.filename,
                    "contentType": file.content_type,
                    "contentBytes": b64.b64encode(content_bytes).decode('utf-8')
                })
                file.file.seek(0)
        graph_body = {
            "message": {
                "subject": subject,
                "body": {
                    "contentType": "Text",
                    "content": body + "\n\n------------------------------\nThis email was sent via SnapMail Powered by SnapTranslate."
                },
                "toRecipients": [
                    {"emailAddress": {"address": recipient}}
                ],
                "ccRecipients": [
                    {"emailAddress": {"address": addr}}
                    for addr in (cc if cc else [])
                ],
                "from": {"emailAddress": {"address": graph_email}},
                "sender": {"emailAddress": {"address": graph_email}},
                "attachments": graph_attachments if graph_attachments else []
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
    if cc:
        msg['Cc'] = ', '.join(cc)
    footer = "\n\n------------------------------\nThis email was sent via SnapMail Powered by SnapTranslate."
    full_body = body + footer
    msg.attach(MIMEText(full_body, 'plain'))
    # Attach files with correct MIME type (fix .bin issue)
    import mimetypes
    if attachments:
        for file in attachments:
            if hasattr(file, 'file') and hasattr(file, 'filename'):
                from email.mime.base import MIMEBase
                from email.mime.application import MIMEApplication
                from email import encoders
                ctype = getattr(file, 'content_type', None) or mimetypes.guess_type(file.filename)[0] or 'application/octet-stream'
                maintype, subtype = ctype.split('/', 1) if '/' in ctype else ('application', 'octet-stream')
                file_bytes = file.file.read()
                if maintype == 'text':
                    from email.mime.text import MIMEText
                    part = MIMEText(file_bytes.decode('utf-8', errors='ignore'), _subtype=subtype)
                elif maintype == 'application' and subtype == 'pdf':
                    part = MIMEApplication(file_bytes, _subtype='pdf')
                else:
                    part = MIMEBase(maintype, subtype)
                    part.set_payload(file_bytes)
                    encoders.encode_base64(part)
                part.add_header('Content-Disposition', f'attachment; filename="{file.filename}"')
                part.add_header('Content-Type', ctype)
                msg.attach(part)
                file.file.seek(0)
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
        import smtplib
        logger.error(f"SMTP send error: {e}")
        logger.error(traceback.format_exc())
        print("SMTP send error:", e)
        traceback.print_exc()
        # Special handling for OutboundSpamException
        if isinstance(e, smtplib.SMTPDataError) and b'OutboundSpamException' in str(e).encode():
            raise Exception("บัญชีอีเมลนี้ถูกจำกัดการส่งเมลออกโดย Microsoft (OutboundSpamException: RefuseQuota, ShowTierUpgrade) กรุณาเปลี่ยนบัญชีหรือรอให้ระบบปลดล็อก")
        return False

def send_email_smtp(recipient: str, subject: str, body: str, use_reset: bool = False, display_name: str = "admin_snaptranslate", credentials: str = None, attachments=None, cc=None) -> bool:
    """
    Send email using SMTP only (no fallback). Supports attachments and CC. Returns True if sent, False if error.
    Uses SMTP_CREDENTIALS_SEND for sending by default (unless credentials is provided).
    """
    import logging
    import smtplib
    import base64
    import requests
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    import traceback
    preview_body = (body[:200] + '...') if len(body) > 200 else body
    logging.info("[SendMail][SMTP only] status: OK")
    creds = get_env_credentials(credentials)
    sender_email = creds["email"]
    refresh_token = creds["refresh_token"]
    client_id = creds["client_id"]
    client_secret = creds["client_secret"]
    logger = logging.getLogger("SendEmailSMTP")
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
    from email.mime.base import MIMEBase
    from email import encoders
    msg = MIMEMultipart()
    msg['From'] = f'{display_name} <{sender_email}>'
    msg['To'] = recipient
    msg['Subject'] = subject
    if cc:
        msg['Cc'] = ', '.join(cc)
    footer = "\n\n------------------------------\nThis email was sent via SnapMail Powered by SnapTranslate."
    full_body = body + footer
    msg.attach(MIMEText(full_body, 'plain'))
    # Attach files with correct MIME type (fix .bin issue)
    import mimetypes
    if attachments:
        for file in attachments:
            if hasattr(file, 'file') and hasattr(file, 'filename'):
                from email.mime.base import MIMEBase
                from email.mime.application import MIMEApplication
                from email import encoders
                ctype = getattr(file, 'content_type', None) or mimetypes.guess_type(file.filename)[0] or 'application/octet-stream'
                maintype, subtype = ctype.split('/', 1) if '/' in ctype else ('application', 'octet-stream')
                file_bytes = file.file.read()
                if maintype == 'text':
                    from email.mime.text import MIMEText
                    part = MIMEText(file_bytes.decode('utf-8', errors='ignore'), _subtype=subtype)
                elif maintype == 'application' and subtype == 'pdf':
                    part = MIMEApplication(file_bytes, _subtype='pdf')
                else:
                    part = MIMEBase(maintype, subtype)
                    part.set_payload(file_bytes)
                    encoders.encode_base64(part)
                part.add_header('Content-Disposition', f'attachment; filename="{file.filename}"')
                part.add_header('Content-Type', ctype)
                msg.attach(part)
                file.file.seek(0)
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
        import smtplib
        logger.error(f"SMTP send error: {e}")
        logger.error(traceback.format_exc())
        print("SMTP send error:", e)
        traceback.print_exc()
        # Special handling for OutboundSpamException
        if isinstance(e, smtplib.SMTPDataError) and b'OutboundSpamException' in str(e).encode():
            raise Exception("บัญชีอีเมลนี้ถูกจำกัดการส่งเมลออกโดย Microsoft (OutboundSpamException: RefuseQuota, ShowTierUpgrade) กรุณาเปลี่ยนบัญชีหรือรอให้ระบบปลดล็อก")
        return False