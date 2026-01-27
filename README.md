
# SMTP Email Sender Service

A free, open-source full-stack project for sending emails via SMTP with a customizable sender name, built with FastAPI (Python backend) and React (frontend).

---

## 🚀 Quick Start

1. **Clone the repository:**
  ```bash
  git clone https://github.com/yourusername/smtp-email-sender.git
  cd smtp-email-sender
  ```
2. **Set up environment variables:**
  - Copy `.env.example` to `.env` in both `backend/` and `frontend/` (see below for details).
3. **Install dependencies and run:**
  - Backend:
    ```bash
    cd backend
    pip install -r requirements.txt
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    ```
  - Frontend:
    ```bash
    cd ../frontend
    npm install
    npm start
    ```

---

## Features
- Send emails with custom subject, body, and sender display name
- API secured with API Key
- Frontend form for easy email sending
- Ready for deployment (Render, Railway, etc.)

## Backend (FastAPI)
- Location: `backend/`
- Install dependencies: `pip install -r requirements.txt`
- Run locally: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
- API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Environment Variables (backend/.env)
Create a `.env` file in the `backend/` directory with the following (example):
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
```

## Frontend (React)
* Make sure you have Microsoft 365/Outlook credentials and have registered your app for OAuth2 to obtain refresh_token and client_id.
- Location: `frontend/`
- Install dependencies: `npm install`
- Run locally: `npm start`

### Environment Variables (frontend/.env)
Create a `.env` file in the `frontend/` directory if you need to set the backend API URL:
```
REACT_APP_API_URL=http://localhost:8000
```



## API Documentation

### Send Email
- **Endpoint:** `POST /send-email/`
- **Headers:**
  - `Authorization: Bearer <API_KEY>`
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "display_name": "admin_snaptranslate",
    "recipient": "user@example.com",
    "subject": "Test",
    "body": "Hello"
  }
  ```
- **Example (curl):**
  ```bash
  curl -X POST http://localhost:8000/send-email/ \
    -H "Authorization: Bearer <API_KEY>" \
    -H "Content-Type: application/json" \
    -d '{
      "display_name": "admin_snaptranslate",
      "recipient": "user@example.com",
      "subject": "Test",
      "body": "Hello"
    }'
  ```
- **Response:**
  - Success: `200 OK` `{ "message": "Email sent successfully" }`
  - Error: `400`/`500` with error message

### Read Emails
- **Endpoint:** `GET /read-emails`
- **Headers:**
  - `Authorization: Bearer <API_KEY>`
- **Example (curl):**
  ```bash
  curl -X GET http://localhost:8000/read-emails \
    -H "Authorization: Bearer <API_KEY>"
  ```
- **Response:**
  - Success: `200 OK` with JSON:
    ```json
    {
      "emails": [
        {
          "subject": "...",
          "from": "...",
          "date": "...",
          "body_text": "..."
          // ...other fields
        }
      ]
    }
    ```
  - Error: `401`/`500` with error message

You can also explore and test the API interactively at `/docs` (Swagger UI) when the backend is running.

## Deployment
- Push your code to GitHub
- Deploy backend to Render, Railway, or similar (free tier available)
- Set environment variables for credentials and API key
- Share your public API URL and API key with trusted users

### Example Free Deployment (Render)
1. Create a new Web Service on [Render](https://render.com/)
2. Connect your GitHub repo
3. Set build/run command: `uvicorn app.main:app --host 0.0.0.0 --port 10000`
4. Add environment variables in Render dashboard
5. Deploy and get your public API URL

---


 
## License
MIT