class VariableRenaming {
    constructor() {
        this.variableMap = new Map();
        this.usedNames = new Set();
        this.preservedGlobals = new Set(['print', 'table', 'string', 'math', 'game', 'workspace', 'script', '_G', 'shared']);
    }
    
    transform(ast) {
        this.variableMap.clear();
        this.usedNames.clear();
        this.collectVariables(ast);
        this.renameVariables(ast);
        return ast;
    }
    
    collectVariables(node) {
        if (!node) return;
        
        if (node.type === 'Identifier' && !this.preservedGlobals.has(node.name)) {
            if (!this.variableMap.has(node.name)) {
                this.variableMap.set(node.name, this.generateName());
            }
        }
        
        for (let key in node) {
            if (node[key] && typeof node[key] === 'object') {
                if (Array.isArray(node[key])) {
                    node[key].forEach(child => this.collectVariables(child));
                } else {
                    this.collectVariables(node[key]);
                }
            }
        }
    }
    
    renameVariables(node) {
        if (!node) return;
        
        if (node.type === 'Identifier' && this.variableMap.has(node.name)) {
            node.name = this.variableMap.get(node.name);
        }
        
        for (let key in node) {
            if (node[key] && typeof node[key] === 'object') {
                if (Array.isArray(node[key])) {
                    node[key].forEach(child => this.renameVariables(child));
                } else {
                    this.renameVariables(node[key]);
                }
            }
        }
    }
    
    generateName() {
        const patterns = [
            () => 'l' + this.randomString(10),
            () => 'I' + this.randomString(8) + 'l',
            () => '__' + this.randomString(12),
            () => this.randomString(1) + '_' + this.randomHex(8),
        ];
        
        let name;
        do {
            name = patterns[Math.floor(Math.random() * patterns.length)]();
        } while (this.usedNames.has(name));
        
        this.usedNames.add(name);
        return name;
    }
    
    randomString(length) {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
    }
    
    randomHex(length) {
        const chars = '0123456789ABCDEF';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
    }
}

module.exports = VariableRenaming;
