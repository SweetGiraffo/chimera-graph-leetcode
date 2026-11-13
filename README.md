# ChimeraGraph: LeetCode-Style Interactive Graph Intelligence & Personalized PageRank Platform

An interactive, LeetCode-style educational coding platform specifically built for your M.Tech project: **Chimera: Cross-Modal Knowledge Graph RAG with Self-Correcting Retrieval**.

Instead of slides or passive articles, you master the mathematical foundations, graph algorithms, PageRank variations, and multimodal RAG pipelines by **writing code, passing automated test cases, analyzing real-time tracebacks, and visualizing probability flows**.

---

## Architecture Overview

```
chimera-graph-leetcode/
├── backend/
│   ├── main.py              # FastAPI server (port 8000)
│   ├── runner.py            # Real Python isolated subprocess runner + memory/timing profiler
│   ├── evaluator.py         # Deep equality & float tolerance comparison engine
│   ├── database.py          # SQLite database (chimera_progress.db) for progress, streak, submissions
│   └── visualizer_calc.py   # PageRank, Markov, RRF live mathematical calculation endpoints
├── src/
│   ├── components/
│   │   ├── layout/          # Header, Sidebar with roadmaps & filters
│   │   ├── problem/         # KaTeX Problem Description, Chimera Context badge, Hints, Editorial
│   │   ├── editor/          # Monaco Code Editor, TestConsole (visible, custom, hidden tests)
│   │   ├── visualizers/     # Interactive Graph Editor, Markov Simulator, PageRank & PPR visualizers, RRF
│   │   └── dashboard/       # Progress Dashboard, accuracy, streak, Chimera readiness score
│   ├── data/
│   │   ├── modules.ts       # Module curriculum metadata (Modules 1-10 + Chimera Lab)
│   │   └── problems/        # 87 complete challenges with starter code, references, hints & test cases
│   ├── services/            # Client execution API & LocalStorage synchronization
│   ├── types/               # TypeScript interfaces
│   ├── App.tsx              # Main IDE layout with dynamic split panes
│   └── main.tsx             # Entry point
├── start_platform.bat       # One-click Windows batch launcher
└── start_platform.ps1       # One-click PowerShell launcher
```

---

## Key Platform Features

1. **Dark-Mode LeetCode IDE Layout**:
   - **Left Collapsible Sidebar**: Full curriculum roadmap with module groupings, difficulty tags (`Easy`, `Medium`, `Hard`), completion indicators (`✓`), search bar, and filter tabs.
   - **Center Problem Panel**: Problem statement, rigorous LaTeX / KaTeX math definitions, clear input/output specifications, constraints, progressive accordion hints, time/space complexity targets, and expandable editorial solutions.
   - **Right Split Panel**: Full Monaco code editor with syntax highlighting, custom test case editor, Run Code button, Submit button, reset function, and test case tab selector.
   - **Execution Console**: Real execution results, sub-millisecond execution times, peak memory usage (`KB`), stdout console streams, and visual diffs on test failure.

2. **10 Modules + Chimera Research Lab (87 Total Problems)**:
   - **Module 1**: Weighted Graphs and Transition Matrices (8 problems)
   - **Module 2**: Markov Chains (9 problems)
   - **Module 3**: PageRank from Scratch (10 problems)
   - **Module 4**: Personalized PageRank (PPR) (10 problems)
   - **Module 5**: Graph Algorithms for Knowledge Graph Retrieval (8 problems)
   - **Module 6**: Entity Extraction & Entity Resolution (8 problems)
   - **Module 7**: Knowledge Graph Construction (8 problems)
   - **Module 8**: Hybrid Graph + Vector Retrieval (8 problems)
   - **Module 9**: Corrective RAG & LangGraph (8 problems)
   - **Module 10**: Multi-Modal Graph Retrieval (10 problems)
   - **Chimera Research Lab**: 10 Capstone Challenges (10 problems)

3. **5 Interactive Visualizers**:
   - **Graph Editor & Normalizer**: Build custom graphs visually, add nodes/edges, and generate row-stochastic transition matrices live.
   - **Markov Walk Simulator**: Step-by-step token hops across transition graphs comparing empirical visit frequencies with theoretical stationary vectors.
   - **PageRank Power Iteration**: Dynamic node radius scaling proportional to stationary probability mass and adjustable damping factor $\alpha \in (0, 1)$.
   - **PPR Propagation Visualizer**: Select custom query seed nodes, adjust restart probabilities, toggle reverse edges, and watch personalized probability diffuse across multi-hop paths.
   - **Hybrid Retrieval Comparator**: Side-by-side dense vector vs graph candidates with live Reciprocal Rank Fusion ($k_{rrf}$) slider.

4. **Dual Execution Engine (Hybrid Local + WebAssembly)**:
   - **In-Browser WebAssembly (Pyodide)**: Runs Python 3.12, NumPy, and NetworkX directly inside the user's browser sandbox via WebAssembly. Enables 100% free, zero-server deployment on **Vercel** or **GitHub Pages** with zero cloud bills.
   - **Local FastAPI Backend**: Automatic port scanner checks `127.0.0.1:8000` to `8099` to prevent port conflicts with other inference servers, profiling execution timing and peak memory (`KB`).

---

## Deployment (100% Free on Vercel)

Thanks to the in-browser Pyodide WebAssembly runner, you can deploy this entire platform to Vercel for **$0 forever** with no backend server needed:

1. Push this repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com/new).
3. Framework Preset: **Vite** (Build: `npm run build`, Output: `dist`).
4. Click **Deploy** — your interactive graph coding platform is live with free HTTPS!

---

## Quick Start Instructions

Both the backend and frontend are already running in your workspace!

To access the platform right now:
- **Web App**: Open [http://127.0.0.1:5173](http://127.0.0.1:5173) in your browser.
- **Backend API Docs**: Open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### To Launch Manually Anytime:

#### Option A: One-Click Launcher
Double click `start_platform.bat` or run:
```powershell
.\start_platform.ps1
```

#### Option B: Terminal Commands
**Terminal 1 (Backend):**
```bash
cd backend
py -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 (Frontend):**
```bash
npm run dev -- --host 127.0.0.1 --port 5173
```
