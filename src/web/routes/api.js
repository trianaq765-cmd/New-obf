const express = require('express');
const router = express.Router();
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const Obfuscator = require('../../obfuscator');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../../utils/logger');
const config = require('../../config/config');

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: { error: 'Too many requests, please try again later.' }
});

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: config.upload.maxFileSize
    },
    fileFilter: (req, file, cb) => {
        const ext = file.originalname.toLowerCase();
        if (ext.endsWith('.lua') || ext.endsWith('.txt')) {
            cb(null, true);
        } else {
            cb(new Error('Only .lua and .txt files are allowed'));
        }
    }
});

// Apply rate limiting to all API routes
router.use(apiLimiter);

// Obfuscate endpoint
router.post('/obfuscate', upload.single('file'), async (req, res) => {
    try {
        let sourceCode;
        
        // Get source code from file or body
        if (req.file) {
            sourceCode = req.file.buffer.toString('utf-8');
        } else if (req.body.code) {
            sourceCode = req.body.code;
        } else {
            return res.status(400).json({ 
                error: 'No source code provided. Send either a file or code in request body.' 
            });
        }
        
        // Validate source code
        if (!sourceCode || sourceCode.trim().length === 0) {
            return res.status(400).json({ error: 'Source code is empty' });
        }
        
        if (sourceCode.length > 5 * 1024 * 1024) {
            return res.status(400).json({ error: 'Source code too large (max 5MB)' });
        }
        
        // Parse options
        const options = {
            preset: req.body.preset || 'medium',
            vm: req.body.vm !== 'false',
            antiDebug: req.body.antiDebug !== 'false',
            antiTamper: req.body.antiTamper !== 'false',
            antiDump: req.body.antiDump !== 'false',
            stringEncryption: req.body.stringEncryption !== 'false',
            controlFlow: req.body.controlFlow !== 'false',
            junkCode: req.body.junkCode !== 'false',
            deadCode: req.body.deadCode !== 'false',
        };
        
        logger.info(`API obfuscation request - Preset: ${options.preset}, Size: ${sourceCode.length} bytes`);
        
        // Obfuscate
        const obfuscator = new Obfuscator(options);
        const startTime = Date.now();
        const obfuscated = await obfuscator.obfuscate(sourceCode);
        const duration = Date.now() - startTime;
        
        // Response
        res.json({
            success: true,
            code: obfuscated,
            statistics: {
                originalSize: sourceCode.length,
                obfuscatedSize: obfuscated.length,
                compressionRatio: ((obfuscated.length / sourceCode.length) * 100).toFixed(2) + '%',
                duration: duration + 'ms',
                preset: options.preset,
            },
            features: options
        });
        
        logger.info(`API obfuscation completed in ${duration}ms`);
        
    } catch (error) {
        logger.error('API obfuscation error:', error);
        res.status(500).json({ 
            error: 'Obfuscation failed: ' + error.message 
        });
    }
});

// Obfuscate with custom settings
router.post('/obfuscate/custom', upload.single('file'), async (req, res) => {
    try {
        let sourceCode;
        
        if (req.file) {
            sourceCode = req.file.buffer.toString('utf-8');
        } else if (req.body.code) {
            sourceCode = req.body.code;
        } else {
            return res.status(400).json({ error: 'No source code provided' });
        }
        
        // Custom settings
        const customSettings = req.body.settings ? JSON.parse(req.body.settings) : {};
        
        const obfuscator = new Obfuscator(customSettings);
        const startTime = Date.now();
        const obfuscated = await obfuscator.obfuscate(sourceCode);
        const duration = Date.now() - startTime;
        
        res.json({
            success: true,
            code: obfuscated,
            statistics: {
                originalSize: sourceCode.length,
                obfuscatedSize: obfuscated.length,
                duration: duration + 'ms',
            }
        });
        
    } catch (error) {
        logger.error('Custom obfuscation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get presets
router.get('/presets', (req, res) => {
    res.json({
        presets: {
            low: {
                name: 'Low',
                description: 'Fast obfuscation with basic protection',
                features: {
                    vm: false,
                    encryption: 'xor',
                    controlFlow: false,
                    junkDensity: 1
                }
            },
            medium: {
                name: 'Medium',
                description: 'Balanced protection and performance',
                features: {
                    vm: true,
                    encryption: 'aes256',
                    controlFlow: true,
                    junkDensity: 3
                }
            },
            high: {
                name: 'High',
                description: 'Strong protection with good performance',
                features: {
                    vm: true,
                    encryption: 'aes256',
                    controlFlow: true,
                    antiDebug: true,
                    antiTamper: true,
                    junkDensity: 5
                }
            },
            extreme: {
                name: 'Extreme',
                description: 'Maximum security (slower performance)',
                features: {
                    vm: true,
                    nestedVm: true,
                    encryption: 'multilayer',
                    controlFlow: true,
                    antiDebug: true,
                    antiTamper: true,
                    antiDump: true,
                    junkDensity: 8
                }
            }
        }
    });
});

// Statistics endpoint
router.get('/stats', (req, res) => {
    // This would typically come from database
    res.json({
        totalObfuscations: 12543,
        totalUsers: 1234,
        averageSize: '15.3 KB',
        uptime: process.uptime()
    });
});

module.exports = router;
