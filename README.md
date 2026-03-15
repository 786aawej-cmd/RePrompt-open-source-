# RePrompt Open Source 🚀

**The Ultimate Desktop Workflow for Enterprise-Grade Prompt Engineering.**

RePrompt is a powerful, open-source desktop application designed to transform rough user intents into highly optimized, production-ready prompts using world-class frameworks. Built with Electron and powered by Claude (Anthropic), RePrompt lives in your system tray and is always a shortcut away.

---

## ✨ Key Features

### 🏢 Enterprise-Grade Meta-Prompting
RePrompt doesn't just "talk" to AI—it engineers the conversation. Every input is processed through sophisticated meta-prompting frameworks:
- **COSTAR**: Context, Objective, Style, Tone, Audience, Response.
- **ReAct**: Reasoning + Acting for multi-step tasks.
- **AUTOMAT**: High-compliance boundary control.
- **Chain-of-Thought (CoT)**: Step-by-step logical reasoning.
- **Agile Prompting**: Iterative, metrics-driven refinement.

### 🤖 Intelligent Agents
- **🏗️ The Architect (Alt+Shift+L)**: For starting new tasks. Builds massive, detailed instructions.
- **✨ The Refiner (Alt+Shift+O)**: For in-place chat polish. Sharpens and clarifies existing messages.
- **🛠️ Custom Agents**: Build and save your own specialized agents with unique system prompts and shortcuts.

### ⌨️ Seamless Workflow Integration
- **Global Shortcuts**: Trigger RePrompt anywhere in your OS (Browser, IDE, Slack, etc.).
- **Auto-Capture & Paste**: RePrompt captures your selected text, optimizes it in the background, and pastes the result back instantly.
- **Tray Operation**: Lives quietly in the tray, ready when you need it.

### 🔍 Clarification Loop
Vague prompts? RePrompt will stop and ask for more context before generating the final prompt, ensuring the highest possible quality.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (LTS recommended)
- [Anthropic API Key](https://console.anthropic.com/)

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/786aawej-cmd/RePrompt-open-source-.git
   cd RePrompt-open-source-
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the app:**
   ```bash
   npm start
   ```

4. **Setup:**
   Once the app launches, click the tray icon or look for the settings window to enter your Anthropic API key.

---

## 🛠️ Development

- **Language**: TypeScript
- **Framework**: Electron + Vite
- **AI Integration**: Anthropic SDK (Claude 3.5 Sonnet recommended)

### Build for Production
```bash
npm run package
```

---

## 📜 License

RePrompt is open-source. See the repository for details.

---

© 2026 [786aawej-cmd](https://github.com/786aawej-cmd). All rights reserved.
