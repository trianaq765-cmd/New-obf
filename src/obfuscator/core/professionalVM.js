class ProfessionalVM {
    constructor() {
        this.compressionEnabled = true;
    }
    
    wrap(code, options) {
        const processed = this.preprocessCode(code);
        const vm = this.generateProfessionalVM(processed, options);
        return vm;
    }
    
    preprocessCode(code) {
        const strings = [];
        const stringMap = new Map();
        let sid = 0;
        
        const withStrings = code.replace(/(['"`])(?:(?=(\\?))\2.)*?\1/g, (m) => {
            const content = m.slice(1, -1);
            if (content.length > 2) {
                if (!stringMap.has(content)) {
                    strings.push(content);
                    stringMap.set(content, sid++);
                }
                return `__S${stringMap.get(content)}__`;
            }
            return m;
        });
        
        const numbers = [];
        const numberMap = new Map();
        let nid = 0;
        
        const withNumbers = withStrings.replace(/\b(\d+\.?\d*)\b/g, (m) => {
            const n = parseFloat(m);
            if (Math.abs(n) > 100) {
                if (!numberMap.has(n)) {
                    numbers.push(n);
                    numberMap.set(n, nid++);
                }
                return `__N${numberMap.get(n)}__`;
            }
            return m;
        });
        
        return { code: withNumbers, strings, numbers };
    }
    
    generateProfessionalVM(processed, options) {
        const { code, strings, numbers } = processed;
        const encrypted = this.encrypt(code);
        const v = this.genVars(25);
        
        let vm = `(function()`;
        
        // String pool
        if (strings.length > 0) {
            vm += `local ${v[0]}={`;
            vm += strings.map(s => this.encStr(s)).join(',');
            vm += `};`;
        }
        
        // Number pool
        if (numbers.length > 0) {
            vm += `local ${v[1]}={${numbers.join(',')}};`;
        }
        
        // Decryptor
        vm += `local function ${v[2]}(${v[3]},${v[4]})`;
        vm += `local ${v[5]}={};`;
        vm += `for ${v[6]}=1,#${v[3]} do `;
        vm += `${v[5]}[${v[6]}]=string.char(bit32.bxor(${v[3]}[${v[6]}],${v[4]}[(${v[6]}-1)%#${v[4]}+1],(${v[6]}*7)%256));`;
        vm += `end;`;
        vm += `return table.concat(${v[5]})`;
        vm += `end;`;
        
        // Data
        vm += `local ${v[7]}={${encrypted.data.join(',')}};`;
        vm += `local ${v[8]}={${encrypted.key.join(',')}};`;
        vm += `local ${v[9]}=${v[2]}(${v[7]},${v[8]});`;
        
        // String restore
        if (strings.length > 0) {
            vm += `${v[9]}=${v[9]}:gsub("__S(%d+)__",function(${v[10]})`;
            vm += `local ${v[11]}=${v[0]}[tonumber(${v[10]})+1];`;
            vm += `local ${v[12]}={};`;
            vm += `for ${v[13]}=1,#${v[11]} do `;
            vm += `${v[12]}[${v[13]}]=string.char(bit32.bxor(${v[11]}[${v[13]}],${v[11]}[#${v[11]}]));`;
            vm += `end;`;
            vm += `return table.concat(${v[12]})`;
            vm += `end);`;
        }
        
        // Number restore
        if (numbers.length > 0) {
            vm += `${v[9]}=${v[9]}:gsub("__N(%d+)__",function(${v[14]})return tostring(${v[1]}[tonumber(${v[14]})+1])end);`;
        }
        
        // Execute
        vm += `return(loadstring or load)(${v[9]})`;
        vm += `end)()()`;
        
        return vm;
    }
    
    encrypt(code) {
        const key = this.genKey(16);
        const data = [];
        for (let i = 0; i < code.length; i++) {
            data.push(code.charCodeAt(i) ^ key[i % key.length] ^ ((i * 7) % 256));
        }
        return { data, key };
    }
    
    encStr(str) {
        const k = Math.floor(Math.random() * 200) + 50;
        const e = [];
        for (let i = 0; i < str.length; i++) {
            e.push(str.charCodeAt(i) ^ k);
        }
        e.push(k);
        return `{${e.join(',')}}`;
    }
    
    genVars(n) {
        const v = [];
        const c = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < n; i++) {
            let name = '_';
            for (let j = 0; j < 4; j++) {
                name += c[Math.floor(Math.random() * c.length)];
            }
            v.push(name);
        }
        return v;
    }
    
    genKey(len) {
        const k = [];
        for (let i = 0; i < len; i++) {
            k.push(Math.floor(Math.random() * 256));
        }
        return k;
    }
}

module.exports = ProfessionalVM;
