module.exports = {
    // Discord Configuration
    discord: {
        token: process.env.DISCORD_TOKEN || null,
        clientId: process.env.DISCORD_CLIENT_ID || null,
        guildId: process.env.DISCORD_GUILD_ID || null,
        prefix: process.env.PREFIX || '!',
        maxFileSize: 5 * 1024 * 1024, // 5MB
        enabled: Boolean(process.env.DISCORD_TOKEN && process.env.DISCORD_CLIENT_ID),
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
        uri: process.env.MONGODB_URI || null,
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    },
    
    // Security Configuration
    security: {
        jwtSecret: process.env.JWT_SECRET || 'default-secret-change-this-in-production',
        jwtExpiration: '7d',
        bcryptRounds: 12,
        maxRequestsPerMinute: 10,
        sessionSecret: process.env.SESSION_SECRET || 'session-secret-change-this-in-production',
    },
    
    // ... rest of config stays the same
    obfuscator: {
        features: {
            vm: {
                enabled: true,
                complexity: 'high',
                customOpcodes: true,
                registerShuffling: true,
                instructionMutation: true,
            },
            encryption: {
                aes256: true,
                xor: true,
                customCipher: true,
                layered: true,
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
                algorithm: 'aes256',
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
                algorithm: 'mangled',
                preserveGlobals: false,
            },
            junkCode: {
                enabled: true,
                density: 5,
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
        
        luraphFeatures: {
            vmObfuscation: true,
            nestedVirtualization: true,
            hybridExecution: true,
            polyglotEncryption: true,
            keyDerivation: true,
            saltedEncryption: true,
            instructionSubstitution: true,
            patternRandomization: true,
            semanticObfuscation: true,
            antiStaticAnalysis: true,
            antiDynamicAnalysis: true,
            antiPatternMatching: true,
            multiLayerProtection: 3,
            watermarking: true,
            fingerprintBinding: false,
        }
    },
    
    rateLimit: {
        windowMs: 15 * 60 * 1000,
        max: 100,
        skipSuccessfulRequests: false,
    },
    
    upload: {
        maxFileSize: 5 * 1024 * 1024,
        allowedExtensions: ['.lua', '.txt'],
        tempDir: './temp',
    },
};
