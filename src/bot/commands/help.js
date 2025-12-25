const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show help information'),
    
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🔐 Lua Obfuscator Bot - Help')
            .setDescription('Advanced Lua obfuscation with VM protection')
            .addFields(
                {
                    name: '📝 Commands',
                    value: '`/obfuscate` - Obfuscate a Lua file\n`/help` - Show this help message'
                },
                {
                    name: '⚙️ Presets',
                    value: '**Low** - Fast, basic protection\n**Medium** - Balanced (recommended)\n**High** - Strong protection\n**Extreme** - Maximum security'
                },
                {
                    name: '🛡️ Features',
                    value: '• Custom VM virtualization\n• AES-256 encryption\n• Anti-debug protection\n• Anti-tamper\n• Anti-dump\n• String encryption\n• Control flow obfuscation\n• Variable renaming\n• Dead code injection'
                },
                {
                    name: '📊 Usage',
                    value: '1. Use `/obfuscate` command\n2. Upload your .lua file\n3. Select preset (optional)\n4. Wait for processing\n5. Download obfuscated file'
                },
                {
                    name: '✅ Compatible With',
                    value: '• Roblox executors\n• Standard Lua 5.1/5.2\n• LuaJIT\n• FiveM\n• Garry\'s Mod'
                },
                {
                    name: '⚠️ Limits',
                    value: 'Max file size: 5MB\nMax requests: 10/min'
                }
            )
            .setFooter({ text: 'Advanced Lua Obfuscator v2.0' })
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
