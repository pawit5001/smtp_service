// Copy _redirects from public to build after build (for Render/Netlify SPA routing)
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'public', '_redirects');
const dest = path.join(__dirname, 'build', '_redirects');

if (fs.existsSync(src)) {
  fs.copyFileSync(src, dest);
  console.log('Copied _redirects to build/');
} else {
  console.warn('No _redirects file found in public/');
}

// Copy static.json for Render SPA fallback
const staticSrc = path.join(__dirname, 'static.json');
const staticDest = path.join(__dirname, 'build', 'static.json');
if (fs.existsSync(staticSrc)) {
  fs.copyFileSync(staticSrc, staticDest);
  console.log('Copied static.json to build/');
}
