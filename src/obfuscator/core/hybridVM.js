const crypto = require('crypto');

class HybridVM {
    constructor() {
        this.vmPercentage = 20; // Only virtualize 20% of code
    }
    
    /**
     * Hybrid obfuscation: 20% VM, 80% plain Lua with protection
     */
    hybridWrap(code, options) {
        const chunks = this.splitIntoChunks(code);
        const totalChunks = chunks.length;
        const vmChunkCount = Math.max(1, Math.floor(totalChunks * (this.vmPercentage / 100)));
        
        // Randomly select chunks to virtualize
        const vmIndices = this.selectRandomIndices(totalChunks, vmChunkCount);
        
        const processedChunks = chunks.map((chunk, index) => {
            if (vmIndices.includes(index)) {
                // Virtualize this chunk
                return {
                    type: 'vm',
                    code: this.wrapInVM(chunk.code, options),
                    id: this.randomName()
                };
            } else {
                // Keep as plain Lua with light obfuscation
                return {
                    type: 'plain',
                    code: this.lightObfuscate(chunk.code),
                    id: null
                };
            }
        });
        
        return this.combineChunks(processedChunks, options);
    }
    
    /**
     * Split code into logical chunks (functions, blocks, statements)
     */
    splitIntoChunks(code) {
        const chunks = [];
        const lines = code.split('\n');
        
        let currentChunk = [];
        let inFunction = false;
        let braceCount = 0;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            currentChunk.push(lines[i]);
            
            // Track function blocks
            if (line.match(/\bfunction\b/)) {
                inFunction = true;
            }
            
            if (line.includes('do') || line.includes('then')) {
                braceCount++;
            }
            
            if (line.includes('end')) {
                braceCount--;
                
                if (braceCount <= 0 && inFunction) {
                    // End of function, create chunk
                    chunks.push({
                        code: currentChunk.join('\n'),
                        type: 'function'
                    });
                    currentChunk = [];
                    inFunction = false;
                    braceCount = 0;
                }
            }
            
            // Create chunks every 10-15 lines if not in function
            if (!inFunction && currentChunk.length >= 10 + Math.random() * 5) {
                chunks.push({
                    code: currentChunk.join('\n'),
                    type: 'block'
                });
                currentChunk = [];
            }
        }
        
        // Add remaining code
        if (currentChunk.length > 0) {
            chunks.push({
                code: currentChunk.join('\n'),
                type: 'block'
            });
        }
        
        return chunks;
    }
    
    /**
     * Select random indices for VM wrapping
     */
    selectRandomIndices(total, count) {
        const indices = [];
        while (indices.length < count) {
            const rand = Math.floor(Math.random() * total);
            if (!indices.includes(rand)) {
                indices.push(rand);
            }
        }
        return indices.sort((a, b) => a - b);
    }
    
    /**
     * Wrap chunk in VM (lightweight)
     */
    wrapInVM(code, options) {
        const funcName = this.randomName();
        const dataName = this.randomName();
        const keyName = this.randomName();
        
        const key = this.generateKey(16); // Shorter key for performance
        const encrypted = this.encryptCode(code, key);
        
        return `
local ${funcName} = (function()
    local ${this.randomName()} = string.char
    local ${this.randomName()} = loadstring or load
    local ${this.randomName()} = bit32 or bit
    
    local function ${this.randomName()}(d, k)
        local r = {}
        for i = 1, #d do
            r[i] = ${this.randomName()}(${this.randomName()}.bxor(d[i], k[(i - 1) % #k + 1]))
        end
        return table.concat(r)
    end
    
    local ${dataName} = {${encrypted.data.join(',')}}
    local ${keyName} = {${encrypted.key.join(',')}}
    
    return ${this.randomName()}(${this.randomName()}(${dataName}, ${keyName}))
end)()

${funcName}`;
    }
    
    /**
     * Light obfuscation for non-VM chunks (fast)
     */
    lightObfuscate(code) {
        // Just rename variables and add minimal junk
        let obfuscated = code;
        
        // Simple string encryption
        obfuscated = this.encryptStringsSimple(obfuscated);
        
        // Add one junk line
        const junk = `local ${this.randomName()}=${Math.random()};`;
        
        return junk + '\n' + obfuscated;
    }
    
    /**
     * Simple string encryption without full parsing
     */
    encryptStringsSimple(code) {
        const stringPattern = /(['"])(?:(?=(\\?))\2.)*?\1/g;
        const strings = [];
        
        let match;
        while ((match = stringPattern.exec(code)) !== null) {
            if (match[0].length > 3) { // Only encrypt longer strings
                strings.push({
                    original: match[0],
                    index: match.index
                });
            }
        }
        
        // Encrypt strings
        let result = code;
        for (let i = strings.length - 1; i >= 0; i--) {
            const str = strings[i];
            const content = str.original.slice(1, -1);
            const encrypted = this.xorString(content);
            const replacement = `(function()local t={${encrypted.join(',')}};local r='';for i=1,#t do r=r..string.char(t[i])end;return r end)()`;
            result = result.substring(0, str.index) + replacement + result.substring(str.index + str.original.length);
        }
        
        return result;
    }
    
    /**
     * Combine all chunks back together
     */
    combineChunks(chunks, options) {
        const parts = [];
        
        // Header
        parts.push(`-- Hybrid Obfuscated (${this.vmPercentage}% VM, ${100 - this.vmPercentage}% Optimized Lua)`);
        parts.push(`-- Roblox Compatible | Loadstring Ready\n`);
        
        // Anti-debug (light version)
        if (options.antiDebug) {
            parts.push(this.lightAntiDebug());
        }
        
        // Combine chunks
        chunks.forEach((chunk, index) => {
            if (chunk.type === 'vm') {
                parts.push(`-- VM Protected Block ${index + 1}`);
                parts.push(chunk.code);
            } else {
                parts.push(chunk.code);
            }
        });
        
        return parts.join('\n');
    }
    
    /**
     * Lightweight anti-debug (doesn't slow down execution)
     */
    lightAntiDebug() {
        const v1 = this.randomName();
        const v2 = this.randomName();
        
        return `
-- Anti-Debug (Lightweight)
local ${v1} = debug
if ${v1} then
    ${v1}.getinfo = nil
    ${v1}.debug = nil
end
local ${v2} = getfenv or function() return _ENV end
if ${v2}().KRNL_LOADED or ${v2}().syn then
    -- Executor detected, proceed
end
`;
    }
    
    /**
     * Encrypt code
     */
    encryptCode(code, key) {
        const data = [];
        for (let i = 0; i < code.length; i++) {
            const byte = code.charCodeAt(i);
            const keyByte = key[i % key.length];
            data.push(byte ^ keyByte);
        }
        return { data, key };
    }
    
    /**
     * XOR encrypt string
     */
    xorString(str) {
        const key = Math.floor(Math.random() * 200) + 50;
        const result = [];
        for (let i = 0; i < str.length; i++) {
            result.push(str.charCodeAt(i) ^ key);
        }
        result.push(key); // Store key at end
        return result;
    }
    
    /**
     * Generate encryption key
     */
    generateKey(length) {
        const key = [];
        for (let i = 0; i < length; i++) {
            key.push(Math.floor(Math.random() * 256));
        }
        return key;
    }
    
    /**
     * Random variable name
     */
    randomName() {
        const prefixes = ['_', '__', 'l', 'll', 'I'];
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let name = prefixes[Math.floor(Math.random() * prefixes.length)];
        for (let i = 0; i < 6; i++) {
            name += chars[Math.floor(Math.random() * chars.length)];
        }
        return name;
    }
}

module.exports = HybridVM;
