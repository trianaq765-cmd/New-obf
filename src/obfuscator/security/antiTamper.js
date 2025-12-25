const crypto = require('crypto');

class AntiTamper {
    protect(code) {
        const checksum = this.calculateChecksum(code);
        const verificationCode = this.generateVerificationCode(checksum);
        
        return verificationCode + '\n' + code;
    }
    
    calculateChecksum(code) {
        return crypto.createHash('sha256').update(code).digest('hex');
    }
    
    generateVerificationCode(checksum) {
        const varName1 = this.randomVar();
        const varName2 = this.randomVar();
        const varName3 = this.randomVar();
        
        return `
-- Anti-Tamper Protection
local ${varName1} = "${checksum}"
local ${varName2} = (function()
    local ${varName3} = 0
    local script_source = debug and debug.getinfo and debug.getinfo(1, "S").source or ""
    if script_source ~= "" then
        for i = 1, #script_source do
            ${varName3} = (${varName3} + string.byte(script_source, i)) % 0xFFFFFFFF
        end
    end
    return ${varName3}
end)()
if tostring(${varName2}) ~= "${checksum.substring(0, 8)}" then
    error("\\83\\99\\114\\105\\112\\116\\32\\116\\97\\109\\112\\101\\114\\101\\100")
end
        `;
    }
    
    randomVar() {
        const chars = 'abcdefghijklmnopqrstuvwxyz';
        const prefixes = ['_', '__', '___'];
        let name = prefixes[Math.floor(Math.random() * prefixes.length)];
        for (let i = 0; i < 12; i++) {
            name += chars[Math.floor(Math.random() * chars.length)];
        }
        return name;
    }
}

module.exports = AntiTamper;
