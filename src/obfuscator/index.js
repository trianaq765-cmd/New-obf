const Parser = require('./core/parser');
const ProfessionalVM = require('./core/professionalVM');
const logger = require('../utils/logger');

class Obfuscator {
    constructor(options = {}) {
        this.options = this.mergeOptions(options);
        this.parser = new Parser();
        this.vm = new ProfessionalVM();
    }
    
    mergeOptions(options) {
        const preset = options.preset || 'medium';
        const presets = {
            low: {
                vm: true,
                layers: 1,
                antiDebug: false,
            },
            medium: {
                vm: true,
                layers: 2,
                antiDebug: true,
            },
            high: {
                vm: true,
                layers: 3,
                antiDebug: true,
                antiTamper: true,
            },
            extreme: {
                vm: true,
                layers: 4,
                antiDebug: true,
                antiTamper: true,
                antiDump: true,
            }
        };
        
        return { ...(presets[preset] || presets.medium), ...options };
    }
    
    async obfuscate(sourceCode) {
        try {
            logger.info('Starting professional obfuscation...');
            const startTime = Date.now();
            
            // Parse and validate
            const parseResult = this.parser.parse(sourceCode);
            if (!this.parser.validate(parseResult)) {
                throw new Error('Invalid Lua syntax');
            }
            
            let code = parseResult.source;
            
            // Apply protection layers
            for (let i = 0; i < this.options.layers; i++) {
                logger.info(`Applying protection layer ${i + 1}/${this.options.layers}...`);
                code = this.vm.wrap(code, this.options);
            }
            
            // Add minimal anti-protections (clean, no comments)
            if (this.options.antiDebug) {
                code = this.addAntiDebug(code);
            }
            
            if (this.options.antiTamper) {
                code = this.addAntiTamper(code);
            }
            
            const duration = Date.now() - startTime;
            const ratio = (code.length / sourceCode.length).toFixed(2);
            
            logger.info(`✅ Obfuscation complete in ${duration}ms`);
            logger.info(`📊 Size: ${sourceCode.length} → ${code.length} bytes (${ratio}x)`);
            
            return code;
            
        } catch (error) {
            logger.error('Obfuscation failed:', error);
            throw new Error('Obfuscation failed: ' + error.message);
        }
    }
    
    addAntiDebug(code) {
        const v1 = this.randomVar();
        const v2 = this.randomVar();
        const v3 = this.randomVar();
        
        const antiDebug = `local ${v1}=debug;if ${v1} then ${v1}.getinfo=nil;${v1}.debug=nil;${v1}.gethook=nil end;` +
                         `local ${v2}=os.clock or tick;local ${v3}=${v2}();for i=1,1e4 do end;` +
                         `if ${v2}()-${v3}>0.1 then while true do end end;`;
        
        return antiDebug + code;
    }
    
    addAntiTamper(code) {
        const v1 = this.randomVar();
        const checksum = this.calculateChecksum(code);
        
        return `local ${v1}=${checksum};` + code;
    }
    
    calculateChecksum(code) {
        let sum = 0;
        for (let i = 0; i < Math.min(code.length, 1000); i++) {
            sum = (sum + code.charCodeAt(i)) % 0xFFFFFFFF;
        }
        return sum;
    }
    
    randomVar() {
        const chars = 'abcdefghijklmnopqrstuvwxyz';
        let name = '_';
        for (let i = 0; i < 5; i++) {
            name += chars[Math.floor(Math.random() * chars.length)];
        }
        return name;
    }
}

module.exports = Obfuscator;
