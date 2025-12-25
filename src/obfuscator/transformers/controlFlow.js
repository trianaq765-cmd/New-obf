class ControlFlow {
    transform(ast) {
        this.flattenControlFlow(ast);
        return ast;
    }
    
    flattenControlFlow(node) {
        if (!node) return;
        
        if (node.type === 'IfStatement') {
            this.flattenIf(node);
        } else if (node.type === 'WhileStatement') {
            this.flattenWhile(node);
        }
        
        for (let key in node) {
            if (node[key] && typeof node[key] === 'object') {
                if (Array.isArray(node[key])) {
                    node[key].forEach(child => this.flattenControlFlow(child));
                } else {
                    this.flattenControlFlow(node[key]);
                }
            }
        }
    }
    
    flattenIf(node) {
        // Add opaque predicates
        node.obfuscated = true;
        node.opaqueCondition = this.generateOpaquePredicate();
    }
    
    flattenWhile(node) {
        node.obfuscated = true;
        node.controlVar = this.randomVar();
    }
    
    generateOpaquePredicate() {
        const predicates = [
            '(1 + 1 == 2)',
            '(type("") == "string")',
            '(#{} == 0)',
            '(true or false)',
            '(not false)',
        ];
        return predicates[Math.floor(Math.random() * predicates.length)];
    }
    
    randomVar() {
        return '__CF_' + Math.random().toString(36).substring(2, 10);
    }
}

module.exports = ControlFlow;
