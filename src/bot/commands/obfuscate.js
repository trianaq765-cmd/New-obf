const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const Obfuscator = require('../../obfuscator');
const logger = require('../../utils/logger');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('obfuscate')
        .setDescription('Obfuscate a Lua script')
        .addAttachmentOption(option =>
            option.setName('file')
                .setDescription('Lua file to obfuscate')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('preset')
                .setDescription('Obfuscation preset')
                .setRequired(false)
                .addChoices(
                    { name: 'Low (Fast)', value: 'low' },
                    { name: 'Medium (Balanced)', value: 'medium' },
                    { name: 'High (Secure)', value: 'high' },
                    { name: 'Extreme (Maximum Security)', value: 'extreme' }
                ))
        .addBooleanOption(option =>
            option.setName('vm')
                .setDescription('Enable VM virtualization')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('antidebug')
                .setDescription('Enable anti-debug protection')
                .setRequired(false)),
    
    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });
            
            const attachment = interaction.options.getAttachment('file');
            const preset = interaction.options.getString('preset') || 'medium';
            const enableVM = interaction.options.getBoolean('vm') ?? true;
            const enableAntiDebug = interaction.options.getBoolean('antidebug') ?? true;
            
            // Validate file
            if (!attachment.name.endsWith('.lua') && !attachment.name.endsWith('.txt')) {
                return await interaction.editReply({
                    content: '❌ Invalid file type. Please upload a .lua or .txt file.',
                    ephemeral: true
                });
            }
            
            if (attachment.size > 5 * 1024 * 1024) {
                return await interaction.editReply({
                    content: '❌ File too large. Maximum size is 5MB.',
                    ephemeral: true
                });
            }
            
            // Download file
            logger.info(`Obfuscating file: ${attachment.name} for user ${interaction.user.tag}`);
            const response = await axios.get(attachment.url);
            const sourceCode = response.data;
            
            // Obfuscate
            const obfuscator = new Obfuscator({
                preset: preset,
                vm: enableVM,
                antiDebug: enableAntiDebug,
            });
            
            const startTime = Date.now();
            const obfuscated = await obfuscator.obfuscate(sourceCode);
            const duration = Date.now() - startTime;
            
            // Create output file
            const outputBuffer = Buffer.from(obfuscated, 'utf-8');
            const outputFile = new AttachmentBuilder(outputBuffer, {
                name: `obfuscated_${attachment.name}`
            });
            
            // Statistics
            const stats = {
                originalSize: sourceCode.length,
                obfuscatedSize: obfuscated.length,
                ratio: ((obfuscated.length / sourceCode.length) * 100).toFixed(2),
                duration: duration,
                preset: preset,
                features: {
                    vm: enableVM,
                    antiDebug: enableAntiDebug,
                }
            };
            
            const statsMessage = `
✅ **Obfuscation Complete!**

📊 **Statistics:**
• Original Size: \`${stats.originalSize}\` bytes
• Obfuscated Size: \`${stats.obfuscatedSize}\` bytes
• Size Ratio: \`${stats.ratio}%\`
• Time Taken: \`${stats.duration}ms\`
• Preset: \`${preset.toUpperCase()}\`

🔐 **Features Applied:**
${enableVM ? '• ✅ VM Virtualization' : '• ❌ VM Virtualization'}
${enableAntiDebug ? '• ✅ Anti-Debug Protection' : '• ❌ Anti-Debug Protection'}
• ✅ AES-256 Encryption
• ✅ Anti-Tamper
• ✅ String Encryption
• ✅ Control Flow Obfuscation
• ✅ Variable Renaming

📥 **Your obfuscated file is attached below.**
            `;
            
            await interaction.editReply({
                content: statsMessage,
                files: [outputFile],
                ephemeral: true
            });
            
            logger.info(`Successfully obfuscated ${attachment.name} in ${duration}ms`);
            
        } catch (error) {
            logger.error('Error during obfuscation:', error);
            await interaction.editReply({
                content: `❌ Error during obfuscation: ${error.message}`,
                ephemeral: true
            });
        }
    }
};
