// Update the execute function with better error handling

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
        
        // Obfuscate with error handling
        try {
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
• ✅ String Encryption
• ✅ Anti-Tamper
• ✅ Variable Renaming

📥 **Your obfuscated file is attached below.**
✨ **Compatible with all Roblox executors!**
            `;
            
            await interaction.editReply({
                content: statsMessage,
                files: [outputFile],
                ephemeral: true
            });
            
            logger.info(`Successfully obfuscated ${attachment.name} in ${duration}ms`);
            
        } catch (obfError) {
            logger.error('Obfuscation error:', obfError);
            
            let errorMsg = `❌ **Obfuscation Failed**\n\n`;
            errorMsg += `Error: \`${obfError.message}\`\n\n`;
            
            if (obfError.message.includes('parse')) {
                errorMsg += `💡 **Tip:** Your code may have syntax issues. `;
                errorMsg += `The obfuscator uses advanced parsing but works best with valid Lua syntax.\n\n`;
                errorMsg += `Try:\n`;
                errorMsg += `• Check your Lua syntax\n`;
                errorMsg += `• Remove any syntax errors\n`;
                errorMsg += `• Use a lower preset (Low or Medium)`;
            } else {
                errorMsg += `💡 **Tip:** Try using a different preset or check your code syntax.`;
            }
            
            await interaction.editReply({
                content: errorMsg,
                ephemeral: true
            });
        }
        
    } catch (error) {
        logger.error('Command execution error:', error);
        await interaction.editReply({
            content: `❌ Unexpected error: ${error.message}`,
            ephemeral: true
        });
    }
}
