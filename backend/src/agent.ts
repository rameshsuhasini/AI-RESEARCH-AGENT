import Anthropic from "@anthropic-ai/sdk";
import * as dotenv from "dotenv";
dotenv.config();
import { tavily } from "@tavily/core";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const tavilyClient = tavily({
  apiKey: process.env.TAVILY_API_KEY || "",
});

const tools: Anthropic.Tool[] = [
  {
    name: "search_web",
    description: "Search for information on a topic. Use multiple times for different angles.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "The search query" },
      },
      required: ["query"],
    },
  },
  {
    name: "analyze_content",
    description: "Analyze and extract key insights from collected information.",
    input_schema: {
      type: "object" as const,
      properties: {
        content: { type: "string", description: "The content to analyze" },
        focus: { type: "string", description: "What to focus the analysis on" },
      },
      required: ["content", "focus"],
    },
  },
  {
    name: "draft_report",
    description: "Draft a final structured report from all research findings.",
    input_schema: {
      type: "object" as const,
      properties: {
        title: { type: "string", description: "Report title" },
        findings: { type: "string", description: "Main research findings" },
        conclusions: { type: "string", description: "Final conclusions and recommendations" },
      },
      required: ["title", "findings", "conclusions"],
    },
  },
];

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function searchWithRetry(query: string): Promise<string> {
  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await tavilyClient.search(query, {
        searchDepth: "basic",
        maxResults: 5,
      });

      clearTimeout(timeout);

      const results = response.results
        .map((r: { title: string; content: string; url: string }) =>
          `Title: ${r.title}\nContent: ${r.content}\nSource: ${r.url}`
        )
        .join("\n\n");

      return results || "No results found.";
    } catch (error) {
      const isLastAttempt = attempt === RETRY_ATTEMPTS;
      if (isLastAttempt) {
        console.error(`Search failed after ${RETRY_ATTEMPTS} attempts:`, error);
        return `Search temporarily unavailable for "${query}". Continue with available information.`;
      }
      console.log(`Search attempt ${attempt} failed, retrying in ${RETRY_DELAY_MS}ms...`);
      await sleep(RETRY_DELAY_MS);
    }
  }
  return "Search unavailable. Continue with available information.";
}

async function executeTool(
  name: string,
  input: Record<string, string>
): Promise<string> {
  switch (name) {
    case "search_web":
      return await searchWithRetry(input["query"]);
    case "analyze_content":
      return `Analysis complete focusing on "${input["focus"]}": Key themes identified with supporting evidence from search results.`;
    case "draft_report":
      return `Report "${input["title"]}" drafted with findings and conclusions structured clearly.`;
    default:
      return "Tool executed successfully.";
  }
}

export async function runResearchAgent(
  topic: string,
  onStep: (step: AgentStep) => void
): Promise<void> {
  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Today's date is ${new Date().toDateString()}. Research this topic thoroughly: "${topic}". Use search_web at least 4 times, then analyze_content, then draft_report.`,
    },
  ];

  const sources: string[] = [];
  const searchQueries: string[] = [];
  let continueLoop = true;

  while (continueLoop) {
    let response: Anthropic.Message;

    try {
      response = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4096,
        tools,
        system: `You are a thorough research agent. Search multiple times from different angles, analyze findings, then draft a report.`,
        messages,
      });
    } catch (error) {
      onStep({ type: "error", content: "Failed to connect to Claude. Please try again." });
      return;
    }

    messages.push({ role: "assistant", content: response.content });

    for (const block of response.content) {
      if (block.type === "text" && block.text.trim()) {
        onStep({ type: "thinking", content: block.text });
      }

      if (block.type === "tool_use") {
        const input = block.input as Record<string, string>;

        // Track search queries
        if (block.name === "search_web" && input["query"]) {
          searchQueries.push(input["query"]);
        }

        // ✅ Intercept draft_report and build report directly from tool input
        if (block.name === "draft_report") {
          const findings = input["findings"]
            ? input["findings"]
                .split(/\n|[-–•]/)
                .map((f) => f.replace(/\*\*/g, "").trim())
                .filter((f) => f.length > 10)
                .slice(0, 5)
            : searchQueries.slice(0, 5).map((q) => `Researched: ${q}`);

          onStep({
            type: "report",
            report: {
              title: input["title"] || `Research Report: ${topic}`,
              summary: input["conclusions"]
                ? input["conclusions"]
                    .replace(/\*\*/g, "")
                    .replace(/#+/g, "")
                    .trim()
                    .slice(0, 400)
                : `Research completed on: ${topic}`,
              findings,
              sources: sources.slice(0, 8),
            },
          });
        }

        onStep({ type: "tool_call", toolName: block.name, input });

        let result: string;
        try {
          result = await executeTool(block.name, input);
        } catch (error) {
          result = "Tool execution failed. Continuing with available data.";
          onStep({ type: "error", content: `Tool ${block.name} failed — continuing.` });
        }

        // Collect sources
        const urlMatches = result.match(/Source:\s*(https?:\/\/[^\s]+)/g);
        if (urlMatches) {
          urlMatches.forEach((u) => sources.push(u.replace("Source: ", "")));
        }

        onStep({ type: "tool_result", toolName: block.name, content: result });

        messages.push({
          role: "user",
          content: [{ type: "tool_result", tool_use_id: block.id, content: result }],
        });
      }
    }

    if (response.stop_reason !== "tool_use") {
      continueLoop = false;
      onStep({ type: "done", content: "Research complete." });
    }
  }
}

export interface AgentStep {
  type: "thinking" | "tool_call" | "tool_result" | "report" | "done" | "error";
  content?: string;
  toolName?: string;
  input?: Record<string, string>;
  report?: {
    title: string;
    summary: string;
    findings: string[];
    sources: string[];
  };
}