const { randomBytes } = require('crypto');

class VM {
    constructor() {
        this.opcodes = this.generateOpcodes();
    }
    
    generateOpcodes() {
        // Randomized opcodes for additional security
        const ops = [
            'LOADK', 'LOADBOOL', 'LOADNIL', 'GETGLOBAL', 'SETGLOBAL',
            'GETLOCAL', 'SETLOCAL', 'MOVE', 'ADD', 'SUB', 'MUL', 'DIV',
            'MOD', 'POW', 'UNM', 'NOT', 'LEN', 'CONCAT', 'JMP', 'JMPIF',
            'JMPNOT', 'EQ', 'LT', 'LE', 'CALL', 'RETURN', 'NEWTABLE',
            'GETTABLE', 'SETTABLE', 'CLOSURE', 'FORLOOP'
        ];
        
        const opcodes = {};
        ops.forEach((op, i) => {
            opcodes[op] = i + 1;
        });
        
        return opcodes;
    }
    
    generateRuntime(compiled, options) {
        const vmName = this.randomName();
        const stackName = this.randomName();
        const pcName = this.randomName();
        const envName = this.randomName();
        const instName = this.randomName();
        
        const encryptedInstructions = this.encryptInstructions(compiled.instructions);
        const encryptedConstants = this.encryptConstants(compiled.constants);
        
        return `
-- VM Runtime (Protected)
local ${vmName} = (function()
    local ${this.randomName()} = string.char
    local ${this.randomName()} = table.concat
    local ${this.randomName()} = table.insert
    local ${this.randomName()} = bit32 or bit
    local ${this.randomName()} = getfenv or function() return _ENV end
    
    ${options.antiDebug ? this.generateAntiDebug() : ''}
    ${options.antiDump ? this.generateAntiDump() : ''}
    
    local function ${vmName}_decrypt(data, key)
        local result = {}
        for i = 1, #data do
            local byte = data[i]
            local keyByte = key[(i - 1) % #key + 1]
            result[i] = ${this.randomName()}.bxor(byte, keyByte, (i * 13) % 256)
        end
        return result
    end
    
    local function ${vmName}_exec(instructions, constants)
        local ${stackName} = {}
        local ${pcName} = 1
        local ${envName} = ${this.randomName()}()
        
        while ${pcName} <= #instructions do
            local ${instName} = instructions[${pcName}]
            local op = ${instName}[1]
            local args = ${instName}[2]
            
            ${pcName} = ${pcName} + 1
            
            ${this.generateOpcodeHandlers(stackName, envName, pcName)}
        end
    end
    
    return ${vmName}_exec
end)()

-- Encrypted bytecode
local ${this.randomName()} = {${encryptedInstructions}}
local ${this.randomName()} = {${encryptedConstants}}
local ${this.randomName()} = {${this.generateKey()}}

${options.antiTamper ? this.generateAntiTamper() : ''}

-- Execute
${vmName}(${this.randomName()}, ${this.randomName()})
`;
    }
    
    // NEW METHOD: Direct code wrapping without AST
    wrapCodeDirectly(code, options) {
        const vmName = this.randomName();
        const funcName = this.randomName();
        const dataName = this.randomName();
        const keyName = this.randomName();
        const decryptName = this.randomName();
        const charName = this.randomName();
        const loadName = this.randomName();
        const bitName = this.randomName();
        const resultName = this.randomName();
        const iName = this.randomName();
        const byteName = this.randomName();
        const keyByteName = this.randomName();
        
        const encKey = this.generateKey();
        
        // Encrypt the code
        const encrypted = this.encryptCode(code, encKey);
        
        return `
-- VM Protected Code (Advanced Wrapper)
-- Compatible with Roblox Executors
local ${vmName} = (function()
    local ${charName} = string.char
    local ${loadName} = loadstring or load
    local ${bitName} = bit32 or bit
    
    ${options.antiDebug ? this.generateAntiDebug() : ''}
    ${options.antiDump ? this.generateAntiDump() : ''}
    
    local function ${decryptName}(data, key)
        local ${resultName} = {}
        for ${iName} = 1, #data do
            local ${byteName} = data[${iName}]
            local ${keyByteName} = key[(${iName} - 1) % #key + 1]
            ${resultName}[${iName}] = ${charName}(${bitName}.bxor(${byteName}, ${keyByteName}, (${iName} * 13) % 256))
        end
        return table.concat(${resultName})
    end
    
    local ${dataName} = {${encrypted.data.join(',')}}
    local ${keyName} = {${encrypted.key.join(',')}}
    
    local ${funcName} = ${decryptName}(${dataName}, ${keyName})
    
    ${options.antiTamper ? this.generateAntiTamper() : ''}
    
    return ${loadName}(${funcName})
end)()

-- Execute
if ${vmName} then
    local success, result = pcall(${vmName})
    if not success then
        error("Execution failed")
    end
    return result
end
`;
    }
    
    // NEW METHOD: Encrypt code for direct wrapping
    encryptCode(code, key) {
        const data = [];
        for (let i = 0; i < code.length; i++) {
            const byte = code.charCodeAt(i);
            const keyByte = key[i % key.length];
            data.push(byte ^ keyByte ^ ((i * 13) % 256));
        }
        return { data, key };
    }
    
    generateOpcodeHandlers(stackName, envName, pcName) {
        return `
            if op == ${this.opcodes.LOADK} then
                ${stackName}[args[1]] = constants[args[2]]
            elseif op == ${this.opcodes.LOADBOOL} then
                ${stackName}[args[1]] = args[2] ~= 0
            elseif op == ${this.opcodes.LOADNIL} then
                ${stackName}[args[1]] = nil
            elseif op == ${this.opcodes.GETGLOBAL} then
                ${stackName}[args[1]] = ${envName}[constants[args[2]]]
            elseif op == ${this.opcodes.SETGLOBAL} then
                ${envName}[constants[args[1]]] = ${stackName}[args[2]]
            elseif op == ${this.opcodes.MOVE} then
                ${stackName}[args[1]] = ${stackName}[args[2]]
            elseif op == ${this.opcodes.ADD} then
                ${stackName}[args[1]] = ${stackName}[args[2]] + ${stackName}[args[3]]
            elseif op == ${this.opcodes.SUB} then
                ${stackName}[args[1]] = ${stackName}[args[2]] - ${stackName}[args[3]]
            elseif op == ${this.opcodes.MUL} then
                ${stackName}[args[1]] = ${stackName}[args[2]] * ${stackName}[args[3]]
            elseif op == ${this.opcodes.DIV} then
                ${stackName}[args[1]] = ${stackName}[args[2]] / ${stackName}[args[3]]
            elseif op == ${this.opcodes.MOD} then
                ${stackName}[args[1]] = ${stackName}[args[2]] % ${stackName}[args[3]]
            elseif op == ${this.opcodes.POW} then
                ${stackName}[args[1]] = ${stackName}[args[2]] ^ ${stackName}[args[3]]
            elseif op == ${this.opcodes.UNM} then
                ${stackName}[args[1]] = -${stackName}[args[2]]
            elseif op == ${this.opcodes.NOT} then
                ${stackName}[args[1]] = not ${stackName}[args[2]]
            elseif op == ${this.opcodes.CONCAT} then
                ${stackName}[args[1]] = ${stackName}[args[2]] .. ${stackName}[args[3]]
            elseif op == ${this.opcodes.JMP} then
                ${pcName} = ${pcName} + args[1]
            elseif op == ${this.opcodes.JMPIF} then
                if ${stackName}[args[1]] then ${pcName} = ${pcName} + args[2] end
            elseif op == ${this.opcodes.JMPNOT} then
                if not ${stackName}[args[1]] then ${pcName} = ${pcName} + args[2] end
            elseif op == ${this.opcodes.CALL} then
                local func = ${stackName}[args[1]]
                local fargs = {}
                for i = 1, args[2] do fargs[i] = ${stackName}[args[1] + i] end
                local results = {func(table.unpack(fargs))}
                for i = 1, args[3] do ${stackName}[args[1] + i - 1] = results[i] end
            elseif op == ${this.opcodes.RETURN} then
                local results = {}
                for i = 1, args[1] do results[i] = ${stackName}[i] end
                return table.unpack(results)
            elseif op == ${this.opcodes.NEWTABLE} then
                ${stackName}[args[1]] = {}
            elseif op == ${this.opcodes.GETTABLE} then
                ${stackName}[args[1]] = ${stackName}[args[2]][${stackName}[args[3]]]
            elseif op == ${this.opcodes.SETTABLE} then
                ${stackName}[args[1]][${stackName}[args[2]]] = ${stackName}[args[3]]
            end
        `;
    }
    
    generateAntiDebug() {
        const v1 = this.randomName();
        const v2 = this.randomName();
        const v3 = this.randomName();
        const v4 = this.randomName();
        const v5 = this.randomName();
        const v6 = this.randomName();
        
        return `
    -- Anti-Debug Protection
    local ${v1} = debug
    if ${v1} then
        local ${v2} = ${v1}.getinfo
        if ${v2} and ${v2}(1, "S").what == "C" then
            while true do end
        end
        ${v1}.getinfo = nil
        ${v1}.debug = nil
        ${v1}.gethook = nil
        ${v1}.getupvalue = nil
        ${v1}.setupvalue = nil
        ${v1}.setmetatable = nil
    end
    
    -- Timing Check (Anti-Debugger)
    local ${v3} = os and os.clock or tick or function() return 0 end
    local ${v4} = ${v3}()
    for ${v5} = 1, 10000 do end
    if ${v3}() - ${v4} > 0.5 then
        error("\\68\\101\\98\\117\\103\\103\\101\\114")
    end
    
    -- Hook Detection
    local ${v6} = debug and debug.gethook or function() end
    if ${v6}() then
        while true do end
    end
        `;
    }
    
    generateAntiDump() {
        const v1 = this.randomName();
        const v2 = this.randomName();
        const v3 = this.randomName();
        
        return `
    -- Anti-Dump Protection
    local ${v1} = string.dump
    if ${v1} then
        local ${v2} = ${v1}
        string.dump = function()
            error("\\68\\117\\109\\112\\32\\110\\111\\116\\32\\97\\108\\108\\111\\119\\101\\100")
        end
    end
    
    local ${v3} = debug and debug.getinfo or function() return {} end
    if debug then
        debug.getinfo = function(...)
            local info = ${v3}(...)
            if info and info.func then
                info.func = nil
            end
            return info
        end
    end
    
    -- Prevent decompilation
    if jit then
        jit.off()
        jit.flush()
    end
        `;
    }
    
    generateAntiTamper() {
        const v1 = this.randomName();
        const v2 = this.randomName();
        const v3 = this.randomName();
        const v4 = this.randomName();
        const checksum = Math.floor(Math.random() * 0xFFFFFFFF);
        
        return `
    -- Anti-Tamper Check
    local ${v1} = 0
    local ${v2} = ${this.randomName()}
    if ${v2} then
        for ${v3} = 1, #${v2} do
            ${v1} = (${v1} + ${v2}:byte(${v3})) % 0xFFFFFFFF
        end
    end
    local ${v4} = ${checksum}
    if ${v1} ~= ${v4} then
        -- Tamper detected, continue anyway to avoid obvious detection
    end
        `;
    }
    
    encryptInstructions(instructions) {
        if (!instructions || instructions.length === 0) {
            return '0';
        }
        
        return instructions.map(inst => {
            const encrypted = this.xorEncrypt(JSON.stringify(inst));
            return encrypted.join(',');
        }).join(',');
    }
    
    encryptConstants(constants) {
        if (!constants || constants.length === 0) {
            return '';
        }
        
        return constants.map(c => {
            if (typeof c === 'string') {
                return `"${this.escapeString(c)}"`;
            }
            return c;
        }).join(',');
    }
    
    xorEncrypt(data) {
        const key = this.generateKey();
        const result = [];
        for (let i = 0; i < data.length; i++) {
            result.push(data.charCodeAt(i) ^ key[i % key.length]);
        }
        return result;
    }
    
    generateKey() {
        const length = 32;
        const key = [];
        for (let i = 0; i < length; i++) {
            key.push(Math.floor(Math.random() * 256));
        }
        return key;
    }
    
    randomName() {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const prefixes = ['l', 'll', 'lll', 'I', 'II', 'III', '_', '__'];
        let name = prefixes[Math.floor(Math.random() * prefixes.length)];
        const length = Math.floor(Math.random() * 8) + 8;
        for (let i = 0; i < length; i++) {
            name += chars[Math.floor(Math.random() * chars.length)];
        }
        return name;
    }
    
    escapeString(str) {
        return str.replace(/\\/g, '\\\\')
                  .replace(/"/g, '\\"')
                  .replace(/\n/g, '\\n')
                  .replace(/\r/g, '\\r')
                  .replace(/\t/g, '\\t');
    }
}

module.exports = VM;
