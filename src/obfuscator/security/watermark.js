class Watermark {
    embed(code, metadata) {
        const watermark = this.generateWatermark(metadata);
        return watermark + '\n' + code;
    }
    
    generateWatermark(metadata) {
        const encoded = Buffer.from(JSON.stringify(metadata)).toString('base64');
        const v1 = this.randomVar();
        
        return `
-- Obfuscated by Advanced Lua Obfuscator v2.0
-- Watermark: ${v1}
local ${v1} = "${encoded}"
-- Timestamp: ${metadata.timestamp}
-- DO NOT REDISTRIBUTE
        `;
    }
    
    randomVar() {
        return '_WM_' + Math.random().toString(36).substring(2, 10).toUpperCase();
    }
}

module.exports = Watermark;
