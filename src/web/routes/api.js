// Update the obfuscate endpoint error handling

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
        
        // Obfuscate with better error handling
        try {
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
                    mode: 'auto', // Will show 'raw' or 'ast' in logs
                },
                features: options
            });
            
            logger.info(`✅ API obfuscation completed in ${duration}ms`);
            
        } catch (obfError) {
            logger.error('Obfuscation error:', obfError);
            
            // Provide helpful error messages
            let errorMessage = obfError.message;
            let suggestion = '';
            
            if (errorMessage.includes('parse')) {
                suggestion = 'The Lua code may have syntax errors. Try using "raw" mode or fix syntax issues.';
            } else if (errorMessage.includes('Invalid')) {
                suggestion = 'Please ensure your Lua code is valid and complete.';
            }
            
            res.status(400).json({ 
                error: errorMessage,
                suggestion: suggestion,
                tip: 'For already obfuscated code, the system automatically uses raw mode which works without parsing.'
            });
        }
        
    } catch (error) {
        logger.error('API error:', error);
        res.status(500).json({ 
            error: 'Server error: ' + error.message 
        });
    }
});
