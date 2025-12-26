const Parser = require('./core/parser');
const Compiler = require('./core/compiler');
const VM = require('./core/vm');
const HybridVM = require('./core/hybridVM'); // NEW
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
        this.hybridVM = new HybridVM(); // NEW
        this.rawObfuscator = new RawObfuscator();
        this.transformers = this.initializeTransformers();
    }
    
    mergeOptions(options) {
        const preset = options.preset || 'medium';
        const presetConfig = this.getPresetConfig(preset);
        
        return {
            ...presetConfig,
            ...options,
            hybridMode: options.hybridMode !== false, // Enable hybrid by default
        };
    }
    
    getPresetConfig(preset) {
        const presets = {
            low: {
                vm: false,
                hybridMode: false,
                antiDebug: false,
                antiTamper: false,
                antiDump: false,
                encryption: 'xor',
                controlFlow: false,
                junkDensity: 1,
                stringEncryption: true,
                variableRenaming: true,
            },
            medium: {
                vm: true,
                hybridMode: true, // Use hybrid VM
                antiDebug: true,
                antiTamper: false,
                antiDump: false,
                encryption: 'aes256',
                controlFlow: false,
                junkDensity: 2,
                stringEncryption: true,
                constantEncryption: false,
                variableRenaming: true,
                deadCode: false,
            },
            high: {
                vm: true,
                hybridMode: true,
                antiDebug: true,
                antiTamper: true,
                antiDump: true,
                encryption: 'aes256',
                controlFlow: true,
                junkDensity: 3,
                stringEncryption: true,
                constantEncryption: true,
                variableRenaming: true,
                junkCode: true,
                deadCode: true,
                watermark: false,
            },
            extreme: {
                vm: true,
                hybridMode: false, // Full VM for extreme
                nestedVm: false,
                antiDebug: true,
                antiTamper: true,
                antiDump: true,
                encryption: 'multilayer',
                controlFlow: true,
                controlFlowFlattening: true,
                junkDensity: 5,
                stringEncryption: true,
                constantEncryption: true,
                variableRenaming: true,
                junkCode: true,
                deadCode: true,
                watermark: true,
                integrityCheck: false,
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
            junkCode: new JunkCode(this.options.junkDensity),
            deadCode: new DeadCode(),
        };
    }
    
    async obfuscate(sourceCode) {
        try {
            logger.info('Starting obfuscation process...');
            
            // Parse
            logger.info('Parsing source code...');
            const parseResult = this.parser.parse(sourceCode);
            
            if (!this.parser.validate(parseResult)) {
                throw new Error('Invalid Lua syntax');
            }
            
            let output;
            
            // Choose obfuscation strategy
            if (parseResult.mode === 'raw') {
                logger.info('Using RAW mode obfuscation (parser-free)');
                output = await this.obfuscateRaw(parseResult.source);
            } else {
                logger.info('Using AST mode obfuscation');
                output = await this.obfuscateAST(parseResult);
            }
            
            // Apply security layers (lightweight)
            logger.info('Applying security layers...');
            output = await this.applySecurityLayers(output);
            
            logger.info('✅ Obfuscation complete!');
            return output;
            
        } catch (error) {
            logger.error('Obfuscation failed:', error);
            throw new Error('Obfuscation failed: ' + error.message);
        }
    }
    
    async obfuscateRaw(sourceCode) {
        let code = sourceCode;
        
        // Use Hybrid VM if enabled (20% VM, 80% optimized Lua)
        if (this.options.vm && this.options.hybridMode) {
            logger.info('Using Hybrid VM (20% virtualization)');
            code = this.hybridVM.hybridWrap(code, this.options);
        } else if (this.options.vm) {
            // Full VM wrapping (slower, only for extreme preset)
            logger.info('Using Full VM wrapping');
            code = this.vm.wrapCodeDirectly(code, this.options);
        } else {
            // No VM, just transformations
            if (this.options.stringEncryption) {
                code = this.rawObfuscator.encryptStrings(code);
            }
            
            if (this.options.variableRenaming) {
                code = this.rawObfuscator.renameVariables(code);
            }
            
            if (this.options.junkCode) {
                code = this.rawObfuscator.addJunkCode(code, this.options.junkDensity);
            }
        }
        
        return code;
    }
    
    async obfuscateAST(parseResult) {
        let ast = parseResult.ast;
        
        // Transform AST
        logger.info('Applying transformations...');
        ast = await this.applyTransformations(ast);
        
        // Compile
        let output;
        if (this.options.vm) {
            logger.info('Compiling to VM instructions...');
            const instructions = this.compiler.compile(ast);
            output = this.vm.generateRuntime(instructions, this.options);
        } else {
            logger.info('Generating obfuscated code...');
            output = this.compiler.generateCode(ast);
        }
        
        return output;
    }
    
    async applyTransformations(ast) {
        if (this.options.variableRenaming) {
            ast = this.transformers.variableRenaming.transform(ast);
        }
        
        if (this.options.stringEncryption) {
            ast = this.transformers.stringEncryption.transform(ast);
        }
        
        if (this.options.constantEncryption) {
            ast = this.transformers.constantEncryption.transform(ast);
        }
        
        if (this.options.controlFlow) {
            ast = this.transformers.controlFlow.transform(ast);
        }
        
        if (this.options.deadCode) {
            ast = this.transformers.deadCode.transform(ast);
        }
        
        if (this.options.junkCode) {
            ast = this.transformers.junkCode.transform(ast);
        }
        
        return ast;
    }
    
    async applySecurityLayers(code) {
        // Only apply lightweight security to avoid bloat
        
        if (this.options.watermark) {
            const watermark = new Watermark();
            code = watermark.embed(code, {
                timestamp: Date.now(),
                version: '2.0.0'
            });
        }
        
        // Anti-debug is now built into hybrid VM, skip if hybrid mode
        if (this.options.antiDebug && !this.options.hybridMode) {
            const antiDebug = new AntiDebug();
            code = antiDebug.inject(code);
        }
        
        // Skip heavy protections for better performance
        // Anti-tamper and integrity checks add too much overhead
        
        return code;
    }
}

module.exports = Obfuscator;
