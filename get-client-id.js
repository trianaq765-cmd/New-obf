require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', () => {
    console.log('\n✅ Bot Connected!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 Your Discord Bot Configuration:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Bot Username: ${client.user.tag}`);
    console.log(`Bot ID (Client ID): ${client.user.id}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📋 Add this to your .env file:');
    console.log(`DISCORD_CLIENT_ID=${client.user.id}`);
    console.log('\n📋 Or add to Render.com environment variables:');
    console.log(`Key: DISCORD_CLIENT_ID`);
    console.log(`Value: ${client.user.id}`);
    console.log('\n');
    
    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN).catch(err => {
    console.error('❌ Failed to login:', err.message);
    console.log('\n📝 Make sure DISCORD_TOKEN is set correctly in .env');
    process.exit(1);
});
