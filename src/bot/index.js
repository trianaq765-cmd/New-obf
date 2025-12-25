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
        this.loadCommands();
        this.loadEvents();
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
            
            await rest.put(
                Routes.applicationCommands(config.discord.clientId),
                { body: commands }
            );
            
            logger.info('Successfully registered slash commands');
        } catch (error) {
            logger.error('Error registering commands:', error);
        }
    }
    
    async start() {
        try {
            await this.registerCommands();
            await this.client.login(config.discord.token);
            logger.info('Discord bot logged in successfully');
        } catch (error) {
            logger.error('Failed to start Discord bot:', error);
            throw error;
        }
    }
}

module.exports = new DiscordBot();
