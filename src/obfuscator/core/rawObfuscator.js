const crypto = require('crypto');

class RawObfuscator {
    constructor() {
        this.stringPool = [];
        this.variableMap = new Map();
    }
    
    encryptStrings(code) {
        const stringPattern = /(['"])(?:(?=(\\?))\2.)*?\1/g;
        const strings = [];
        
        // Extract all strings
        let match;
        while ((match = stringPattern.exec(code)) !== null) {
            strings.push({
                original: match[0],
                content: match[0].slice(1, -1),
                index: match.index
            });
        }
        
        if (strings.length === 0) return code;
        
        // Generate decryptor
        const decryptorName = this.randomVar('STR');
        let decryptor = `\nlocal ${decryptorName}=(function()`;
        decryptor += `local ${this.randomVar('a')}=string.char;`;
        decryptor += `local ${this.randomVar('b')}=table.concat;`;
        decryptor += `local ${this.randomVar('c')}={`;
        
        const encryptedStrings = [];
        const replacements = [];
        
        // Encrypt each string
        strings.forEach((str, idx) => {
            const encrypted = this.xorEncrypt(str.content);
            encryptedStrings.push(`{${encrypted.data.join(',')},${encrypted.key}}`);
            replacements.push({
                original: str.original,
                replacement: `${decryptorName}(${idx})`
            });
        });
        
        decryptor += encryptedStrings.join(',');
        decryptor += `};`;
        decryptor += `return function(${this.randomVar('i')})`;
        decryptor += `local ${this.randomVar('e')}=${this.randomVar('c')}[${this.randomVar('i')}+1];`;
        decryptor += `local ${this.randomVar('r')}={};`;
        decryptor += `for ${this.randomVar('j')}=1,#${this.randomVar('e')}-1 do `;
        decryptor += `${this.randomVar('r')}[${this.randomVar('j')}]=`;
        decryptor += `${this.randomVar('a')}(bit32.bxor(${this.randomVar('e')}[${this.randomVar('j')}],${this.randomVar('e')}[#${this.randomVar('e')}]))`;
        decryptor += ` end;`;
        decryptor += `return ${this.randomVar('b')}(${this.randomVar('r')})`;
        decryptor += ` end end)();\n`;
        
        // Replace strings in reverse order to maintain indices
        let result = code;
        for (let i = replacements.length - 1; i >= 0; i--) {
            result = result.replace(replacements[i].original, replacements[i].replacement);
        }
        
        return decryptor + result;
    }
    
    renameVariables(code) {
        // Find local variable declarations
        const localPattern = /\blocal\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
        const variables = new Set();
        
        let match;
        while ((match = localPattern.exec(code)) !== null) {
            const varName = match[1];
            // Don't rename Lua keywords or common globals
            if (!this.isReserved(varName)) {
                variables.add(varName);
            }
        }
        
        // Generate replacements
        let result = code;
        variables.forEach(varName => {
            const newName = this.randomVar('V');
            this.variableMap.set(varName, newName);
            
            // Replace with word boundaries
            const regex = new RegExp(`\\b${varName}\\b`, 'g');
            result = result.replace(regex, newName);
        });
        
        return result;
    }
    
    addJunkCode(code, density) {
        const lines = code.split('\n');
        const junkLines = [];
        
        for (let i = 0; i < density; i++) {
            junkLines.push(this.generateJunkLine());
        }
        
        // Insert junk at beginning
        return junkLines.join('\n') + '\n' + code;
    }
    
    generateJunkLine() {
        const patterns = [
            () => `local ${this.randomVar('J')}=${Math.random() * 1000};`,
            () => `local ${this.randomVar('J')}="${this.randomString(10)}";`,
            () => {
                const v1 = this.randomVar('J');
                const v2 = this.randomVar('J');
                return `local ${v1},${v2}=${Math.random()},${Math.random()};`;
            },
            () => `if ${Math.random() > 0.5} then end;`,
        ];
        
        return patterns[Math.floor(Math.random() * patterns.length)]();
    }
    
    xorEncrypt(str) {
        const key = Math.floor(Math.random() * 255) + 1;
        const data = [];
        for (let i = 0; i < str.length; i++) {
            data.push(str.charCodeAt(i) ^ key);
        }
        return { data, key };
    }
    
    randomVar(prefix = 'V') {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let name = '_' + prefix + '_';
        for (let i = 0; i < 8; i++) {
            name += chars[Math.floor(Math.random() * chars.length)];
        }
        return name;
    }
    
    randomString(length) {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
    }
    
    isReserved(name) {
        const reserved = [
            'and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for',
            'function', 'if', 'in', 'local', 'nil', 'not', 'or', 'repeat',
            'return', 'then', 'true', 'until', 'while',
            // Common globals
            'print', 'table', 'string', 'math', 'game', 'workspace', 'script',
            '_G', 'shared', 'getfenv', 'setfenv', 'loadstring', 'require',
            'pairs', 'ipairs', 'next', 'pcall', 'xpcall', 'type', 'tostring',
            'tonumber', 'select', 'unpack', 'error', 'assert'
        ];
        
        return reserved.includes(name);
    }
}

module.exports = RawObfuscator;
