# 🔐 Advanced Lua Obfuscator - Pro Edition

Military-grade Lua obfuscation with Discord bot integration and web interface. Full Roblox executor support with custom VM, AES-256 encryption, and multi-layer protection.

## ✨ Features

### 🛡️ Security Features (Luraph-Level)
- ✅ **Custom VM Virtualization** - Real virtual machine with 30+ custom opcodes
- ✅ **AES-256 Encryption** - Military-grade encryption for instructions and constants
- ✅ **Multi-Layer Protection** - Up to 3 nested protection layers
- ✅ **Anti-Debug** - Detects and prevents debugging attempts
- ✅ **Anti-Tamper** - SHA-256 checksum verification
- ✅ **Anti-Dump** - Prevents memory dumping and decompilation
- ✅ **String Encryption** - XOR + custom cipher for all strings
- ✅ **Constant Encryption** - Polymorphic constant obfuscation
- ✅ **Control Flow Flattening** - Makes code flow impossible to follow
- ✅ **Variable Renaming** - Mangled names with collision detection
- ✅ **Junk Code Injection** - Realistic dead code insertion
- ✅ **Integrity Checking** - Runtime code verification
- ✅ **Watermarking** - Invisible ownership marking

### 🎮 Roblox Compatibility
- ✅ Works with all major executors (Synapse X, KRNL, Fluxus, etc.)
- ✅ Full `loadstring()` support
- ✅ Preserves game globals (`game`, `workspace`, `script`, etc.)
- ✅ No bytecode - pure Lua output
- ✅ Optimized for performance

### 🤖 Discord Bot
- `/obfuscate` - Obfuscate Lua files
- `/help` - Show help information
- Preset support (Low, Medium, High, Extreme)
- Direct file upload/download
- Real-time statistics

### 🌐 Web Interface
- Beautiful modern UI
- File upload or paste code
- Advanced options panel
- Download or copy results
- API documentation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (optional, for session storage)
- Discord Bot Token

### Installation

1. **Clone repository**
```bash
git clone <your-repo>
cd lua-obfuscator-bot
