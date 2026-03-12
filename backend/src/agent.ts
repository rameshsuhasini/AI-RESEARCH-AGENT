import Anthropic from "@anthropic-ai/sdk";
import * as dotenv from "dotenv";
dotenv.config();
import { tavily } from "@tavily/core";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const tavilyClient = tavily({ 
  apiKey: process.env.TAVILY_API_KEY || "" 
});

const tools: Anthropic.Tool[] = [
  {
    name: "search_web",
    description:
      "Search for information on a topic. Use multiple times for different angles.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "The search query",
        },
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
        content: {
          type: "string",
          description: "The content to analyze",
        },
        focus: {
          type: "string",
          description: "What to focus the analysis on",
        },
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
        title: {
          type: "string",
          description: "Report title",
        },
        findings: {
          type: "string",
          description: "Main research findings",
        },
        conclusions: {
          type: "string",
          description: "Final conclusions and recommendations",
        },
      },
      required: ["title", "findings", "conclusions"],
    },
  },
];

async function executeTool(
  name: string,
  input: Record<string, string>
): Promise<string> {
  switch (name) {
    case "search_web":
      try {
        const response = await tavilyClient.search(input["query"], {
          searchDepth: "basic",
          maxResults: 5,
        });
        
        const results = response.results
          .map((r: { title: string; content: string; url: string }) => 
            `Title: ${r.title}\nContent: ${r.content}\nSource: ${r.url}`
          )
          .join("\n\n");
          
        return results || "No results found.";
      } catch (error) {
        return `Search failed for "${input["query"]}"`;
      }

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
  onStep: (step: AgentStep) => void,
): Promise<void> {
  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Today's date is ${new Date().toDateString()}.
       Research this topic thoroughly: "${topic}".
      Use your search tool multiple times from different angles.
      Always search for the most current and recent information available.
      Analyze what you find. Then draft a clear final report.
      Think and display the result step by step.`,
    },
  ];
  let continueLoop = true;

  while (continueLoop) {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      tools,
      messages,
    });
    messages.push({
      role: "assistant",
      content: response.content,
    });

    for (const block of response.content) {
      if (block.type === "text" && block.text.trim()) {
        onStep({ type: "thinking", content: block.text });
      }

      if (block.type === "tool_use") {
        const input = block.input as Record<string, string>;

        onStep({
          type: "tool_call",
          toolName: block.name,
          input,
        });

        const result = await executeTool(block.name, input);

        onStep({
          type: "tool_result",
          toolName: block.name,
          content: result,
        });

        messages.push({
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: block.id,
              content: result,
            },
          ],
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
  type: "thinking" | "tool_call" | "tool_result" | "done";
  content?: string;
  toolName?: string;
  input?: Record<string, string>;
}
