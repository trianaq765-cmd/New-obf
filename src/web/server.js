const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const session = require('express-session');
const path = require('path');
const config = require('../config/config');
const logger = require('../utils/logger');

class WebServer {
    constructor() {
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
    }
    
    setupMiddleware() {
        // Security
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
                    scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
                    imgSrc: ["'self'", "data:", "https:"],
                }
            }
        }));
        
        // CORS
        this.app.use(cors({
            origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
            credentials: true
        }));
        
        // Compression
        this.app.use(compression());
        
        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
        
        // Session (without MongoDB if not configured)
        if (config.database.uri) {
            const MongoStore = require('connect-mongo');
            this.app.use(session({
                secret: config.security.sessionSecret,
                resave: false,
                saveUninitialized: false,
                store: MongoStore.create({
                    mongoUrl: config.database.uri,
                    touchAfter: 24 * 3600
                }),
                cookie: {
                    secure: process.env.NODE_ENV === 'production',
                    httpOnly: true,
                    maxAge: 1000 * 60 * 60 * 24 * 7
                }
            }));
        } else {
            // Use memory store if MongoDB not configured
            this.app.use(session({
                secret: config.security.sessionSecret,
                resave: false,
                saveUninitialized: false,
                cookie: {
                    secure: process.env.NODE_ENV === 'production',
                    httpOnly: true,
                    maxAge: 1000 * 60 * 60 * 24 * 7
                }
            }));
        }
        
        // Static files
        this.app.use(express.static(path.join(__dirname, '../../public')));
        
        // View engine
        this.app.set('view engine', 'ejs');
        this.app.set('views', path.join(__dirname, '../../views'));
        
        // Request logging
        this.app.use((req, res, next) => {
            logger.info(`${req.method} ${req.path} - ${req.ip}`);
            next();
        });
    }
    
    setupRoutes() {
        // API Routes
        this.app.use('/api/v1', require('./routes/api'));
        
        // Dashboard Routes
        this.app.use('/', require('./routes/dashboard'));
        
        // Health check
        this.app.get('/health', (req, res) => {
            const discordBot = require('../bot');
            res.json({ 
                status: 'ok',
                services: {
                    web: 'running',
                    discord: discordBot.isReady ? 'connected' : 'disabled'
                },
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            });
        });
        
        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({ error: 'Not Found' });
        });
        
        // Error handler
        this.app.use((err, req, res, next) => {
            logger.error('Error:', err);
            res.status(err.status || 500).json({
                error: err.message || 'Internal Server Error'
            });
        });
    }
    
    async start() {
        return new Promise((resolve, reject) => {
            this.server = this.app.listen(config.web.port, config.web.host, (err) => {
                if (err) {
                    logger.error('Failed to start web server:', err);
                    reject(err);
                } else {
                    logger.info(`🌐 Web server running on ${config.web.host}:${config.web.port}`);
                    resolve();
                }
            });
        });
    }
}

module.exports = new WebServer();
