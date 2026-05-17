<div align="center">
<img width="1200" height="475" alt="CodeFlow Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# ⚡ CodeFlow

**AI-Powered Code Visualization & Analysis Platform**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-Powered-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

*Upload a ZIP archive → Get interactive flowcharts, auto-generated documentation, and deep code insights — all powered by Gemini AI.*

[Live Demo](https://ai.studio/apps/2d26b102-11c1-4da0-a1d1-5155b7e73f7a) · [Report Bug](https://github.com/Deb32800/Codeflow/issues) · [Request Feature](https://github.com/Deb32800/Codeflow/issues)

</div>

---

## 🎯 What is CodeFlow?

CodeFlow is an **AI-powered code analysis platform** that transforms any codebase into beautiful, interactive visualizations. Simply upload a ZIP archive of your project, and CodeFlow will:

1. **📖 Generate Documentation** — Automatically create a full documentation book with class/function breakdowns, complexity analysis, and internal logic trees.
2. **🔀 Visualize Architecture** — Synthesize a high-level logical flow diagram showing how your application actually executes — not just file dependencies.
3. **🧠 Deep Mindmap** — Explore your code as an expandable tree: File → Class → Function → Internal Logic (if/loop/return).
4. **🎓 Algorithm Lab** — Interactive step-by-step visualizations for 10+ CS algorithms (sorting, searching, graphs, backtracking) with multi-language code sync.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🤖 **AI-Powered Analysis** | Uses Google Gemini AI to deeply understand code structure, logic, and architecture |
| 📊 **3 Visualization Modes** | Report (docs), Flowchart (architecture), and Mindmap (deep tree) views |
| 🎯 **Interactive Flowcharts** | Click-to-explore nodes with expand/collapse, cinematic camera panning, and code previews |
| 💬 **AI Tutor Chat** | Click "Explain" on any code snippet to get a plain-English explanation via AI |
| 🔧 **Multi-Provider Support** | Works with Google Gemini API (default) or OpenRouter (free models) |
| 📦 **ZIP Upload** | Supports JS, TS, Python, Java, C/C++, Go, Rust, PHP, Ruby, and more |
| 🎨 **Comic-Book UI** | Playful, bold design with custom animations, comic shadows, and pastel accents |
| 🧪 **Algorithm Visualizer** | Step-by-step playback of Bubble Sort, Quick Sort, BFS, DFS, Dijkstra, N-Queens, and more |
| 🖥️ **Code Inspector** | Synchronized code view that highlights the current algorithm step in JS, Python, or C++ |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript 5.8 |
| **Build Tool** | Vite 6 |
| **Styling** | Tailwind CSS (CDN), Custom CSS |
| **Visualization** | React Flow, Dagre (graph layout), Framer Motion (animations) |
| **AI Backend** | Google Gemini AI SDK, OpenRouter REST API |
| **Utilities** | JSZip (archive extraction), Lucide (icons) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A **Gemini API Key** ([get one free](https://aistudio.google.com/apikey))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Deb32800/Codeflow.git
cd Codeflow

# 2. Install dependencies
npm install

# 3. Configure your API key
#    Edit .env.local and replace PLACEHOLDER_API_KEY with your actual key:
echo "GEMINI_API_KEY=your_api_key_here" > .env.local

# 4. Start the development server
npm run dev
```

The app will be running at **http://localhost:3000** 🎉

### Alternative: Use OpenRouter (Free, No Google Key Needed)

1. Start the app without a Gemini key
2. Click the ⚙️ Settings icon on the landing page
3. Enter your [OpenRouter API key](https://openrouter.ai/keys) (free tier available)
4. Select the free DeepSeek R1 model
5. Upload a ZIP and analyze!

---

## 📁 Project Structure

```
codeflow/
├── index.html              # HTML entry point with Tailwind config & importmap
├── index.tsx               # React DOM mount point
├── App.tsx                 # Root component — state machine & pipeline orchestration
├── types.ts                # All shared TypeScript interfaces
├── constants.ts            # App-wide constants (models, colors, layout)
├── vite.config.ts          # Vite build configuration
├── tsconfig.json           # TypeScript compiler options
├── package.json            # Dependencies and scripts
├── .env.local              # API keys (git-ignored)
├── .gitignore              # Git ignore rules
│
├── components/
│   ├── LandingPage.tsx     # Hero landing page with mode selection
│   ├── FlowchartCanvas.tsx # React Flow canvas with mode switching
│   ├── CustomNode.tsx      # Multi-mode node renderer (flowchart/mindmap/algo)
│   ├── AnimatedEdge.tsx    # Custom animated edge with dotted-line effect
│   ├── ReportView.tsx      # Auto-generated documentation book viewer
│   ├── AlgorithmVisualizer.tsx # Interactive algorithm playground
│   ├── ChatPanel.tsx       # AI tutor chat panel
│   ├── CodePanel.tsx       # Source code viewer panel
│   ├── FileTree.tsx        # Recursive file tree explorer
│   ├── FileUploader.tsx    # ZIP drag-and-drop upload zone
│   ├── ApiKeyModal.tsx     # API key configuration modal
│   ├── LoadingOverlay.tsx  # Animated loading indicator
│   └── Button.tsx          # Reusable button component
│
└── services/
    ├── geminiService.ts    # AI service layer (Gemini SDK + OpenRouter)
    ├── layoutService.ts    # Dagre graph layout engine
    ├── zipService.ts       # JSZip extraction & file tree builder
    ├── openRouterService.ts # OpenRouter model provider
    └── algorithmData.ts    # Algorithm definitions & frame generators
```

---

## 🎮 How to Use

### 📖 Project Analysis Mode

1. Click **"AI Report"** on the landing page
2. **Upload a ZIP** file of your project (drag & drop or browse)
3. Wait for the AI to analyze your code (progress shown in real-time)
4. Explore your project across three views:
   - **📄 DOCS** — Full documentation book with classes, functions, and complexity
   - **🔀 FLOW** — High-level logical execution flow diagram
   - **🧠 MINDMAP** — Expandable tree from files down to individual logic blocks

### 🧪 Algorithm Lab Mode

1. Click **"Algo Lab"** on the landing page
2. Select an algorithm from the sidebar (Sorting, Searching, Graph, Backtracking)
3. Read the "How it Works" explanation
4. Press ▶️ Play to watch the step-by-step animation
5. Toggle the **Code Inspector** to see synchronized source code highlighting

---

## 🔑 API Configuration

CodeFlow supports two AI providers:

| Provider | Setup | Cost |
|---|---|---|
| **Google Gemini** | Add key to `.env.local` | Free tier (with rate limits) |
| **OpenRouter** | Enter key in Settings modal | Free models available |

### Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Your Google Gemini API key |

> ⚠️ **Never commit your API keys.** The `.env.local` file is git-ignored by default.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Google Gemini AI](https://ai.google.dev/)
- Visualizations powered by [React Flow](https://reactflow.dev/)
- Graph layout by [Dagre](https://github.com/dagrejs/dagre)
- Icons by [Lucide](https://lucide.dev/)
- Animations by [Framer Motion](https://www.framer.com/motion/)

---

<div align="center">

**Made with ❤️ by [Deb32800](https://github.com/Deb32800)**

</div>
