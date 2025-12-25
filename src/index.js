require('dotenv').config();
const logger = require('./utils/logger');

// Start both bot and web server
async function main() {
    try {
        logger.info('🚀 Starting Lua Obfuscator Service...');
        
        // Start Web Server (priority)
        const web = require('./web/server');
        await web.start();
        logger.info('✅ Web Server started successfully');
        logger.info(`🌐 Access at: http://localhost:${process.env.PORT || 3000}`);
        
        // Try to start Discord Bot (optional)
        try {
            const bot = require('./bot');
            const botStarted = await bot.start();
            
            if (botStarted) {
                logger.info('✅ Discord Bot started successfully');
            } else {
                logger.warn('⚠️  Discord Bot not started (this is OK - web service still works)');
            }
        } catch (botError) {
            logger.warn('⚠️  Discord Bot failed to start:', botError.message);
            logger.info('📝 To enable Discord bot:');
            logger.info('   1. Set DISCORD_TOKEN in environment variables');
            logger.info('   2. Set DISCORD_CLIENT_ID in environment variables');
            logger.info('   3. Restart the service');
        }
        
        logger.info('');
        logger.info('✅ All services running!');
        logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        logger.info('🌐 Web Interface: Available');
        logger.info('🤖 Discord Bot: ' + (require('./bot').isReady ? 'Connected' : 'Disabled'));
        logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
    } catch (error) {
        logger.error('❌ Failed to start services:', error);
        process.exit(1);
    }
}

main();

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
    logger.error('Unhandled Rejection:', error);
});
