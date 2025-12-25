class Optimizer {
    optimize(code) {
        // Remove unnecessary whitespace
        code = this.removeExcessWhitespace(code);
        
        // Remove comments (already done by parser)
        
        // Minify where possible
        code = this.minify(code);
        
        return code;
    }
    
    removeExcessWhitespace(code) {
        // Keep Lua syntax intact
        return code.replace(/\s+/g, ' ')
                   .replace(/\s*([=+\-*/%^#<>~,;:(){}[\]])\s*/g, '$1')
                   .replace(/\s+$/gm, '');
    }
    
    minify(code) {
        // Basic minification
        return code.split('\n')
                   .map(line => line.trim())
                   .filter(line => line.length > 0)
                   .join('\n');
    }
}

module.exports = Optimizer;
