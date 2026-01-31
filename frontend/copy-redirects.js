// Copy _redirects from public to build after build (for Render/Netlify SPA routing)
const fs = require('fs');
const path = require('path');

// No longer needed: _redirects/static.json (handled by Express server.js)
