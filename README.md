# SMTP Email Sender Project

This project is a full-stack application for sending SMTP emails. It consists of a backend built with FastAPI, a frontend developed using React with TypeScript, and a Node.js server for handling requests.

## Project Structure

```
smtp-email-sender
├── backend
│   ├── app
│   │   ├── main.py
│   │   ├── email_utils.py
│   │   ├── models.py
│   │   └── predefined_messages.py
│   ├── requirements.txt
│   └── README.md
├── frontend
│   ├── public
│   │   └── index.html
│   ├── src
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   ├── components
│   │   │   ├── MessageForm.tsx
│   │   │   └── PredefinedMessages.tsx
│   │   ├── pages
│   │   │   └── Home.tsx
│   │   ├── styles
│   │   │   └── tailwind.css
│   │   └── types
│   │       └── index.ts
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── README.md
├── node-server
│   ├── src
│   │   └── server.js
│   ├── package.json
│   └── README.md
└── README.md
```

## Backend

The backend is implemented using FastAPI and is responsible for handling email requests. It includes:

- **main.py**: Entry point for the FastAPI application, setting up routes for sending emails.
- **email_utils.py**: Contains utility functions for sending SMTP emails.
- **models.py**: Defines data models for email requests.
- **predefined_messages.py**: Exports predefined messages for account verification and reset codes.
- **requirements.txt**: Lists the required Python dependencies.

### Setup Instructions

1. Navigate to the `backend` directory.
2. Install the required packages using pip:
   ```
   pip install -r requirements.txt
   ```
3. Run the FastAPI application:
   ```
   uvicorn app.main:app --reload
   ```

## Frontend

The frontend is built with React and TypeScript, styled using Tailwind CSS. It includes:

- **App.tsx**: Main component that sets up routing and layout.
- **MessageForm.tsx**: Component for users to write their own messages.
- **PredefinedMessages.tsx**: Component for selecting predefined messages.
- **Home.tsx**: Home page that includes both components.

### Setup Instructions

1. Navigate to the `frontend` directory.
2. Install the required packages using npm:
   ```
   npm install
   ```
3. Start the React application:
   ```
   npm start
   ```

## Node.js Server

The Node.js server can be used to proxy requests or serve static files. It includes:

- **server.js**: Sets up a simple Node.js server.
- **package.json**: Lists dependencies and scripts.

### Setup Instructions

1. Navigate to the `node-server` directory.
2. Install the required packages using npm:
   ```
   npm install
   ```
3. Start the Node.js server:
   ```
   node src/server.js
   ```

## Conclusion

This project provides a complete solution for sending SMTP emails with customizable messages. Follow the setup instructions for each part of the application to get started.