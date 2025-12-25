const crypto = require('crypto');

class StringEncryption {
    constructor() {
        this.stringPool = [];
        this.decryptorName = this.randomVar();
    }
    
    transform(ast) {
        this.stringPool = [];
        this.walkAST(ast);
        return this.wrapWithDecryptor(ast);
    }
    
    walkAST(node) {
        if (!node) return;
        
        if (node.type === 'StringLiteral') {
            const encrypted = this.encryptString(node.value);
            this.stringPool.push(encrypted);
            node.encrypted = true;
            node.poolIndex = this.stringPool.length - 1;
        }
        
        for (let key in node) {
            if (node[key] && typeof node[key] === 'object') {
                if (Array.isArray(node[key])) {
                    node[key].forEach(child => this.walkAST(child));
                } else {
                    this.walkAST(node[key]);
                }
            }
        }
    }
    
    encryptString(str) {
        const key = Math.floor(Math.random() * 255) + 1;
        const encrypted = [];
        for (let i = 0; i < str.length; i++) {
            encrypted.push(str.charCodeAt(i) ^ key);
        }
        return { data: encrypted, key: key };
    }
    
    wrapWithDecryptor(ast) {
        const poolData = this.stringPool.map(s => 
            `{${s.data.join(',')},${s.key}}`
        ).join(',');
        
        ast.decryptor = `
local ${this.decryptorName} = (function()
    local pool = {${poolData}}
    return function(idx)
        local entry = pool[idx + 1]
        local result = {}
        for i = 1, #entry - 1 do
            result[i] = string.char(bit32.bxor(entry[i], entry[#entry]))
        end
        return table.concat(result)
    end
end)()
        `;
        
        return ast;
    }
    
    randomVar() {
        return '__STR_' + Math.random().toString(36).substring(2, 10).toUpperCase();
    }
}

module.exports = StringEncryption;
