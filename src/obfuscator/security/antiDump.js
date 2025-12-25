class AntiDump {
    inject(code) {
        return this.generateAntiDump() + '\n' + code;
    }
    
    generateAntiDump() {
        const v1 = this.randomVar();
        const v2 = this.randomVar();
        const v3 = this.randomVar();
        
        return `
-- Anti-Dump Protection
local ${v1} = string.dump
if ${v1} then
    local ${v2} = ${v1}
    string.dump = function(...)
        error("\\68\\117\\109\\112\\32\\110\\111\\116\\32\\97\\108\\108\\111\\119\\101\\100")
    end
end

local ${v3} = debug and debug.getinfo or function() return {} end
local original_getinfo = ${v3}
if debug then
    debug.getinfo = function(...)
        local info = original_getinfo(...)
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
    
    randomVar() {
        return '__' + Math.random().toString(36).substring(2, 12);
    }
}

module.exports = AntiDump;
