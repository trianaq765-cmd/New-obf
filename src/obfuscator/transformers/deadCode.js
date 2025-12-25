class DeadCode {
    transform(ast) {
        this.injectDeadCode(ast);
        return ast;
    }
    
    injectDeadCode(node) {
        if (!node || !node.body || !Array.isArray(node.body)) return;
        
        const deadFunctions = [];
        for (let i = 0; i < 3; i++) {
            deadFunctions.push(this.generateDeadFunction());
        }
        
        deadFunctions.forEach(func => {
            const pos = Math.floor(Math.random() * (node.body.length + 1));
            node.body.splice(pos, 0, { type: 'DeadCode', code: func });
        });
        
        node.body.forEach(child => this.injectDeadCode(child));
    }
    
    generateDeadFunction() {
        const fnName = this.randomVar();
        const params = [];
        const paramCount = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < paramCount; i++) {
            params.push(this.randomVar());
        }
        
        const operations = [
            `return ${params[0]} + ${Math.random() * 10}`,
            `for i = 1, 100 do ${params[0]} = ${params[0]} * 2 end; return ${params[0]}`,
            `if ${params[0]} > 0 then return ${params[0]} else return 0 end`,
            `local result = {}; for i = 1, ${params[0]} do result[i] = i end; return result`,
        ];
        
        const operation = operations[Math.floor(Math.random() * operations.length)];
        
        return `
local function ${fnName}(${params.join(', ')})
    local ${this.randomVar()} = ${Math.random() * 100}
    ${operation}
end`;
    }
    
    randomVar() {
        return '__DEAD_' + Math.random().toString(36).substring(2, 10);
    }
}

module.exports = DeadCode;
