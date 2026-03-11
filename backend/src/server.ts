import express from "express";
import cors from "cors";
import { runResearchAgent, AgentStep } from "./agent";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/research", async (req, res) => {
  const topic = req.query.topic as string;
  
  if (!topic) {
    res.status(400).json({ error: "Topic is required" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    await runResearchAgent(topic, (step: AgentStep) => {
      res.write(`data: ${JSON.stringify(step)}\n\n`);
    });

    res.end();
    
  } catch (error) {
    res.write(`data: ${JSON.stringify({ 
      type: "done", 
      content: "Something went wrong. Please try again." 
    })}\n\n`);
    res.end();
  }
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});