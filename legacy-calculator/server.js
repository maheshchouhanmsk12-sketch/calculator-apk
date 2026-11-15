const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

let currentPort = Number(process.env.PORT) || 3000;
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  // Normalize request url
  let reqPath = req.url === '/' ? '/index.html' : req.url;
  let safePath = path.join(__dirname, path.normalize(reqPath));

  // Security check to avoid directory traversal
  if (!safePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(safePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'text/plain';

  fs.readFile(safePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File not found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

function startServer(port) {
  server.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log(`\n========================================`);
    console.log(`🚀 ExamCalc Local Server Running!`);
    console.log(`👉 Open in Browser: ${url}`);
    console.log(`Press Ctrl + C to stop the server`);
    console.log(`========================================\n`);

    // Automatically open browser on Windows
    exec(`start ${url}`);
  });
}

// Graceful auto-port fallback if port is already in use
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`⚠️ Port ${currentPort} is currently in use. Automatically trying port ${currentPort + 1}...`);
    currentPort++;
    startServer(currentPort);
  } else {
    console.error('Server error:', err);
  }
});

startServer(currentPort);
