# RePrompt - Professional Prompt Engineering at One Click

<div align="center">

![RePrompt Logo](resources/icons/icon.png)

**Transform rough thoughts into professional prompts instantly**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Windows](https://img.shields.io/badge/Platform-Windows-blue.svg)](https://www.microsoft.com/windows)
[![Electron](https://img.shields.io/badge/Electron-28.0.0-47848F.svg)](https://www.electronjs.org/)

[Download](https://reprompt-one.vercel.app/opensource) • [Website](https://reprompt-one.vercel.app) • [Report Bug](https://github.com/786aawej-cmd/RePrompt-open-source-/issues)

</div>

---

## 🚀 What is RePrompt?

RePrompt is a **silent, background Windows application** that transforms your rough text into professional, optimized prompts using enterprise-grade AI frameworks. It runs invisibly in your system tray and activates with simple keyboard shortcuts—no UI interruptions, no context switching.

**One shortcut. Instant optimization. Any application.**

## ✨ Key Features

### 🎯 5 Specialized AI Agents (Fully Editable)

| Agent | Shortcut | Purpose |
|-------|----------|---------|
| 💻 **Coding** | `Alt+Shift+C` | Technical prompts with enterprise frameworks |
| ✍️ **Writing** | `Alt+Shift+W` | Content creation and storytelling |
| 🎯 **General** | `Alt+Shift+G` | Universal prompt optimization |
| ✏️ **Grammar** | `Alt+P+G` | Grammar & spelling fixes only |
| ⚡ **Simple Optimizer** | `Alt+P+S` | Basic Role-Task-Context optimization |

*Note: All built-in agents and shortcuts can be edited and customized directly in the Settings menu.*

### 🔥 Core Capabilities

- **🚫 Zero Interface**: Runs completely in the background
- **⚡ Ultra-Low Latency**: Optimizations powered by Anthropic's Claude 3.5 Sonnet
- **🔌 Bring-Your-Own-Key**: Securely enter your own Anthropic API key
- **🔐 Privacy First**: Your API key stays local, never transmitted
- **🪟 Auto-Start**: Launches automatically on Windows boot
- **🎨 System Tray**: Minimal, always-accessible control

## 📥 Installation

### Quick Install

1. **Download** the latest installer from our [Open Source Page](https://reprompt-one.vercel.app/opensource)
2. **Run** the installer
3. **Launch** RePrompt from the Start Menu or Desktop
4. **Configure** your Anthropic API key in the settings menu
5. **Start optimizing** with keyboard shortcuts!

### Requirements

- **OS**: Windows 10/11 (64-bit)
- **API Key**: Anthropic API key ([Get one here](https://console.anthropic.com))
- **Storage**: ~100 MB

## 🎮 How to Use

### Basic Workflow

1. **Select text** in any application (browser, editor, chat, etc.)
2. **Press a shortcut** (e.g., `Alt+P+G` for grammar fixes)
3. **Text is automatically replaced** with the optimized version

### Example: Grammar Agent

**Before** (press `Alt+P+G`):
```
i dont no how to fix this their are to many bugs
```

**After**:
```
I don't know how to fix this. There are too many bugs.
```

### Example: Simple Optimizer

**Before** (press `Alt+P+S`):
```
make a login form
```

**After**:
```
ROLE: You are a frontend developer experienced in modern web development.

TASK: Create a reusable login component with proper styling and accessibility.

CONTEXT: The component should work in a React application, support email/password authentication, handle validation errors, and be keyboard accessible.
```

## 🛠️ Technology Stack

- **Framework**: Electron 28
- **Language**: TypeScript
- **AI Backend**: Anthropic SDK (`@anthropic-ai/sdk`)
- **Storage**: electron-store
- **Build**: electron-builder

## 🏗️ Architecture

### Project Structure

```
RePrompt/
├── src/
│   ├── main/              # Main process (Node.js)
│   │   ├── main.ts        # App entry point
│   │   ├── agentManager.ts # AI agent definitions & loading
│   │   ├── shortcutManager.ts # Global keyboard shortcuts
│   │   ├── claudeClient.ts # Anthropic API integration
│   │   └── ...
│   ├── renderer/          # Renderer process (UI)
│   │   ├── index.html     # Settings & BYOK window
│   │   ├── settings.ts    # Settings logic
│   │   └── styles.css     # UI styling (Brutalist + MD3 Premium)
│   └── preload/           # Preload scripts
│       └── preload.ts     # IPC bridge
├── resources/             # App resources
│   └── icons/             # App icons
├── dist/                  # Compiled output
├── release/               # Built installers
└── package.json           # Dependencies
```

### Key Components

#### 1. Agent Manager (`agentManager.ts`)
Manages all AI agents (including editable built-in ones) with enterprise-grade prompt engineering frameworks:
- COSTAR (Context, Objective, Style, Tone, Audience, Response)
- AUTOMAT (Audience, User Persona, Targeted Action, Output, Mode, Atypical Cases, Topic)

#### 2. Shortcut Manager (`shortcutManager.ts`)
Handles global keyboard shortcuts and orchestrates the optimization workflow:
1. Capture selected text (Ctrl+C)
2. Send to Anthropic Claude via prompt engineering payload
3. Replace with optimized text (Ctrl+V)

#### 3. Claude Client (`claudeClient.ts`)
Manages the Anthropic SDK communication (hitting the `claude-3-5-sonnet-20240620` model natively).

## 🔧 Development

### Setup

```bash
# Clone the repository
git clone https://github.com/786aawej-cmd/RePrompt-open-source-.git
cd RePrompt-open-source-

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Package installer (Windows)
npm run package
```

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Compile TypeScript
- `npm run package` - Build Windows `.exe` installer
- `npm start` - Run the compiled app

## 🎨 Design Philosophy

RePrompt follows a **"Luxury Minimal + Industrial Utilitarian"** (MD3 Premium) aesthetic from its SaaS equivalent:

- **Dark Theme**: `#121212` background with muted premium hues
- **Accent Color**: Neon Green (`#8CFC42`) for interactive elements
- **Icons**: Lucide React premium SVGs
- **Typography**: System fonts perfectly padded for clarity
- **Minimal UI**: Settings window only when configuring Agents or BYOK

## 🔐 Privacy & Security

- **Local Storage**: Anthropic API keys and editable agents are securely stored locally using `electron-store`
- **No Telemetry**: Zero tracking or analytics in the app
- **Open Source**: Full transparency of code
- **User Control**: Complete control over API usage and data generation

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Aawej Pathan** - 16-year-old builder

- Portfolio: [aawejpathan.vercel.app](https://aawejpathan.vercel.app)
- Twitter: [@AawejPathan786](https://x.com/AawejPathan786)
- GitHub: [@786aawej-cmd](https://github.com/786aawej-cmd)

## 🙏 Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- Powered by [Anthropic Claude](https://anthropic.com/)
- Inspired by the need for instant, professional prompt engineering

---

<div align="center">

**Made with ❤️ by a 16-year-old builder**

[⭐ Star this repo](https://github.com/786aawej-cmd/RePrompt-open-source-) if you find it useful!

</div>
