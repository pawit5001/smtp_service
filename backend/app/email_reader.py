async def fetch_recent_emails_graph():
    """Fetch the most recent emails from the inbox using Microsoft Graph API (OAuth2)."""
    creds = get_env_credentials()
    refresh_token = creds["refresh_token"]
    client_id = creds["client_id"]
    client_secret = creds["client_secret"]
    # Get access token for Graph API
    token_url = "https://login.microsoftonline.com/common/oauth2/v2.0/token"
    payload = {
        'client_id': client_id,
        'scope': 'https://graph.microsoft.com/Mail.Read offline_access',
        'refresh_token': refresh_token,
        'grant_type': 'refresh_token',
    }
    if client_secret:
        payload['client_secret'] = client_secret
    resp = requests.post(token_url, data=payload)
    resp.raise_for_status()
    access_token = resp.json().get('access_token')
    if not access_token:
        raise Exception("No access token for Graph API")
    # Fetch messages from Microsoft Graph API
    graph_url = "https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages?$top=10&$orderby=receivedDateTime desc"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json"
    }
    r = requests.get(graph_url, headers=headers)
    r.raise_for_status()
    data = r.json()
    emails = []
    for msg in data.get("value", []):
        # Try to get plain text body, fallback to html if needed
        body_text = msg["body"].get("content") if msg["body"].get("contentType") == "text" else None
        body_html = msg["body"].get("content") if msg["body"].get("contentType") == "html" else None
        emails.append({
            "subject": msg.get("subject", ""),
            "from": msg.get("from", {}).get("emailAddress", {}).get("address", ""),
            "date": msg.get("receivedDateTime", ""),
            "body_text": body_text,
            "body_html": body_html,
            "headers": {},
            "attachments": [],
        })
    return emails
import os
import logging
import imaplib
import email
from email.header import decode_header
import requests
import asyncio
from functools import lru_cache
import ssl

from backend.app.email_utils import get_env_credentials
from backend.app.redis_cache import get_cached_emails, cache_emails

def get_oauth2_access_token(refresh_token, client_id, client_secret=None):
    data = {
        "client_id": client_id,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token",
        "scope": "https://outlook.office.com/IMAP.AccessAsUser.All offline_access"
    }
    if client_secret:
        data["client_secret"] = client_secret
    resp = requests.post("https://login.microsoftonline.com/common/oauth2/v2.0/token", data=data)
    resp.raise_for_status()
    return resp.json()["access_token"]

def imap_authenticate_xoauth2(imap, email_addr, access_token):
    auth_string = f"user={email_addr}\1auth=Bearer {access_token}\1\1"
    imap.authenticate("XOAUTH2", lambda x: auth_string.encode())

async def fetch_email(imap, num):
    try:
        typ, msg_data = await asyncio.to_thread(imap.fetch, num, "(RFC822)")
        if typ != "OK":
            logging.error("[ReadMail] status: FAIL")
            return {"error": f"Failed to fetch email ID {num}"}
        raw_email = msg_data[0][1]
        msg = email.message_from_bytes(raw_email)
        subject, encoding = decode_header(msg.get("Subject"))[0]
        if isinstance(subject, bytes):
            subject = subject.decode(encoding or "utf-8", errors="replace")
        from_ = msg.get("From", "")
        date_ = msg.get("Date", "")
        body_text = None
        body_html = None
        attachments = []
        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                content_disposition = str(part.get("Content-Disposition"))
                if content_type == "text/plain" and "attachment" not in content_disposition:
                    charset = part.get_content_charset() or "utf-8"
                    body_text = part.get_payload(decode=True).decode(charset, errors="replace")
                elif content_type == "text/html" and "attachment" not in content_disposition:
                    charset = part.get_content_charset() or "utf-8"
                    body_html = part.get_payload(decode=True).decode(charset, errors="replace")
                elif "attachment" in content_disposition:
                    filename = part.get_filename()
                    attachments.append({
                        "filename": filename,
                        "content_type": content_type,
                        "size": len(part.get_payload(decode=True)),
                    })
        else:
            content_type = msg.get_content_type()
            if content_type == "text/plain":
                charset = msg.get_content_charset() or "utf-8"
                body_text = msg.get_payload(decode=True).decode(charset, errors="replace")
            elif content_type == "text/html":
                charset = msg.get_content_charset() or "utf-8"
                body_html = msg.get_payload(decode=True).decode(charset, errors="replace")
        return {
            "subject": subject,
            "from": from_,
            "date": date_,
            "body_text": body_text,
            "body_html": body_html,
            "headers": dict(msg.items()),
            "attachments": attachments,
        }
    except Exception as e:
        logging.error("[ReadMail] status: FAIL")
        return {"error": str(e)}
    finally:
        pass

async def fetch_recent_emails(sort="desc", page=1, page_size=10, credentials=None):
    """Fetch emails from the inbox using IMAP and OAuth2, with sorting and pagination."""
    creds = get_env_credentials(credentials)
    email_addr = creds["email"]
        # Redis cache disabled
    refresh_token = creds["refresh_token"]
    client_id = creds["client_id"]
    client_secret = creds["client_secret"]
    access_token = get_oauth2_access_token(refresh_token, client_id, client_secret)
    imap_host = "outlook.office365.com"
    imap = imaplib.IMAP4_SSL(imap_host)
    try:
        imap_authenticate_xoauth2(imap, email_addr, access_token)
        await asyncio.to_thread(imap.select, "INBOX")
        typ, data = await asyncio.to_thread(imap.search, None, "ALL")
        if typ != "OK":
            return []
        mail_ids = data[0].split()
        if sort == "asc":
            mail_ids = mail_ids
        else:
            mail_ids = list(reversed(mail_ids))
        # Pagination
        start = (page - 1) * page_size
        end = start + page_size
        page_ids = mail_ids[start:end]
        emails = []
        for num in page_ids:
            res = await fetch_email(imap, num)
            emails.append(res)
        logging.info(f"[ReadMail] status: OK, returned {len(emails)} emails (page {page})")
            # Redis cache disabled
        return emails
    except Exception as e:
        logging.error(f"[ReadMail][IMAP] {e}")
        return [{"error": "เกิดข้อผิดพลาดในการเชื่อมต่อกล่องอีเมล กรุณาลองใหม่อีกครั้งหรือตรวจสอบการเชื่อมต่อ"}]
    finally:
        try:
            await asyncio.to_thread(imap.logout)
        except Exception:
            pass
