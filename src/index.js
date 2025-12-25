require('dotenv').config();
const logger = require('./utils/logger');

// Start both bot and web server
async function main() {
    try {
        logger.info('Starting Lua Obfuscator Service...');
        
        // Start Discord Bot
        const bot = require('./bot');
        await bot.start();
        logger.info('Discord Bot started successfully');
        
        // Start Web Server
        const web = require('./web/server');
        await web.start();
        logger.info('Web Server started successfully');
        
        logger.info('All services running!');
    } catch (error) {
        logger.error('Failed to start services:', error);
        process.exit(1);
    }
}

main();

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});
