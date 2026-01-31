const express = require('express');
const path = require('path');
const app = express();
const buildPath = path.join(__dirname, 'build');

app.use(express.static(buildPath));

// SPA fallback: serve index.html for any unknown route
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('SPA server running on port', port));
