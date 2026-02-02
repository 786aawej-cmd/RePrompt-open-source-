# RePrompt

Global AI Text Optimizer - A Windows desktop application that runs in the background and uses a global shortcut to capture, optimize, and replace text using Groq API with Llama 3.3 70B.

## Features

- **Global Shortcut**: Press `Ctrl+Shift+O` anywhere to optimize selected text
- **System Tray**: Runs silently in the background
- **Groq API Integration**: Uses Llama 3.3 70B for text optimization
- **Notion Dark Mode UI**: Beautiful, minimal settings interface

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run in development mode:
   ```bash
   npm run dev
   ```

## Usage

1. Start RePrompt - it will appear in your system tray
2. Right-click the tray icon → Open Settings
3. Enter your Groq API key (get one at https://console.groq.com/keys)
4. Save the API key
5. Now you can use `Ctrl+Shift+O` in any application to optimize text!

## Building

Build for Windows:
```bash
npm run package
```

The installer will be created in the `release/` folder.

## Tech Stack

- **Electron** - Desktop application framework
- **TypeScript** - Type-safe JavaScript
- **nut.js** - Keyboard automation
- **Groq SDK** - AI text optimization
- **electron-store** - Secure settings storage

## License

MIT
