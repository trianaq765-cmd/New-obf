const Obfuscator = require('./src/obfuscator');

async function test() {
    console.log('Testing obfuscator with various Lua code...\n');
    
    // Test 1: Simple code
    console.log('Test 1: Simple Lua code');
    try {
        const obf1 = new Obfuscator({ preset: 'medium' });
        const result1 = await obf1.obfuscate(`
            local x = 10
            print("Hello: " .. x)
        `);
        console.log('✅ Success\n');
    } catch (e) {
        console.log('❌ Failed:', e.message, '\n');
    }
    
    // Test 2: Complex code
    console.log('Test 2: Complex Lua code');
    try {
        const obf2 = new Obfuscator({ preset: 'medium' });
        const result2 = await obf2.obfuscate(`
            local function test(a, b)
                if a > b then
                    return a
                else
                    return b
                end
            end
            
            for i = 1, 10 do
                print(test(i, 5))
            end
        `);
        console.log('✅ Success\n');
    } catch (e) {
        console.log('❌ Failed:', e.message, '\n');
    }
    
    // Test 3: Already obfuscated code (should use raw mode)
    console.log('Test 3: Already obfuscated code');
    try {
        const obf3 = new Obfuscator({ preset: 'low' });
        const result3 = await obf3.obfuscate(`
            local _0x123abc = "test"
            (function() print(_0x123abc) end)()
        `);
        console.log('✅ Success\n');
    } catch (e) {
        console.log('❌ Failed:', e.message, '\n');
    }
    
    // Test 4: Code with syntax that might confuse parser
    console.log('Test 4: Tricky syntax');
    try {
        const obf4 = new Obfuscator({ preset: 'medium' });
        const result4 = await obf4.obfuscate(`
            loadstring([[print("Hello World")]])()
        `);
        console.log('✅ Success\n');
    } catch (e) {
        console.log('❌ Failed:', e.message, '\n');
    }
}

test().then(() => {
    console.log('All tests completed!');
}).catch(err => {
    console.error('Test suite failed:', err);
});
