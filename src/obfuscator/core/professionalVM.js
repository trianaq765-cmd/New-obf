class ProfessionalVM {
    constructor() {
        this.minifyLevel = 'extreme';
    }
    
    /**
     * Generate professional obfuscated output (Luraph-style)
     * Clean, compact, no ugly comments
     */
    wrap(code, options) {
        // Pre-process: extract and encrypt resources
        const processed = this.preprocessCode(code);
        
        // Generate VM runtime (compact and professional)
        const vm = this.generateVM(processed, options);
        
        // Post-process: extreme minification
        return this.postProcess(vm);
    }
    
    preprocessCode(code) {
        // Extract strings
        const strings = [];
        const stringMap = new Map();
        let stringId = 0;
        
        const codeWithStringPlaceholders = code.replace(/(['"`])(?:(?=(\\?))\2.)*?\1/g, (match) => {
            const content = match.slice(1, -1);
            if (content.length > 2) {
                if (!stringMap.has(content)) {
                    strings.push(content);
                    stringMap.set(content, stringId++);
                }
                return `__STR_${stringMap.get(content)}__`;
            }
            return match;
        });
        
        // Extract numbers
        const numbers = [];
        const numberMap = new Map();
        let numberId = 0;
        
        const codeWithNumPlaceholders = codeWithStringPlaceholders.replace(/\b(\d+\.?\d*)\b/g, (match) => {
            const num = parseFloat(match);
            if (num > 99 || num < -99) {
                if (!numberMap.has(num)) {
                    numbers.push(num);
                    numberMap.set(num, numberId++);
                }
                return `__NUM_${numberMap.get(num)}__`;
            }
            return match;
        });
        
        return {
            code: codeWithNumPlaceholders,
            strings,
            numbers
        };
    }
    
    generateVM(processed, options) {
        const { code, strings, numbers } = processed;
        
        // Encrypt the main code
        const encrypted = this.encrypt(code);
        
        // Generate variable names (short and obfuscated)
        const v = this.generateVars(30);
        
        // Build VM (ultra compact, single line where possible)
        let vm = `(function()`;
        
        // String pool
        if (strings.length > 0) {
            vm += `local ${v[0]}={`;
            vm += strings.map(s => this.encryptString(s)).join(',');
            vm += `};`;
        }
        
        // Number pool
        if (numbers.length > 0) {
            vm += `local ${v[1]}={`;
            vm += numbers.map(n => this.obfuscateNumber(n)).join(',');
            vm += `};`;
        }
        
        // Decryption function (compact)
        vm += `local function ${v[2]}(${v[3]},${v[4]})`;
        vm += `local ${v[5]}={};`;
        vm += `for ${v[6]}=1,#${v[3]} do `;
        vm += `${v[5]}[${v[6]}]=string.char(bit32.bxor(${v[3]}[${v[6]}],${v[4]}[(${v[6]}-1)%#${v[4]}+1]));`;
        vm += `end;`;
        vm += `return table.concat(${v[5]})`;
        vm += `end;`;
        
        // Encrypted data
        vm += `local ${v[7]}={${encrypted.data.join(',')}};`;
        vm += `local ${v[8]}={${encrypted.key.join(',')}};`;
        
        // Decrypt and restore
        vm += `local ${v[9]}=${v[2]}(${v[7]},${v[8]});`;
        
        // String restoration
        if (strings.length > 0) {
            vm += `${v[9]}=${v[9]}:gsub("__STR_(%d+)__",function(${v[10]})`;
            vm += `local ${v[11]}=${v[0]}[tonumber(${v[10]})+1];`;
            vm += `local ${v[12]}={};`;
            vm += `for ${v[13]}=1,#${v[11]} do `;
            vm += `${v[12]}[${v[13]}]=string.char(bit32.bxor(${v[11]}[${v[13]}],${v[11]}[#${v[11]}]));`;
            vm += `end;`;
            vm += `return table.concat(${v[12]})`;
            vm += `end);`;
        }
        
        // Number restoration
        if (numbers.length > 0) {
            vm += `${v[9]}=${v[9]}:gsub("__NUM_(%d+)__",function(${v[14]})return tostring(${v[1]}[tonumber(${v[14]})+1])end);`;
        }
        
        // Execute
        vm += `return(loadstring or load)(${v[9]})`;
        vm += `end)()()`;
        
        return vm;
    }
    
    encrypt(code) {
        const key = this.generateKey(16);
        const data = [];
        
        for (let i = 0; i < code.length; i++) {
            data.push(code.charCodeAt(i) ^ key[i % key.length] ^ ((i * 7) % 256));
        }
        
        return { data, key };
    }
    
    encryptString(str) {
        const key = Math.floor(Math.random() * 200) + 50;
        const encrypted = [];
        
        for (let i = 0; i < str.length; i++) {
            encrypted.push(str.charCodeAt(i) ^ key);
        }
        encrypted.push(key); // Key at end
        
        return `{${encrypted.join(',')}}`;
    }
    
    obfuscateNumber(num) {
        const methods = [
            () => num,
            () => `(${num + 1000}-1000)`,
            () => `(${num * 2}/2)`,
            () => `bit32.bxor(${num},0)`,
        ];
        
        return methods[Math.floor(Math.random() * methods.length)]();
    }
    
    postProcess(code) {
        // Extreme minification
        return code
            // Remove all comments
            .replace(/--\[\[[\s\S]*?\]\]/g, '')
            .replace(/--[^\n]*/g, '')
            // Remove all unnecessary whitespace
            .replace(/\s+/g, ' ')
            // Remove spaces around operators
            .replace(/\s*([=+\-*/%^#<>~(){}[\],;:.])\s*/g, '$1')
            // Remove newlines
            .replace(/\n+/g, '')
            // Final trim
            .trim();
    }
    
    generateVars(count) {
        const vars = [];
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        for (let i = 0; i < count; i++) {
            let name = '_';
            for (let j = 0; j < 4; j++) {
                name += chars[Math.floor(Math.random() * chars.length)];
            }
            vars.push(name);
        }
        
        return vars;
    }
    
    generateKey(length) {
        const key = [];
        for (let i = 0; i < length; i++) {
            key.push(Math.floor(Math.random() * 256));
        }
        return key;
    }
}

module.exports = ProfessionalVM;
