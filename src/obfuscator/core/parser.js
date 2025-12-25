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
            luaVersion: '5.1'
        };
    }
    
    parse(sourceCode) {
        try {
            const ast = luaparse.parse(sourceCode, this.options);
            return ast;
        } catch (error) {
            logger.error('Parse error:', error);
            throw new Error('Failed to parse Lua code: ' + error.message);
        }
    }
    
    validate(ast) {
        // Basic AST validation
        if (!ast || !ast.type) {
            throw new Error('Invalid AST structure');
        }
        return true;
    }
}

module.exports = Parser;
