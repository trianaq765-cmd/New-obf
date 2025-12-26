const crypto = require('crypto');

class RawObfuscator {
    constructor() {
        this.stringPool = [];
        this.variableMap = new Map();
    }
    
    encryptStrings(code) {
        const stringPattern = /(['"])(?:(?=(\\?))\2.)*?\1/g;
        const strings = [];
        
        let match;
        while ((match = stringPattern.exec(code)) !== null) {
            strings.push({
                original: match[0],
                content: match[0].slice(1, -1),
                index: match.index
            });
        }
        
        if (strings.length === 0) return code;
        
        const decryptorName = this.randomVar('STR');
        let decryptor = `local ${decryptorName}=(function()`;
        decryptor += `local ${this.randomVar('c')}=string.char;`;
        decryptor += `local ${this.randomVar('b')}=bit32 or bit;`;
        decryptor += `local ${this.randomVar('p')}={`;
        
        const encryptedStrings = [];
        const replacements = [];
        
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
        decryptor += `local ${this.randomVar('e')}=${this.randomVar('p')}[${this.randomVar('i')}+1];`;
        decryptor += `local ${this.randomVar('r')}={};`;
        decryptor += `for ${this.randomVar('j')}=1,#${this.randomVar('e')}-1 do `;
        decryptor += `${this.randomVar('r')}[${this.randomVar('j')}]=`;
        decryptor += `${this.randomVar('c')}(${this.randomVar('b')}.bxor(${this.randomVar('e')}[${this.randomVar('j')}],${this.randomVar('e')}[#${this.randomVar('e')}]))`;
        decryptor += ` end;`;
        decryptor += `return table.concat(${this.randomVar('r')})`;
        decryptor += ` end end)();`;
        
        let result = code;
        for (let i = replacements.length - 1; i >= 0; i--) {
            result = result.replace(replacements[i].original, replacements[i].replacement);
        }
        
        return decryptor + result;
    }
    
    renameVariables(code) {
        const localPattern = /\blocal\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
        const variables = new Set();
        
        let match;
        while ((match = localPattern.exec(code)) !== null) {
            const varName = match[1];
            if (!this.isReserved(varName)) {
                variables.add(varName);
            }
        }
        
        let result = code;
        variables.forEach(varName => {
            const newName = this.randomVar('V');
            this.variableMap.set(varName, newName);
            const regex = new RegExp(`\\b${varName}\\b`, 'g');
            result = result.replace(regex, newName);
        });
        
        return result;
    }
    
    encryptConstants(code) {
        return code.replace(/\b(\d+\.?\d*)\b/g, (match) => {
            const num = parseFloat(match);
            if (Math.abs(num) > 100) {
                const methods = [
                    `(${num + 1000}-1000)`,
                    `(${num * 2}/2)`,
                    `bit32.bxor(${num},0)`,
                    `(function()return ${num} end)()`,
                ];
                return methods[Math.floor(Math.random() * methods.length)];
            }
            return match;
        });
    }
    
    addJunkCode(code, density) {
        const junkLines = [];
        for (let i = 0; i < density; i++) {
            junkLines.push(this.generateJunkLine());
        }
        return junkLines.join('') + code;
    }
    
    addDeadCode(code) {
        const deadFuncs = [];
        for (let i = 0; i < 3; i++) {
            deadFuncs.push(this.generateDeadFunction());
        }
        return deadFuncs.join('') + code;
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
        ];
        return patterns[Math.floor(Math.random() * patterns.length)]();
    }
    
    generateDeadFunction() {
        const fn = this.randomVar('DF');
        const p = this.randomVar('p');
        return `local function ${fn}(${p})return ${p}*2 end;`;
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
        for (let i = 0; i < 6; i++) {
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
            'print', 'table', 'string', 'math', 'game', 'workspace', 'script',
            '_G', 'shared', 'getfenv', 'setfenv', 'loadstring', 'require',
            'pairs', 'ipairs', 'next', 'pcall', 'xpcall', 'type', 'tostring',
            'tonumber', 'select', 'unpack', 'error', 'assert'
        ];
        return reserved.includes(name);
    }
}

module.exports = RawObfuscator;
