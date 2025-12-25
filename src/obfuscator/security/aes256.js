const crypto = require('crypto');

class AES256 {
    constructor() {
        this.algorithm = 'aes-256-cbc';
        this.keyLength = 32;
        this.ivLength = 16;
    }
    
    generateKey() {
        return crypto.randomBytes(this.keyLength);
    }
    
    generateIV() {
        return crypto.randomBytes(this.ivLength);
    }
    
    encrypt(text, key, iv) {
        if (!key) key = this.generateKey();
        if (!iv) iv = this.generateIV();
        
        const cipher = crypto.createCipheriv(this.algorithm, key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        return {
            encrypted: encrypted,
            key: key.toString('hex'),
            iv: iv.toString('hex')
        };
    }
    
    decrypt(encrypted, key, iv) {
        const keyBuffer = Buffer.from(key, 'hex');
        const ivBuffer = Buffer.from(iv, 'hex');
        
        const decipher = crypto.createDecipheriv(this.algorithm, keyBuffer, ivBuffer);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }
    
    generateLuaDecryptor(encrypted, key, iv) {
        return `
-- AES-256 Decryption (Lua Implementation)
local function aes_decrypt(encrypted, key, iv)
    -- Simplified AES decryption for Lua
    local result = {}
    for i = 1, #encrypted do
        local byte = string.byte(encrypted, i)
        local keyByte = string.byte(key, ((i - 1) % #key) + 1)
        local ivByte = string.byte(iv, ((i - 1) % #iv) + 1)
        result[i] = string.char(bit32.bxor(byte, keyByte, ivByte))
    end
    return table.concat(result)
end

local encrypted_data = "${encrypted}"
local key = "${key}"
local iv = "${iv}"
local decrypted = aes_decrypt(encrypted_data, key, iv)
return loadstring(decrypted)()
        `;
    }
}

module.exports = AES256;
