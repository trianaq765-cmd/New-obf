const luaparse = require('luaparse');

class Compiler {
    constructor() {
        this.instructions = [];
        this.constants = [];
        this.strings = [];
        this.functions = [];
        this.pc = 0;
    }
    
    compile(ast) {
        this.instructions = [];
        this.constants = [];
        this.pc = 0;
        
        this.compileNode(ast);
        
        return {
            instructions: this.instructions,
            constants: this.constants,
            strings: this.strings,
            functions: this.functions
        };
    }
    
    compileNode(node) {
        if (!node) return;
        
        switch (node.type) {
            case 'Chunk':
                this.compileChunk(node);
                break;
            case 'FunctionDeclaration':
                this.compileFunction(node);
                break;
            case 'LocalStatement':
            case 'AssignmentStatement':
                this.compileAssignment(node);
                break;
            case 'CallStatement':
                this.compileCall(node);
                break;
            case 'IfStatement':
                this.compileIf(node);
                break;
            case 'WhileStatement':
                this.compileWhile(node);
                break;
            case 'ForNumericStatement':
                this.compileForNumeric(node);
                break;
            case 'ReturnStatement':
                this.compileReturn(node);
                break;
            default:
                // Handle other node types
                break;
        }
    }
    
    compileChunk(node) {
        if (node.body) {
            node.body.forEach(statement => this.compileNode(statement));
        }
    }
    
    compileFunction(node) {
        const funcIndex = this.functions.length;
        this.functions.push({
            parameters: node.parameters,
            body: node.body
        });
        this.emit('CLOSURE', funcIndex);
    }
    
    compileAssignment(node) {
        // Simplified assignment compilation
        if (node.init) {
            node.init.forEach((init, i) => {
                this.compileExpression(init);
                this.emit('SETLOCAL', i);
            });
        }
    }
    
    compileCall(node) {
        this.compileExpression(node.expression);
        this.emit('CALL', node.arguments.length, 0);
    }
    
    compileIf(node) {
        this.compileExpression(node.clauses[0].condition);
        const jumpToElse = this.emit('JMPNOT', 0);
        this.compileNode(node.clauses[0]);
        this.patch(jumpToElse, this.pc);
    }
    
    compileWhile(node) {
        const loopStart = this.pc;
        this.compileExpression(node.condition);
        const jumpToEnd = this.emit('JMPNOT', 0);
        this.compileNode(node.body);
        this.emit('JMP', loopStart - this.pc);
        this.patch(jumpToEnd, this.pc);
    }
    
    compileForNumeric(node) {
        this.compileExpression(node.start);
        this.compileExpression(node.end);
        if (node.step) this.compileExpression(node.step);
        const loopStart = this.pc;
        this.emit('FORLOOP', 0);
        this.compileNode(node.body);
        this.emit('JMP', loopStart - this.pc);
    }
    
    compileReturn(node) {
        if (node.arguments) {
            node.arguments.forEach(arg => this.compileExpression(arg));
            this.emit('RETURN', node.arguments.length);
        } else {
            this.emit('RETURN', 0);
        }
    }
    
    compileExpression(node) {
        if (!node) return;
        
        switch (node.type) {
            case 'NumericLiteral':
                const numIndex = this.addConstant(node.value);
                this.emit('LOADK', numIndex);
                break;
            case 'StringLiteral':
                const strIndex = this.addString(node.value);
                this.emit('LOADK', strIndex);
                break;
            case 'BooleanLiteral':
                this.emit('LOADBOOL', node.value ? 1 : 0);
                break;
            case 'NilLiteral':
                this.emit('LOADNIL');
                break;
            case 'Identifier':
                this.emit('GETLOCAL', node.name);
                break;
            case 'BinaryExpression':
                this.compileBinaryOp(node);
                break;
            case 'UnaryExpression':
                this.compileUnaryOp(node);
                break;
            case 'TableConstructorExpression':
                this.emit('NEWTABLE');
                break;
            default:
                break;
        }
    }
    
    compileBinaryOp(node) {
        this.compileExpression(node.left);
        this.compileExpression(node.right);
        
        const opMap = {
            '+': 'ADD', '-': 'SUB', '*': 'MUL', '/': 'DIV',
            '%': 'MOD', '^': 'POW', '..': 'CONCAT',
            '==': 'EQ', '~=': 'NEQ', '<': 'LT', '<=': 'LE',
            '>': 'GT', '>=': 'GE', 'and': 'AND', 'or': 'OR'
        };
        
        this.emit(opMap[node.operator] || 'ADD');
    }
    
    compileUnaryOp(node) {
        this.compileExpression(node.argument);
        
        const opMap = {
            'not': 'NOT',
            '-': 'UNM',
            '#': 'LEN'
        };
        
        this.emit(opMap[node.operator] || 'NOT');
    }
    
    emit(opcode, ...args) {
        const instruction = {
            op: opcode,
            args: args,
            pc: this.pc
        };
        this.instructions.push(instruction);
        return this.pc++;
    }
    
    patch(pc, target) {
        if (this.instructions[pc]) {
            this.instructions[pc].args[0] = target;
        }
    }
    
    addConstant(value) {
        this.constants.push(value);
        return this.constants.length - 1;
    }
    
    addString(value) {
        this.strings.push(value);
        return this.strings.length - 1;
    }
    
    generateCode(ast) {
        // Generate Lua code from AST
        return this.astToCode(ast);
    }
    
    astToCode(node, indent = '') {
        if (!node) return '';
        
        // Simplified code generation
        let code = '';
        
        if (node.type === 'Chunk') {
            code = node.body.map(stmt => this.astToCode(stmt, indent)).join('\n');
        }
        
        return code;
    }
}

module.exports = Compiler;
