require('dotenv').config();
const logger = require('./utils/logger');

async function main() {
    try {
        logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        logger.info('🚀 Starting Lua Obfuscator Service v2.0');
        logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // Start Web Server (priority)
        logger.info('');
        logger.info('📡 Starting Web Server...');
        const web = require('./web/server');
        await web.start();
        logger.info(`✅ Web Server running on port ${process.env.PORT || 3000}`);
        
        // Try to start Discord Bot
        logger.info('');
        logger.info('🤖 Starting Discord Bot...');
        
        try {
            const bot = require('./bot');
            const botStarted = await bot.start();
            
            if (botStarted) {
                logger.info('✅ Discord Bot started successfully');
            } else {
                logger.warn('⚠️  Discord Bot not started');
            }
        } catch (botError) {
            logger.warn('⚠️  Discord Bot failed to start');
            logger.warn('Reason:', botError.message);
            logger.info('');
            logger.info('💡 To enable Discord bot:');
            logger.info('   1. Go to Render.com dashboard');
            logger.info('   2. Navigate to your web service');
            logger.info('   3. Click "Environment" tab');
            logger.info('   4. Add environment variables:');
            logger.info('      • DISCORD_TOKEN=your_bot_token');
            logger.info('      • DISCORD_CLIENT_ID=your_application_id');
            logger.info('   5. Redeploy the service');
        }
        
        // Summary
        logger.info('');
        logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        logger.info('✅ Service Status:');
        logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        logger.info(`🌐 Web Interface: ✅ RUNNING`);
        
        const bot = require('./bot');
        logger.info(`🤖 Discord Bot: ${bot.isReady ? '✅ CONNECTED' : '⚠️  DISABLED'}`);
        
        logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        logger.info(`🔗 Access: https://${process.env.RENDER_EXTERNAL_HOSTNAME || 'localhost:3000'}`);
        logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
    } catch (error) {
        logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        logger.error('❌ FATAL ERROR - Service failed to start');
        logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        logger.error('Error:', error.message);
        logger.error('Stack:', error.stack);
        logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        process.exit(1);
    }
}

main();

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully...');
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
    logger.error('Unhandled Rejection:', error);
});
