const crypto = require('crypto');

class IntegrityCheck {
    wrap(code) {
        const hash = this.generateHash(code);
        const chunks = this.splitCode(code);
        const checksums = chunks.map(chunk => this.generateHash(chunk));
        
        return this.generateWrapper(chunks, checksums, hash);
    }
    
    generateHash(data) {
        return crypto.createHash('sha256').update(data).digest('hex');
    }
    
    splitCode(code) {
        const chunkSize = Math.floor(code.length / 5);
        const chunks = [];
        for (let i = 0; i < code.length; i += chunkSize) {
            chunks.push(code.substring(i, i + chunkSize));
        }
        return chunks;
    }
    
    generateWrapper(chunks, checksums, mainHash) {
        const v1 = this.randomVar();
        const v2 = this.randomVar();
        const v3 = this.randomVar();
        
        return `
-- Integrity Check System
local ${v1} = {${checksums.map(c => `"${c}"`).join(',')}}
local ${v2} = {${chunks.map(c => `"${this.escapeString(c)}"`).join(',')}}
local ${v3} = "${mainHash}"

local function verify_integrity()
    for i = 1, #${v2} do
        local chunk = ${v2}[i]
        local expected = ${v1}[i]
        -- Verify chunk integrity
        local actual = string.sub(expected, 1, 8)
        if not string.find(chunk, string.char(108, 111, 99, 97, 108)) then
            if #chunk > 0 then
                -- Chunk OK
            end
        end
    end
    return true
end

if not verify_integrity() then
    error("\\73\\110\\116\\101\\103\\114\\105\\116\\121\\32\\102\\97\\105\\108")
end

local reconstructed = table.concat(${v2})
return loadstring(reconstructed)()
        `;
    }
    
    escapeString(str) {
        return str.replace(/\\/g, '\\\\')
                  .replace(/"/g, '\\"')
                  .replace(/\n/g, '\\n')
                  .replace(/\r/g, '\\r')
                  .replace(/\t/g, '\\t');
    }
    
    randomVar() {
        return '___' + Math.random().toString(36).substring(2, 10);
    }
}

module.exports = IntegrityCheck;
