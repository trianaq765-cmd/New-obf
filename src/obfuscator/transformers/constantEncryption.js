class ConstantEncryption {
    transform(ast) {
        this.walkAST(ast);
        return ast;
    }
    
    walkAST(node) {
        if (!node) return;
        
        if (node.type === 'NumericLiteral') {
            node.value = this.encryptNumber(node.value);
            node.encrypted = true;
        }
        
        for (let key in node) {
            if (node[key] && typeof node[key] === 'object') {
                if (Array.isArray(node[key])) {
                    node[key].forEach(child => this.walkAST(child));
                } else {
                    this.walkAST(node[key]);
                }
            }
        }
    }
    
    encryptNumber(num) {
        const operations = [
            () => `(${num + 1000} - 1000)`,
            () => `(${num * 2} / 2)`,
            () => `(${num} + ${Math.random() * 100} - ${Math.random() * 100})`,
            () => `bit32.bxor(${num}, 0)`,
            () => `(function() return ${num} end)()`,
        ];
        
        return operations[Math.floor(Math.random() * operations.length)]();
    }
}

module.exports = ConstantEncryption;
