# SMTP Email Sender Service

A full-stack project for sending emails via SMTP with a customizable sender name, built with FastAPI (Python backend) and React (frontend).

## Features
- Send emails with custom subject, body, and sender display name
- API secured with API Key
- Frontend form for easy email sending
- Ready for deployment (Render, Railway, etc.)

## Backend (FastAPI)
- Location: `backend/`
- Install dependencies:
  ```bash
  pip install -r requirements.txt
  ```
- Run locally:
  ```bash
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
  ```
- API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## Frontend (React)
- Location: `frontend/`
- Install dependencies:
  ```bash
  cd frontend
  npm install
  ```
- Run locally:
  ```bash
  npm start
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
- **Response:**
  - Success: `200 OK` `{ "message": "Email sent successfully" }`
  - Error: `400`/`500` with error message

### Read Emails
- **Endpoint:** `GET /read-emails`
- **Headers:**
  - `Authorization: Bearer <API_KEY>`
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

## License
MIT