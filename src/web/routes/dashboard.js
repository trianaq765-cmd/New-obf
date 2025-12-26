const express = require('express');
const router = express.Router();
const path = require('path');

// Home page
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../public/index.html'));
});

// Documentation
router.get('/docs', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Documentation - Lua Obfuscator</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <h1>📚 Documentation</h1>
        <hr>
        <h2>Features</h2>
        <ul>
            <li>Custom VM Virtualization</li>
            <li>AES-256 Encryption</li>
            <li>Anti-Debug Protection</li>
            <li>Anti-Tamper</li>
            <li>Anti-Dump</li>
            <li>String Encryption</li>
            <li>Variable Renaming</li>
            <li>Control Flow Obfuscation</li>
        </ul>
        <a href="/" class="btn btn-primary">Back to Home</a>
    </div>
</body>
</html>
    `);
});

// API Documentation
router.get('/api-docs', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>API Documentation - Lua Obfuscator</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .code-block {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <div class="container mt-5">
        <h1>🔌 API Documentation</h1>
        <hr>
        
        <h2>Endpoint: POST /api/v1/obfuscate</h2>
        <p>Obfuscate Lua code</p>
        
        <h3>Request</h3>
        <div class="code-block">
<pre>
POST /api/v1/obfuscate
Content-Type: application/json

{
  "code": "print('Hello World')",
  "preset": "medium",
  "vm": true,
  "antiDebug": true,
  "antiTamper": true
}
</pre>
        </div>
        
        <h3>Response</h3>
        <div class="code-block">
<pre>
{
  "success": true,
  "code": "-- obfuscated code here",
  "statistics": {
    "originalSize": 100,
    "obfuscatedSize": 500,
    "compressionRatio": "500%",
    "duration": "150ms",
    "preset": "medium"
  }
}
</pre>
        </div>
        
        <h3>Presets</h3>
        <ul>
            <li><strong>low</strong> - Fast, basic protection</li>
            <li><strong>medium</strong> - Balanced (recommended)</li>
            <li><strong>high</strong> - Strong protection</li>
            <li><strong>extreme</strong> - Maximum security</li>
        </ul>
        
        <h3>Example with cURL</h3>
        <div class="code-block">
<pre>
curl -X POST https://your-app.onrender.com/api/v1/obfuscate \\
  -H "Content-Type: application/json" \\
  -d '{"code":"print(\"Hello\")", "preset":"medium"}'
</pre>
        </div>
        
        <h3>Example with JavaScript</h3>
        <div class="code-block">
<pre>
fetch('/api/v1/obfuscate', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        code: 'print("Hello World")',
        preset: 'medium'
    })
})
.then(res => res.json())
.then(data => console.log(data.code));
</pre>
        </div>
        
        <a href="/" class="btn btn-primary mt-4">Back to Home</a>
    </div>
</body>
</html>
    `);
});

module.exports = router;
