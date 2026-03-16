# 🔬 ResearchAI — Autonomous AI Research Agent

An autonomous AI agent that researches any topic by breaking it into multiple 
search queries, analyzing findings, and producing a structured report — all in real time.

Built with **Claude API (Anthropic)**, **Tavily Search API**, **Node.js/TypeScript** 
backend and **Angular** frontend.

🔗 **Live Demo**: [ai-research-agent-beige.vercel.app](https://ai-research-agent-beige.vercel.app)

---

## ✨ What's New in v2

- 🔍 **Real web search** — Tavily API returns live results from the internet
- 📊 **Split layout UI** — live agent activity on the left, structured report on the right
- 🔄 **Retry logic** — automatic retries with timeout protection on failed searches
- 🛡️ **Error handling** — graceful fallbacks so the agent never crashes
- 📋 **Structured report panel** — title, summary, key findings and sources extracted cleanly

---

## 🎯 What It Does

1. User enters any research topic
2. Agent autonomously decides which searches to run
3. Executes multiple tool calls in sequence — search, analyze, draft
4. Streams every step live to the left panel
5. Structured report appears in the right panel automatically

---

## 🏗 Architecture
```
┌─────────────────────┐         ┌──────────────────────────┐
│   Angular Frontend  │         │   Node.js Backend         │
│   ─────────────     │         │   ──────────────────      │
│   Search input      │ ──────▶ │   Express SSE endpoint    │
│   Agent activity    │ ◀────── │   Agentic loop            │
│   (left panel)      │         │   Claude API + Tool Use   │
│                     │         │   Tavily real search      │
│   Research report   │ ◀────── │   draft_report intercept  │
│   (right panel)     │         │                           │
└─────────────────────┘         └──────────────────────────┘
```

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| AI Model | Anthropic Claude API (claude-haiku-4-5) |
| Agent Pattern | Agentic loop + Tool Use |
| Web Search | Tavily Search API (real-time results) |
| Streaming | Server-Sent Events (SSE) |
| Backend | Node.js + TypeScript + Express |
| Frontend | Angular 17 (standalone components) |
| Real-time UI | RxJS Observable + ChangeDetectorRef |
| Backend Deploy | Railway |
| Frontend Deploy | Vercel |

---

## 🚀 Running Locally

**Backend:**
```bash
cd backend
npm install
# Add ANTHROPIC_API_KEY and TAVILY_API_KEY to .env
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
ng serve
```

Open `http://localhost:4200`

---

## 🔑 Environment Variables
```env
ANTHROPIC_API_KEY=your_anthropic_key
TAVILY_API_KEY=your_tavily_key
```

---

## 💡 Key Concepts Demonstrated

- **Agentic loop** — Claude autonomously decides which tools to call and when to stop
- **Tool use** — structured function calling with `search_web`, `analyze_content`, `draft_report`
- **Tool interception** — `draft_report` input intercepted to populate report panel directly
- **SSE streaming** — real-time step-by-step UI updates without WebSockets
- **Retry logic** — 3 automatic retries with 1s delay + 10s timeout per search
- **Split layout** — agent activity and structured report displayed simultaneously

---

## 📁 Project Structure
```
ai-research-agent/
├── backend/
│   ├── src/
│   │   ├── agent.ts      # Agentic loop + tool definitions + retry logic
│   │   └── server.ts     # Express + SSE endpoint
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    └── src/
        └── app/
            ├── app.component.ts        # Main component + state + report extraction
            ├── app.component.html      # Split layout template
            ├── app.component.css       # Premium dark theme
            └── services/
                └── research-agent.service.ts  # SSE → Observable
```

---

## 🗺 Roadmap

- [ ] Export report as PDF
- [ ] Search history
- [ ] Compare multiple research topics
- [ ] Deeper search with more Tavily results

---

*Built by Suhasini Ramesh · Senior Frontend Engineer · Berlin, 2026*  
*[github.com/rameshsuhasini](https://github.com/rameshsuhasini) · [linkedin.com/in/suhasini-ramesh-be-mba](https://linkedin.com/in/suhasini-ramesh-be-mba)*