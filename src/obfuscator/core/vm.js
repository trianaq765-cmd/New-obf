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
        return `
    -- Anti-Debug Protection
    local ${this.randomName()} = debug and debug.getinfo or function() return {} end
    local ${this.randomName()} = ${this.randomName()}(1)
    if ${this.randomName()}.what == "C" then error("Debug detected") end
    
    local ${this.randomName()} = os and os.clock or function() return 0 end
    local ${this.randomName()} = ${this.randomName()}()
    -- Timing check
    for ${this.randomName()} = 1, 1000 do end
    if ${this.randomName()}() - ${this.randomName()} > 0.1 then error("Debugger detected") end
        `;
    }
    
    generateAntiDump() {
        return `
    -- Anti-Dump Protection
    local ${this.randomName()} = string.dump
    if ${this.randomName()} then
        local ${this.randomName()} = ${this.randomName()}
        string.dump = function() error("Dump not allowed") end
    end
        `;
    }
    
    generateAntiTamper() {
        return `
    -- Anti-Tamper Check
    local ${this.randomName()} = 0
    local ${this.randomName()} = ${this.randomName()}
    for ${this.randomName()} = 1, #${this.randomName()} do
        ${this.randomName()} = (${this.randomName()} + ${this.randomName()}[${this.randomName()}]) % 0xFFFFFFFF
    end
    local ${this.randomName()} = ${Math.floor(Math.random() * 0xFFFFFFFF)}
    if ${this.randomName()} ~= ${this.randomName()} then error("Tampering detected") end
        `;
    }
    
    encryptInstructions(instructions) {
        return instructions.map(inst => {
            const encrypted = this.xorEncrypt(JSON.stringify(inst));
            return encrypted.join(',');
        }).join(',');
    }
    
    encryptConstants(constants) {
        return constants.map(c => {
            if (typeof c === 'string') {
                return `"${c}"`;
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
}

module.exports = VM;
