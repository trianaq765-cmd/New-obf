const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const logger = require('../utils/logger');

class DiscordBot {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.DirectMessages,
            ]
        });
        
        this.client.commands = new Collection();
        this.isReady = false;
    }
    
    loadCommands() {
        const commandsPath = path.join(__dirname, 'commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            this.client.commands.set(command.data.name, command);
            logger.info(`Loaded command: ${command.data.name}`);
        }
    }
    
    loadEvents() {
        const eventsPath = path.join(__dirname, 'events');
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
        
        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            const event = require(filePath);
            
            if (event.once) {
                this.client.once(event.name, (...args) => event.execute(...args));
            } else {
                this.client.on(event.name, (...args) => event.execute(...args));
            }
            
            logger.info(`Loaded event: ${event.name}`);
        }
    }
    
    async registerCommands() {
        // Validate configuration first
        if (!config.discord.token) {
            logger.warn('Discord token not configured. Skipping command registration.');
            return false;
        }
        
        if (!config.discord.clientId) {
            logger.warn('Discord client ID not configured. Skipping command registration.');
            return false;
        }
        
        const commands = [];
        const commandFiles = fs.readdirSync(path.join(__dirname, 'commands'))
            .filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            const command = require(`./commands/${file}`);
            commands.push(command.data.toJSON());
        }
        
        const rest = new REST({ version: '10' }).setToken(config.discord.token);
        
        try {
            logger.info('Registering slash commands...');
            logger.info(`Using Client ID: ${config.discord.clientId}`);
            
            // Get application info to verify
            const app = await rest.get(Routes.oauth2CurrentApplication());
            logger.info(`Bot application: ${app.name} (${app.id})`);
            
            // Register commands
            await rest.put(
                Routes.applicationCommands(config.discord.clientId),
                { body: commands }
            );
            
            logger.info('Successfully registered slash commands');
            return true;
            
        } catch (error) {
            logger.error('Error registering commands:', error.message);
            
            if (error.code === 10002) {
                logger.error('❌ DISCORD_CLIENT_ID is invalid or does not match your bot token!');
                logger.error('📝 How to fix:');
                logger.error('1. Go to https://discord.com/developers/applications');
                logger.error('2. Select your bot application');
                logger.error('3. Copy the "Application ID" from General Information');
                logger.error('4. Set it as DISCORD_CLIENT_ID in your environment variables');
                logger.error(`5. Your bot token starts with: ${config.discord.token.substring(0, 20)}...`);
            }
            
            return false;
        }
    }
    
    async start() {
        try {
            // Check if Discord is configured
            if (!config.discord.token) {
                logger.warn('⚠️  Discord bot token not configured. Discord bot will not start.');
                logger.warn('The web service will continue to run without Discord integration.');
                return false;
            }
            
            this.loadCommands();
            this.loadEvents();
            
            // Try to register commands (but don't fail if it errors)
            await this.registerCommands();
            
            // Login to Discord
            await this.client.login(config.discord.token);
            this.isReady = true;
            logger.info('✅ Discord bot logged in successfully');
            return true;
            
        } catch (error) {
            logger.error('❌ Failed to start Discord bot:', error.message);
            
            if (error.message.includes('TOKEN_INVALID')) {
                logger.error('Your Discord bot token is invalid!');
                logger.error('Get a valid token from: https://discord.com/developers/applications');
            }
            
            logger.warn('⚠️  Continuing without Discord bot...');
            return false;
        }
    }
}

module.exports = new DiscordBot();
