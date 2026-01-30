# SMTP Email Sender Service

## Overview
This project is a self-hosted, open-source tool for sending emails via SMTP (Microsoft 365/Outlook) with a customizable sender name. It consists of a FastAPI backend and a React frontend.

**Key Features:**
- Send emails with custom subject, body, and sender display name
- Secure with API Key (set by you)
- User-friendly web frontend for sending emails
- Ready for local or cloud deployment (Render, Railway, etc.)

---

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/smtp-email-sender.git
cd smtp-email-sender
```

### 2. Set up environment variables
- Copy `.env.example` to `.env` in both `backend/` and `frontend/` (see below for details).

### 3. Install dependencies and run

#### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
cd ../frontend
npm install
npm start
```

---

## Configuration

### Backend (`backend/.env`)
Example:
```
SMTP_CREDENTIALS=your_email@outlook.com:your_password_or_xxx:your_refresh_token:your_client_id
SMTP_SERVER=smtp.office365.com
SMTP_PORT=587
API_KEY=your_api_key_here
```

**Note:**
- This project is configured for Microsoft 365/Outlook (smtp.office365.com) only.
- You must use OAuth2 credentials (refresh_token, client_id) for secure authentication.
- Do not use Gmail or other providers.

### Frontend (`frontend/.env`)
Example:
```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_API_KEY=your_api_key_here
```

---

## Usage

1. Open the frontend in your browser (usually [http://localhost:3000](http://localhost:3000))
2. Fill in the email form: sender, recipient, subject, body, and (optionally) attachments
3. Click "Send" to send your email via your configured Microsoft 365/Outlook account
4. If there are errors (quota, spam, etc.), you will see a clear error message in the UI

---

## Deployment

You can deploy this project to Render, Railway, or any cloud provider that supports Python and Node.js.

**Basic steps:**
1. Push your code to GitHub
2. Deploy backend to your cloud provider (set environment variables in the dashboard)
3. Deploy frontend as a static site (e.g., Render Static Site, Vercel, Netlify)
4. Set the frontend API URL to point to your backend

---

## Documentation & Support

- The backend provides interactive API docs at `/docs` (Swagger UI) when running locally
- For advanced configuration, see comments in the codebase
- For issues, open an issue on GitHub

---

## License
MIT