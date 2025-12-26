const Parser = require('./core/parser');
const Compiler = require('./core/compiler');
const VM = require('./core/vm');
const HybridVM = require('./core/hybridVM');
const CompactVM = require('./core/compactVM');
const Optimizer = require('./core/optimizer');
const RawObfuscator = require('./core/rawObfuscator');
const AES256 = require('./security/aes256');
const AntiTamper = require('./security/antiTamper');
const AntiDebug = require('./security/antiDebug');
const AntiDump = require('./security/antiDump');
const IntegrityCheck = require('./security/integrityCheck');
const Watermark = require('./security/watermark');
const ControlFlow = require('./transformers/controlFlow');
const StringEncryption = require('./transformers/stringEncryption');
const ConstantEncryption = require('./transformers/constantEncryption');
const VariableRenaming = require('./transformers/variableRenaming');
const JunkCode = require('./transformers/junkCode');
const DeadCode = require('./transformers/deadCode');
const config = require('../config/config');
const logger = require('../utils/logger');

class Obfuscator {
    constructor(options = {}) {
        this.options = this.mergeOptions(options);
        this.parser = new Parser();
        this.compiler = new Compiler();
        this.vm = new VM();
        this.hybridVM = new HybridVM();
        this.compactVM = new CompactVM();
        this.rawObfuscator = new RawObfuscator();
        this.transformers = this.initializeTransformers();
    }
    
    mergeOptions(options) {
        const preset = options.preset || 'medium';
        const presetConfig = this.getPresetConfig(preset);
        
        return {
            ...presetConfig,
            ...options,
        };
    }
    
    getPresetConfig(preset) {
        const presets = {
            low: {
                mode: 'compact',
                vm: true,
                antiDebug: false,
                antiTamper: false,
                junkDensity: 0,
                minify: true,
            },
            medium: {
                mode: 'compact',
                vm: true,
                antiDebug: true,
                antiTamper: false,
                junkDensity: 0,
                minify: true,
            },
            high: {
                mode: 'compact',
                vm: true,
                antiDebug: true,
                antiTamper: true,
                junkDensity: 1,
                minify: true,
            },
            extreme: {
                mode: 'hybrid',
                vm: true,
                antiDebug: true,
                antiTamper: true,
                antiDump: true,
                junkDensity: 2,
                minify: true,
            }
        };
        
        return presets[preset] || presets.medium;
    }
    
    initializeTransformers() {
        return {
            controlFlow: new ControlFlow(),
            stringEncryption: new StringEncryption(),
            constantEncryption: new ConstantEncryption(),
            variableRenaming: new VariableRenaming(),
            junkCode: new JunkCode(this.options.junkDensity || 0),
            deadCode: new DeadCode(),
        };
    }
    
    async obfuscate(sourceCode) {
        try {
            logger.info('Starting obfuscation process...');
            const startTime = Date.now();
            
            // Parse
            logger.info('Parsing source code...');
            const parseResult = this.parser.parse(sourceCode);
            
            if (!this.parser.validate(parseResult)) {
                throw new Error('Invalid Lua syntax');
            }
            
            let output;
            
            // Use compact mode for best size ratio
            if (this.options.mode === 'compact') {
                logger.info('Using COMPACT mode (professional grade)');
                output = this.obfuscateCompact(parseResult.source);
            } else if (this.options.mode === 'hybrid') {
                logger.info('Using HYBRID mode (balanced)');
                output = this.obfuscateHybrid(parseResult.source);
            } else {
                logger.info('Using RAW mode');
                output = await this.obfuscateRaw(parseResult.source);
            }
            
            // Add minimal protections
            output = this.addProtections(output);
            
            const duration = Date.now() - startTime;
            logger.info(`✅ Obfuscation complete in ${duration}ms`);
            logger.info(`📊 Size: ${sourceCode.length} → ${output.length} bytes (${((output.length / sourceCode.length) * 100).toFixed(1)}%)`);
            
            return output;
            
        } catch (error) {
            logger.error('Obfuscation failed:', error);
            throw new Error('Obfuscation failed: ' + error.message);
        }
    }
    
    /**
     * Compact mode - Professional grade, minimal size increase
     */
    obfuscateCompact(sourceCode) {
        return this.compactVM.compactWrap(sourceCode, this.options);
    }
    
    /**
     * Hybrid mode - Balanced security and size
     */
    obfuscateHybrid(sourceCode) {
        return this.hybridVM.hybridWrap(sourceCode, this.options);
    }
    
    /**
     * Raw mode - Fallback
     */
    async obfuscateRaw(sourceCode) {
        let code = sourceCode;
        
        if (this.options.minify) {
            code = this.minify(code);
        }
        
        if (this.options.vm) {
            code = this.compactVM.compactWrap(code, this.options);
        }
        
        return code;
    }
    
    /**
     * Add minimal protections (compact)
     */
    addProtections(code) {
        let protected = code;
        
        // Compact anti-debug (one-liner)
        if (this.options.antiDebug) {
            const v = this.randomVar();
            protected = `local ${v}=debug;if ${v} then ${v}.getinfo=nil;${v}.debug=nil end;` + protected;
        }
        
        // Minimal watermark
        if (this.options.watermark) {
            protected = `--[==[Obfuscated ${Date.now()}]==]\n` + protected;
        }
        
        return protected;
    }
    
    /**
     * Simple minification
     */
    minify(code) {
        return code
            .replace(/--\[\[[\s\S]*?\]\]/g, '')
            .replace(/--[^\n]*/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }
    
    randomVar() {
        return '_' + Math.random().toString(36).substring(2, 7);
    }
}

module.exports = Obfuscator;
