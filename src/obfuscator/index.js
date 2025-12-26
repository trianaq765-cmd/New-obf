const Parser = require('./core/parser');
const Compiler = require('./core/compiler');
const VM = require('./core/vm');
const HybridVM = require('./core/hybridVM');
const CompactVM = require('./core/compactVM');
const ProfessionalVM = require('./core/professionalVM');
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
        this.professionalVM = new ProfessionalVM();
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
                mode: 'professional',
                vm: true,
                vmLayers: 1,
                antiDebug: false,
                antiTamper: false,
                antiDump: false,
                stringEncryption: true,
                constantEncryption: false,
                variableRenaming: true,
                controlFlow: false,
                junkCode: false,
                deadCode: false,
                watermark: true,
                integrityCheck: false,
            },
            medium: {
                mode: 'professional',
                vm: true,
                vmLayers: 2,
                antiDebug: true,
                antiTamper: true,
                antiDump: false,
                stringEncryption: true,
                constantEncryption: true,
                variableRenaming: true,
                controlFlow: true,
                junkCode: true,
                deadCode: true,
                watermark: true,
                integrityCheck: false,
            },
            high: {
                mode: 'professional',
                vm: true,
                vmLayers: 3,
                antiDebug: true,
                antiTamper: true,
                antiDump: true,
                stringEncryption: true,
                constantEncryption: true,
                variableRenaming: true,
                controlFlow: true,
                junkCode: true,
                deadCode: true,
                watermark: true,
                integrityCheck: true,
            },
            extreme: {
                mode: 'professional',
                vm: true,
                vmLayers: 4,
                antiDebug: true,
                antiTamper: true,
                antiDump: true,
                stringEncryption: true,
                constantEncryption: true,
                variableRenaming: true,
                controlFlow: true,
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
            junkCode: new JunkCode(this.options.junkDensity || 3),
            deadCode: new DeadCode(),
        };
    }
    
    async obfuscate(sourceCode) {
        try {
            logger.info('Starting obfuscation process...');
            const startTime = Date.now();
            
            // Step 1: Parse
            logger.info('Parsing source code...');
            const parseResult = this.parser.parse(sourceCode);
            
            if (!this.parser.validate(parseResult)) {
                throw new Error('Invalid Lua syntax');
            }
            
            let output;
            
            // Step 2: Choose obfuscation mode
            if (parseResult.mode === 'raw' || this.options.mode === 'professional') {
                logger.info('Using PROFESSIONAL mode (Luraph-style)');
                output = await this.obfuscateProfessional(parseResult.source);
            } else {
                logger.info('Using AST mode');
                output = await this.obfuscateAST(parseResult);
            }
            
            // Step 3: Add watermark (at the top)
            if (this.options.watermark) {
                logger.info('Adding watermark...');
                const watermark = new Watermark();
                output = watermark.embed(output, {
                    timestamp: Date.now(),
                    version: '2.0.0',
                    preset: this.options.preset || 'medium'
                });
            }
            
            const duration = Date.now() - startTime;
            const ratio = (output.length / sourceCode.length).toFixed(2);
            
            logger.info(`✅ Obfuscation complete in ${duration}ms`);
            logger.info(`📊 Size: ${sourceCode.length} → ${output.length} bytes (${ratio}x)`);
            
            return output;
            
        } catch (error) {
            logger.error('Obfuscation failed:', error);
            throw new Error('Obfuscation failed: ' + error.message);
        }
    }
    
    async obfuscateProfessional(sourceCode) {
        let code = sourceCode;
        
        // Apply transformations before VM
        logger.info('Applying transformations...');
        
        if (this.options.stringEncryption) {
            code = this.rawObfuscator.encryptStrings(code);
        }
        
        if (this.options.variableRenaming) {
            code = this.rawObfuscator.renameVariables(code);
        }
        
        if (this.options.constantEncryption) {
            code = this.rawObfuscator.encryptConstants(code);
        }
        
        if (this.options.junkCode) {
            code = this.rawObfuscator.addJunkCode(code, 3);
        }
        
        if (this.options.deadCode) {
            code = this.rawObfuscator.addDeadCode(code);
        }
        
        // Apply VM layers
        if (this.options.vm) {
            logger.info(`Applying ${this.options.vmLayers} VM layer(s)...`);
            
            for (let i = 0; i < this.options.vmLayers; i++) {
                code = this.professionalVM.wrap(code, this.options);
            }
        }
        
        // Add security layers (clean, no ugly comments)
        code = this.addSecurityLayers(code);
        
        return code;
    }
    
    async obfuscateAST(parseResult) {
        let ast = parseResult.ast;
        
        // Transform AST
        logger.info('Applying AST transformations...');
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
    
    addSecurityLayers(code) {
        let protected = code;
        
        // Anti-Debug (compact, no comments)
        if (this.options.antiDebug) {
            const antiDebug = new AntiDebug();
            protected = antiDebug.injectCompact(protected);
        }
        
        // Anti-Dump (compact)
        if (this.options.antiDump) {
            const antiDump = new AntiDump();
            protected = antiDump.injectCompact(protected);
        }
        
        // Anti-Tamper (compact)
        if (this.options.antiTamper) {
            const antiTamper = new AntiTamper();
            protected = antiTamper.protectCompact(protected);
        }
        
        // Integrity Check
        if (this.options.integrityCheck) {
            const integrityCheck = new IntegrityCheck();
            protected = integrityCheck.wrapCompact(protected);
        }
        
        return protected;
    }
}

module.exports = Obfuscator;
