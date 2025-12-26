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
        
        if (!fs.existsSync(commandsPath)) {
            logger.warn('Commands directory not found');
            return;
        }
        
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
        
        if (!fs.existsSync(eventsPath)) {
            logger.warn('Events directory not found');
            return;
        }
        
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
        if (!config.discord.token || !config.discord.clientId) {
            logger.warn('Discord token or client ID not configured');
            return false;
        }
        
        const commands = [];
        const commandsPath = path.join(__dirname, 'commands');
        
        if (!fs.existsSync(commandsPath)) {
            logger.warn('Commands directory not found, skipping registration');
            return false;
        }
        
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            const command = require(`./commands/${file}`);
            commands.push(command.data.toJSON());
        }
        
        const rest = new REST({ version: '10' }).setToken(config.discord.token);
        
        try {
            logger.info('Registering slash commands...');
            
            await rest.put(
                Routes.applicationCommands(config.discord.clientId),
                { body: commands }
            );
            
            logger.info('Successfully registered slash commands');
            return true;
            
        } catch (error) {
            logger.error('Error registering commands:', error.message);
            return false;
        }
    }
    
    async start() {
        try {
            if (!config.discord.token) {
                logger.warn('⚠️  DISCORD_TOKEN not set. Skipping Discord bot.');
                return false;
            }
            
            this.loadCommands();
            this.loadEvents();
            await this.registerCommands();
            
            await this.client.login(config.discord.token);
            this.isReady = true;
            logger.info('✅ Discord bot logged in successfully');
            return true;
            
        } catch (error) {
            logger.error('❌ Failed to start Discord bot:', error.message);
            
            if (error.code === 'TOKEN_INVALID') {
                logger.error('Discord token is invalid!');
            } else if (error.code === 'DISALLOWED_INTENTS') {
                logger.error('Missing Discord intents! Enable them in Discord Developer Portal.');
            }
            
            throw error;
        }
    }
}

module.exports = new DiscordBot();
