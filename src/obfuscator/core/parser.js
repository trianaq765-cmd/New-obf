const luaparse = require('luaparse');
const logger = require('../../utils/logger');

class Parser {
    constructor() {
        this.options = {
            wait: false,
            comments: false,
            scope: true,
            locations: true,
            ranges: true,
            luaVersion: '5.1',
            encodingMode: 'pseudo-latin1'
        };
    }
    
    parse(sourceCode) {
        // Try multiple parsing strategies
        
        // Strategy 1: Standard luaparse
        try {
            const ast = luaparse.parse(sourceCode, this.options);
            logger.info('✅ Parsed successfully with luaparse');
            return { ast, mode: 'ast', source: sourceCode };
        } catch (error) {
            logger.warn('⚠️  luaparse failed, trying fallback parser...');
        }
        
        // Strategy 2: Lenient mode
        try {
            const ast = luaparse.parse(sourceCode, {
                ...this.options,
                comments: true,
                scope: false,
                locations: false,
                ranges: false
            });
            logger.info('✅ Parsed successfully with lenient mode');
            return { ast, mode: 'ast', source: sourceCode };
        } catch (error) {
            logger.warn('⚠️  Lenient mode failed, using raw mode...');
        }
        
        // Strategy 3: Raw mode (no AST, direct obfuscation)
        logger.info('✅ Using raw mode (direct obfuscation without AST)');
        return {
            ast: null,
            mode: 'raw',
            source: sourceCode,
            isValid: this.validateLuaSyntax(sourceCode)
        };
    }
    
    validateLuaSyntax(code) {
        // Basic Lua syntax validation
        try {
            // Check balanced keywords
            const functionCount = (code.match(/\bfunction\b/g) || []).length;
            const endCount = (code.match(/\bend\b/g) || []).length;
            
            // Check balanced parentheses
            let parenDepth = 0;
            for (let char of code) {
                if (char === '(') parenDepth++;
                if (char === ')') parenDepth--;
                if (parenDepth < 0) return false;
            }
            
            // Basic checks
            if (code.trim().length === 0) return false;
            
            // Should have some Lua keywords or be a valid expression
            const hasLuaKeywords = /\b(local|function|if|then|else|end|for|while|do|return|break)\b/.test(code);
            const hasValidStructure = code.includes('(') || code.includes('=') || hasLuaKeywords;
            
            return hasValidStructure;
            
        } catch (error) {
            return false;
        }
    }
    
    validate(parseResult) {
        if (parseResult.mode === 'raw') {
            return parseResult.isValid;
        }
        
        if (!parseResult.ast || !parseResult.ast.type) {
            return false;
        }
        
        return true;
    }
}

module.exports = Parser;
