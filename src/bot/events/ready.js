const logger = require('../../utils/logger');

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        logger.info(`Discord bot ready! Logged in as ${client.user.tag}`);
        logger.info(`Serving ${client.guilds.cache.size} guilds`);
        
        // Set bot status
        client.user.setActivity('Lua Obfuscation | /obfuscate', { 
            type: 'WATCHING' 
        });
    }
};
