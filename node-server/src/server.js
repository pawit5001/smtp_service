const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Example route to proxy requests to the backend
app.post('/api/send-email', (req, res) => {
    // Here you would typically forward the request to the FastAPI backend
    // For demonstration, we will just send a mock response
    res.json({ message: 'Email sent successfully!' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});