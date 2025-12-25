class AntiDebug {
    inject(code) {
        const checks = [
            this.generateDebugCheck(),
            this.generateTimingCheck(),
            this.generateHookCheck(),
            this.generateEnvironmentCheck()
        ];
        
        return checks.join('\n') + '\n' + code;
    }
    
    generateDebugCheck() {
        const v1 = this.randomVar();
        const v2 = this.randomVar();
        
        return `
-- Debug Detection
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
        `;
    }
    
    generateTimingCheck() {
        const v1 = this.randomVar();
        const v2 = this.randomVar();
        const v3 = this.randomVar();
        
        return `
-- Timing Check (Anti-Debugger)
local ${v1} = os and os.clock or tick or function() return 0 end
local ${v2} = ${v1}()
for ${v3} = 1, 10000 do end
if ${v1}() - ${v2} > 0.5 then
    error("\\68\\101\\98\\117\\103\\103\\101\\114")
end
        `;
    }
    
    generateHookCheck() {
        const v1 = this.randomVar();
        const v2 = this.randomVar();
        
        return `
-- Hook Detection
local ${v1} = debug and debug.gethook or function() end
local ${v2} = ${v1}()
if ${v2} then
    while true do end
end
        `;
    }
    
    generateEnvironmentCheck() {
        const v1 = this.randomVar();
        
        return `
-- Environment Check
local ${v1} = getfenv or function() return _ENV end
if ${v1}().LOLHAX or ${v1}().IDA or ${v1}().OLLYDBG then
    error("\\72\\97\\99\\107\\32\\100\\101\\116\\101\\99\\116\\101\\100")
end
        `;
    }
    
    randomVar() {
        return '_' + Math.random().toString(36).substring(2, 15);
    }
}

module.exports = AntiDebug;
