const Parser = require('./core/parser');
const Compiler = require('./core/compiler');
const VM = require('./core/vm');
const Optimizer = require('./core/optimizer');
const RawObfuscator = require('./core/rawObfuscator'); // NEW
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
        this.rawObfuscator = new RawObfuscator();
        this.transformers = this.initializeTransformers();
    }
    
    mergeOptions(options) {
        const preset = options.preset || 'medium';
        const presetConfig = this.getPresetConfig(preset);
        
        return {
            ...presetConfig,
            ...options
        };
    }
    
    getPresetConfig(preset) {
        const presets = {
            low: {
                vm: false,
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
                antiDebug: true,
                antiTamper: true,
                antiDump: false,
                encryption: 'aes256',
                controlFlow: true,
                junkDensity: 3,
                stringEncryption: true,
                constantEncryption: true,
                variableRenaming: true,
                deadCode: true,
            },
            high: {
                vm: true,
                antiDebug: true,
                antiTamper: true,
                antiDump: true,
                encryption: 'aes256',
                controlFlow: true,
                junkDensity: 5,
                stringEncryption: true,
                constantEncryption: true,
                variableRenaming: true,
                junkCode: true,
                deadCode: true,
                watermark: true,
            },
            extreme: {
                vm: true,
                nestedVm: true,
                antiDebug: true,
                antiTamper: true,
                antiDump: true,
                encryption: 'multilayer',
                controlFlow: true,
                controlFlowFlattening: true,
                junkDensity: 8,
                stringEncryption: true,
                constantEncryption: true,
                variableRenaming: true,
                junkCode: true,
                deadCode: true,
                watermark: true,
                integrityCheck: true,
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
            
            // Step 1: Parse (with fallback support)
            logger.info('Parsing source code...');
            const parseResult = this.parser.parse(sourceCode);
            
            if (!this.parser.validate(parseResult)) {
                throw new Error('Invalid Lua syntax');
            }
            
            let output;
            
            // Choose obfuscation strategy based on parse mode
            if (parseResult.mode === 'raw') {
                logger.info('Using RAW mode obfuscation (parser-free)');
                output = await this.obfuscateRaw(parseResult.source);
            } else {
                logger.info('Using AST mode obfuscation');
                output = await this.obfuscateAST(parseResult);
            }
            
            // Apply security layers (works for both modes)
            logger.info('Applying security layers...');
            output = await this.applySecurityLayers(output);
            
            // Optimize
            if (this.options.optimize !== false) {
                logger.info('Optimizing output...');
                const optimizer = new Optimizer();
                output = optimizer.optimize(output);
            }
            
            logger.info('✅ Obfuscation complete!');
            return output;
            
        } catch (error) {
            logger.error('Obfuscation failed:', error);
            throw new Error('Obfuscation failed: ' + error.message);
        }
    }
    
    async obfuscateRaw(sourceCode) {
        // Raw obfuscation without AST parsing
        let code = sourceCode;
        
        // Apply raw transformations
        if (this.options.stringEncryption) {
            code = this.rawObfuscator.encryptStrings(code);
        }
        
        if (this.options.variableRenaming) {
            code = this.rawObfuscator.renameVariables(code);
        }
        
        if (this.options.junkCode) {
            code = this.rawObfuscator.addJunkCode(code, this.options.junkDensity);
        }
        
        if (this.options.vm) {
            // Wrap in VM without parsing
            code = this.vm.wrapCodeDirectly(code, this.options);
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
        // Variable Renaming
        if (this.options.variableRenaming) {
            ast = this.transformers.variableRenaming.transform(ast);
        }
        
        // String Encryption
        if (this.options.stringEncryption) {
            ast = this.transformers.stringEncryption.transform(ast);
        }
        
        // Constant Encryption
        if (this.options.constantEncryption) {
            ast = this.transformers.constantEncryption.transform(ast);
        }
        
        // Control Flow
        if (this.options.controlFlow) {
            ast = this.transformers.controlFlow.transform(ast);
        }
        
        // Dead Code
        if (this.options.deadCode) {
            ast = this.transformers.deadCode.transform(ast);
        }
        
        // Junk Code
        if (this.options.junkCode) {
            ast = this.transformers.junkCode.transform(ast);
        }
        
        return ast;
    }
    
    async applySecurityLayers(code) {
        // Watermark
        if (this.options.watermark) {
            const watermark = new Watermark();
            code = watermark.embed(code, {
                timestamp: Date.now(),
                version: '2.0.0'
            });
        }
        
        // Anti-Debug
        if (this.options.antiDebug) {
            const antiDebug = new AntiDebug();
            code = antiDebug.inject(code);
        }
        
        // Anti-Dump
        if (this.options.antiDump) {
            const antiDump = new AntiDump();
            code = antiDump.inject(code);
        }
        
        // Anti-Tamper
        if (this.options.antiTamper) {
            const antiTamper = new AntiTamper();
            code = antiTamper.protect(code);
        }
        
        // Integrity Check
        if (this.options.integrityCheck) {
            const integrityCheck = new IntegrityCheck();
            code = integrityCheck.wrap(code);
        }
        
        return code;
    }
}

module.exports = Obfuscator;
