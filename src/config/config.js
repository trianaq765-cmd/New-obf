module.exports = {
    // Discord Configuration
    discord: {
        token: process.env.DISCORD_TOKEN,
        clientId: process.env.DISCORD_CLIENT_ID,
        guildId: process.env.DISCORD_GUILD_ID,
        prefix: process.env.PREFIX || '!',
        maxFileSize: 5 * 1024 * 1024, // 5MB
    },
    
    // Web Server Configuration
    web: {
        port: process.env.PORT || 3000,
        host: process.env.HOST || '0.0.0.0',
        apiVersion: 'v1',
        baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    },
    
    // Database Configuration
    database: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/obfuscator',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    },
    
    // Security Configuration
    security: {
        jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-this',
        jwtExpiration: '7d',
        bcryptRounds: 12,
        maxRequestsPerMinute: 10,
        sessionSecret: process.env.SESSION_SECRET || 'session-secret-change-this',
    },
    
    // Obfuscator Configuration (Luraph-style)
    obfuscator: {
        features: {
            vm: {
                enabled: true,
                complexity: 'high', // low, medium, high, extreme
                customOpcodes: true,
                registerShuffling: true,
                instructionMutation: true,
            },
            encryption: {
                aes256: true,
                xor: true,
                customCipher: true,
                layered: true, // Multi-layer encryption
            },
            antiTamper: {
                enabled: true,
                checksumVerification: true,
                integrityChecks: true,
                environmentDetection: true,
                debuggerDetection: true,
            },
            antiDebug: {
                enabled: true,
                antiHook: true,
                antiBreakpoint: true,
                timingChecks: true,
                stackTraceObfuscation: true,
            },
            antiDump: {
                enabled: true,
                memoryProtection: true,
                dumpDetection: true,
            },
            stringEncryption: {
                enabled: true,
                algorithm: 'aes256', // xor, aes256, custom
                pooling: true,
                encoding: true,
            },
            constantEncryption: {
                enabled: true,
                numbers: true,
                tables: true,
            },
            controlFlow: {
                enabled: true,
                flattening: true,
                opaquePredicates: true,
                fakeControlFlow: true,
            },
            variableRenaming: {
                enabled: true,
                algorithm: 'mangled', // simple, mangled, hexadecimal
                preserveGlobals: false,
            },
            junkCode: {
                enabled: true,
                density: 5, // 1-10
                realistic: true,
            },
            deadCode: {
                enabled: true,
                functions: true,
                branches: true,
            },
            optimization: {
                enabled: true,
                removeComments: true,
                removeWhitespace: true,
                constantFolding: true,
            },
        },
        
        // Luraph-specific features
        luraphFeatures: {
            // Virtualization
            vmObfuscation: true,
            nestedVirtualization: true, // VM inside VM
            hybridExecution: true, // Mix native + VM
            
            // Advanced encryption
            polyglotEncryption: true, // Multiple encryption methods
            keyDerivation: true,
            saltedEncryption: true,
            
            // Code mutation
            instructionSubstitution: true,
            patternRandomization: true,
            semanticObfuscation: true,
            
            // Anti-analysis
            antiStaticAnalysis: true,
            antiDynamicAnalysis: true,
            antiPatternMatching: true,
            
            // Protection layers
            multiLayerProtection: 3, // Number of protection layers
            watermarking: true,
            fingerprintBinding: false, // Bind to hardware (advanced)
        }
    },
    
    // Rate Limiting
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Max requests per windowMs
        skipSuccessfulRequests: false,
    },
    
    // File Upload
    upload: {
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedExtensions: ['.lua', '.txt'],
        tempDir: './temp',
    },
};
