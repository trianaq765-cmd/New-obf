const express = require('express');
const router = express.Router();

// Home page
router.get('/', (req, res) => {
    res.render('index', {
        title: 'Lua Obfuscator - Advanced Protection',
        version: '2.0.0'
    });
});

// Documentation
router.get('/docs', (req, res) => {
    res.render('docs', {
        title: 'Documentation'
    });
});

// API Documentation
router.get('/api-docs', (req, res) => {
    res.render('api-docs', {
        title: 'API Documentation'
    });
});

module.exports = router;
