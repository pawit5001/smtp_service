# SMTP Email Sender Backend

This is the backend component of the SMTP Email Sender project, built using FastAPI. It provides an API for sending emails using SMTP.

## Project Structure

```
backend/
├── app/
│   ├── main.py                # Entry point for the FastAPI application
│   ├── email_utils.py         # Utility functions for sending SMTP emails
│   ├── models.py              # Data models for email requests
│   └── predefined_messages.py  # Predefined messages for account verification and reset codes
├── requirements.txt           # Python dependencies for the backend
└── README.md                  # Documentation for the backend
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd smtp-email-sender/backend
   ```

2. **Create a virtual environment:**
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. **Install dependencies:**
   ```
   pip install -r requirements.txt
   ```

4. **Run the FastAPI application:**
   ```
   uvicorn app.main:app --reload
   ```

## API Usage

### Send Email

- **Endpoint:** `POST /send-email`
- **Request Body:**
  ```json
  {
    "recipient": "string",
    "subject": "string",
    "body": "string"
  }
  ```

- **Response:**
  - Success: `200 OK`
  - Error: `400 Bad Request` or `500 Internal Server Error`

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.