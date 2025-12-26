const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const logger = require('../utils/logger');

class DiscordBot {
    constructor() {
        this.client = null;
        this.isReady = false;
    }
    
    async start() {
        try {
            // Validate config
            if (!config.discord || !config.discord.token) {
                logger.warn('Discord token not configured. Bot disabled.');
                return false;
            }
            
            if (!config.discord.clientId) {
                logger.warn('Discord client ID not configured. Bot disabled.');
                return false;
            }
            
            logger.info('Starting Discord bot...');
            
            // Initialize client
            this.client = new Client({
                intents: [
                    GatewayIntentBits.Guilds,
                    GatewayIntentBits.GuildMessages,
                ]
            });
            
            this.client.commands = new Map();
            
            // Load commands
            const commandsPath = path.join(__dirname, 'commands');
            if (fs.existsSync(commandsPath)) {
                const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
                for (const file of files) {
                    try {
                        const cmd = require(path.join(commandsPath, file));
                        if (cmd.data && cmd.execute) {
                            this.client.commands.set(cmd.data.name, cmd);
                            logger.info(`Loaded command: ${cmd.data.name}`);
                        }
                    } catch (err) {
                        logger.error(`Failed to load command ${file}:`, err.message);
                    }
                }
            }
            
            // Load events
            const eventsPath = path.join(__dirname, 'events');
            if (fs.existsSync(eventsPath)) {
                const files = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
                for (const file of files) {
                    try {
                        const event = require(path.join(eventsPath, file));
                        if (event.once) {
                            this.client.once(event.name, (...args) => event.execute(...args));
                        } else {
                            this.client.on(event.name, (...args) => event.execute(...args));
                        }
                        logger.info(`Loaded event: ${event.name}`);
                    } catch (err) {
                        logger.error(`Failed to load event ${file}:`, err.message);
                    }
                }
            }
            
            // Register commands
            await this.registerCommands();
            
            // Login
            await this.client.login(config.discord.token);
            
            // Wait for ready
            await new Promise(resolve => {
                this.client.once('ready', () => {
                    this.isReady = true;
                    logger.info(`✅ Discord bot ready: ${this.client.user.tag}`);
                    resolve();
                });
            });
            
            return true;
            
        } catch (error) {
            logger.error('Discord bot error:', error.message);
            
            // Detailed error messages
            if (error.code === 'TokenInvalid') {
                logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                logger.error('❌ INVALID DISCORD TOKEN');
                logger.error('Fix: Get new token from https://discord.com/developers/applications');
                logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            } else if (error.code === 10002) {
                logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                logger.error('❌ INVALID CLIENT ID');
                logger.error('Current ID:', config.discord.clientId);
                logger.error('Fix:');
                logger.error('1. Go to https://discord.com/developers/applications');
                logger.error('2. Select your bot');
                logger.error('3. Copy Application ID from General Information');
                logger.error('4. Set as DISCORD_CLIENT_ID in environment');
                logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            }
            
            throw error;
        }
    }
    
    async registerCommands() {
        const commands = [];
        const commandsPath = path.join(__dirname, 'commands');
        
        if (!fs.existsSync(commandsPath)) return;
        
        const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
        for (const file of files) {
            try {
                const cmd = require(path.join(commandsPath, file));
                if (cmd.data) commands.push(cmd.data.toJSON());
            } catch (err) {
                logger.error(`Error loading ${file}:`, err.message);
            }
        }
        
        if (commands.length === 0) return;
        
        const rest = new REST({ version: '10' }).setToken(config.discord.token);
        
        try {
            logger.info(`Registering ${commands.length} commands...`);
            
            await rest.put(
                Routes.applicationCommands(config.discord.clientId),
                { body: commands }
            );
            
            logger.info('✅ Commands registered successfully');
        } catch (error) {
            logger.error('Failed to register commands:', error.message);
            throw error;
        }
    }
}

module.exports = new DiscordBot();
