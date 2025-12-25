class JunkCode {
    constructor(density = 3) {
        this.density = density;
    }
    
    transform(ast) {
        this.injectJunk(ast);
        return ast;
    }
    
    injectJunk(node) {
        if (!node || !node.body || !Array.isArray(node.body)) return;
        
        const junkStatements = [];
        for (let i = 0; i < this.density; i++) {
            junkStatements.push(this.generateJunkStatement());
        }
        
        // Insert junk at random positions
        junkStatements.forEach(junk => {
            const pos = Math.floor(Math.random() * (node.body.length + 1));
            node.body.splice(pos, 0, { type: 'Junk', code: junk });
        });
        
        node.body.forEach(child => this.injectJunk(child));
    }
    
    generateJunkStatement() {
        const patterns = [
            () => {
                const v = this.randomVar();
                return `local ${v} = ${Math.random() * 1000}`;
            },
            () => {
                const v1 = this.randomVar();
                const v2 = this.randomVar();
                return `local ${v1}, ${v2} = ${Math.random()}, "${this.randomString(10)}"`;
            },
            () => {
                const v = this.randomVar();
                return `local ${v} = {}; for i = 1, ${Math.floor(Math.random() * 10) + 1} do ${v}[i] = i end`;
            },
            () => {
                return `if ${Math.random() > 0.5 ? 'true' : 'false'} then end`;
            },
            () => {
                const fn = this.randomVar();
                const v = this.randomVar();
                return `local function ${fn}() local ${v} = ${Math.random()}; return ${v} end`;
            },
            () => {
                const v = this.randomVar();
                return `local ${v} = (function() return ${Math.floor(Math.random() * 100)} end)()`;
            },
        ];
        
        return patterns[Math.floor(Math.random() * patterns.length)]();
    }
    
    randomVar() {
        return '__JNK_' + Math.random().toString(36).substring(2, 10);
    }
    
    randomString(length) {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
    }
}

module.exports = JunkCode;
