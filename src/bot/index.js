const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const logger = require('../utils/logger');

class DiscordBot {
    constructor() {
        this.client = null;
        this.isReady = false;
        this.commands = new Collection();
    }
    
    /**
     * Initialize Discord client
     */
    initializeClient() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ]
        });
        
        this.client.commands = new Collection();
    }
    
    /**
     * Load commands from directory
     */
    loadCommands() {
        const commandsPath = path.join(__dirname, 'commands');
        
        if (!fs.existsSync(commandsPath)) {
            logger.warn('⚠️  Commands directory not found, creating...');
            fs.mkdirSync(commandsPath, { recursive: true });
            return;
        }
        
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        
        if (commandFiles.length === 0) {
            logger.warn('⚠️  No command files found');
            return;
        }
        
        for (const file of commandFiles) {
            try {
                const filePath = path.join(commandsPath, file);
                const command = require(filePath);
                
                if ('data' in command && 'execute' in command) {
                    this.client.commands.set(command.data.name, command);
                    logger.info(`✅ Loaded command: ${command.data.name}`);
                } else {
                    logger.warn(`⚠️  Command ${file} is missing required properties`);
                }
            } catch (error) {
                logger.error(`❌ Error loading command ${file}:`, error.message);
            }
        }
    }
    
    /**
     * Load events from directory
     */
    loadEvents() {
        const eventsPath = path.join(__dirname, 'events');
        
        if (!fs.existsSync(eventsPath)) {
            logger.warn('⚠️  Events directory not found, creating...');
            fs.mkdirSync(eventsPath, { recursive: true });
            return;
        }
        
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
        
        if (eventFiles.length === 0) {
            logger.warn('⚠️  No event files found');
            return;
        }
        
        for (const file of eventFiles) {
            try {
                const filePath = path.join(eventsPath, file);
                const event = require(filePath);
                
                if (event.once) {
                    this.client.once(event.name, (...args) => event.execute(...args, this.client));
                } else {
                    this.client.on(event.name, (...args) => event.execute(...args, this.client));
                }
                
                logger.info(`✅ Loaded event: ${event.name}`);
            } catch (error) {
                logger.error(`❌ Error loading event ${file}:`, error.message);
            }
        }
    }
    
    /**
     * Register slash commands with Discord
     */
    async registerCommands() {
        if (!config.discord.token) {
            logger.error('❌ DISCORD_TOKEN is not set');
            return false;
        }
        
        if (!config.discord.clientId) {
            logger.error('❌ DISCORD_CLIENT_ID is not set');
            return false;
        }
        
        const commands = [];
        const commandsPath = path.join(__dirname, 'commands');
        
        if (!fs.existsSync(commandsPath)) {
            logger.warn('⚠️  No commands to register');
            return false;
        }
        
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            try {
                const command = require(`./commands/${file}`);
                if (command.data) {
                    commands.push(command.data.toJSON());
                }
            } catch (error) {
                logger.error(`❌ Error loading command ${file}:`, error.message);
            }
        }
        
        if (commands.length === 0) {
            logger.warn('⚠️  No commands to register');
            return false;
        }
        
        const rest = new REST({ version: '10' }).setToken(config.discord.token);
        
        try {
            logger.info(`🔄 Registering ${commands.length} slash commands...`);
            logger.info(`📝 Client ID: ${config.discord.clientId}`);
            
            const data = await rest.put(
                Routes.applicationCommands(config.discord.clientId),
                { body: commands }
            );
            
            logger.info(`✅ Successfully registered ${data.length} slash commands`);
            return true;
            
        } catch (error) {
            logger.error('❌ Failed to register commands:', error.message);
            
            if (error.code === 10002) {
                logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                logger.error('❌ DISCORD_CLIENT_ID is INVALID!');
                logger.error('');
                logger.error('📝 How to fix:');
                logger.error('1. Go to: https://discord.com/developers/applications');
                logger.error('2. Select your bot application');
                logger.error('3. Go to "General Information" tab');
                logger.error('4. Copy "Application ID"');
                logger.error('5. Set it as DISCORD_CLIENT_ID in Render.com environment variables');
                logger.error('');
                logger.error(`Current value: ${config.discord.clientId}`);
                logger.error(`Token starts with: ${config.discord.token ? config.discord.token.substring(0, 30) + '...' : 'NOT SET'}`);
                logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            } else if (error.code === 'TOKEN_INVALID') {
                logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                logger.error('❌ DISCORD_TOKEN is INVALID!');
                logger.error('Get a new token from: https://discord.com/developers/applications');
                logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            } else if (error.code === 50001) {
                logger.error('❌ Bot lacks OAuth2 permissions');
                logger.error('Make sure bot has "applications.commands" scope');
            } else {
                logger.error('Full error:', error);
            }
            
            return false;
        }
    }
    
    /**
     * Start the Discord bot
     */
    async start() {
        try {
            // Validate configuration
            if (!config.discord.token) {
                logger.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                logger.warn('⚠️  DISCORD_TOKEN not configured');
                logger.warn('Discord bot will NOT start');
                logger.warn('Web service will continue to run normally');
                logger.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                return false;
            }
            
            if (!config.discord.clientId) {
                logger.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                logger.warn('⚠️  DISCORD_CLIENT_ID not configured');
                logger.warn('Discord bot will NOT start');
                logger.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                return false;
            }
            
            logger.info('🤖 Starting Discord bot...');
            
            // Initialize client
            this.initializeClient();
            
            // Load commands and events
            this.loadCommands();
            this.loadEvents();
            
            // Register slash commands
            await this.registerCommands();
            
            // Login to Discord
            logger.info('🔐 Logging in to Discord...');
            await this.client.login(config.discord.token);
            
            // Wait for ready event
            await new Promise((resolve) => {
                this.client.once('ready', () => {
                    this.isReady = true;
                    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    logger.info(`✅ Discord Bot Ready!`);
                    logger.info(`📛 Logged in as: ${this.client.user.tag}`);
                    logger.info(`🆔 Client ID: ${this.client.user.id}`);
                    logger.info(`🌐 Servers: ${this.client.guilds.cache.size}`);
                    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    resolve();
                });
            });
            
            return true;
            
        } catch (error) {
            logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            logger.error('❌ Failed to start Discord bot');
            logger.error('Error:', error.message);
            
            if (error.message.includes('TOKEN_INVALID')) {
                logger.error('');
                logger.error('🔧 Your Discord token is invalid!');
                logger.error('Get a new one from: https://discord.com/developers/applications');
            } else if (error.message.includes('DISALLOWED_INTENTS')) {
                logger.error('');
                logger.error('🔧 Missing required intents!');
                logger.error('1. Go to Discord Developer Portal');
                logger.error('2. Select your bot');
                logger.error('3. Go to "Bot" tab');
                logger.error('4. Enable "Message Content Intent"');
                logger.error('5. Enable "Server Members Intent"');
            }
            
            logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            throw error;
        }
    }
}

module.exports = new DiscordBot();
