document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('obfuscateForm');
    const fileMethod = document.getElementById('fileMethod');
    const textMethod = document.getElementById('textMethod');
    const fileInput = document.getElementById('fileInput');
    const textInput = document.getElementById('textInput');
    const progress = document.getElementById('progress');
    const result = document.getElementById('result');
    const error = document.getElementById('error');
    
    let obfuscatedCode = '';
    
    // Toggle input method
    fileMethod.addEventListener('change', function() {
        fileInput.style.display = 'block';
        textInput.style.display = 'none';
    });
    
    textMethod.addEventListener('change', function() {
        fileInput.style.display = 'none';
        textInput.style.display = 'block';
    });
    
    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Hide previous results
        result.style.display = 'none';
        error.style.display = 'none';
        progress.style.display = 'block';
        
        try {
            let code;
            
            // Get code from file or textarea
            if (fileMethod.checked) {
                const file = document.getElementById('luaFile').files[0];
                if (!file) {
                    throw new Error('Please select a file');
                }
                code = await file.text();
            } else {
                code = document.getElementById('luaCode').value;
                if (!code.trim()) {
                    throw new Error('Please enter some code');
                }
            }
            
            // Get options
            const options = {
                code: code,
                preset: document.getElementById('preset').value,
                vm: document.getElementById('vmEnabled').checked,
                antiDebug: document.getElementById('antiDebug').checked,
                antiTamper: document.getElementById('antiTamper').checked,
                antiDump: document.getElementById('antiDump').checked,
                stringEncryption: document.getElementById('stringEncryption').checked,
                controlFlow: document.getElementById('controlFlow').checked,
            };
            
            // Send request
            const response = await fetch('/api/v1/obfuscate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(options)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Obfuscation failed');
            }
            
            const data = await response.json();
            obfuscatedCode = data.code;
            
            // Show results
            progress.style.display = 'none';
            result.style.display = 'block';
            
            // Display statistics
            const stats = data.statistics;
            document.getElementById('stats').innerHTML = `
                <div class="row text-center">
                    <div class="col-md-3">
                        <strong>Original Size</strong><br>
                        <span class="badge bg-secondary">${formatBytes(stats.originalSize)}</span>
                    </div>
                    <div class="col-md-3">
                        <strong>Obfuscated Size</strong><br>
                        <span class="badge bg-primary">${formatBytes(stats.obfuscatedSize)}</span>
                    </div>
                    <div class="col-md-3">
                        <strong>Ratio</strong><br>
                        <span class="badge bg-info">${stats.compressionRatio}</span>
                    </div>
                    <div class="col-md-3">
                        <strong>Time</strong><br>
                        <span class="badge bg-success">${stats.duration}</span>
                    </div>
                </div>
            `;
            
        } catch (err) {
            progress.style.display = 'none';
            error.style.display = 'block';
            document.getElementById('errorMessage').textContent = err.message;
        }
    });
    
    // Download button
    document.getElementById('downloadBtn').addEventListener('click', function() {
        const blob = new Blob([obfuscatedCode], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'obfuscated.lua';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    });
    
    // Copy button
    document.getElementById('copyBtn').addEventListener('click', function() {
        navigator.clipboard.writeText(obfuscatedCode).then(function() {
            const btn = document.getElementById('copyBtn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            btn.classList.remove('btn-outline-secondary');
            btn.classList.add('btn-success');
            
            setTimeout(function() {
                btn.innerHTML = originalText;
                btn.classList.remove('btn-success');
                btn.classList.add('btn-outline-secondary');
            }, 2000);
        });
    });
    
    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
});
