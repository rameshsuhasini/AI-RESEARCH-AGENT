# 🤖 AI Research Agent

An autonomous AI agent that researches any topic by breaking it into multiple search queries, analyzing findings, and producing a structured report — all in real time.

Built with **Claude API (Anthropic)**, **Node.js/TypeScript** backend and **Angular** frontend.

---

## 🎯 What It Does

1. User enters any research topic
2. Agent autonomously decides which searches to run
3. Executes multiple tool calls in sequence
4. Streams every step live to the UI
5. Produces a structured research report

---

## 🏗 Architecture
```
frontend (Angular)          backend (Node/TypeScript)
─────────────────           ──────────────────────────
User types topic     →      Express SSE endpoint
EventSource stream   ←      Agent loop runs
Steps render live    ←      Claude API + Tool Use
```

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| AI | Anthropic Claude API (claude-haiku-4-5) |
| Agent Pattern | Agentic loop + Tool Use |
| Streaming | Server-Sent Events (SSE) |
| Backend | Node.js + TypeScript + Express |
| Frontend | Angular 17 (standalone components) |
| Real-time UI | RxJS Observable + ChangeDetectorRef |

---

## 🚀 Running Locally

**Backend:**
```bash
cd backend
npm install
# Add your ANTHROPIC_API_KEY to .env
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

## 💡 Key Concepts Demonstrated

- **Agentic loop** — Claude autonomously decides which tools to call and when
- **Tool use** — structured function calling with input schema validation
- **SSE streaming** — real-time step-by-step UI updates without WebSockets
- **Clean architecture** — agent logic, server, and UI fully separated

---

## 📁 Project Structure
```
ai-research-agent/
├── backend/
│   ├── src/
│   │   ├── agent.ts      # Agentic loop + tool definitions
│   │   └── server.ts     # Express + SSE endpoint
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    └── src/
        └── app/
            ├── app.component.ts        # Main component + state
            ├── app.component.html      # Streaming UI template
            ├── app.component.css       # Premium dark theme
            └── services/
                └── research-agent.service.ts  # SSE → Observable
```

---

*Built as part of AI developer portfolio — Suhasini Ramesh · Berlin, 2026*