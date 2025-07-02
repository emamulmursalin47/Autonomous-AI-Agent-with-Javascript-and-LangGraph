import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatGroq } from "@langchain/groq";
import { z } from "zod";
import { MemorySaver } from "@langchain/langgraph";
import { tool } from "@langchain/core/tools";
import { loadAndSplitDocuments } from "./ingest.js";

// Load knowledge base documents once when the agent starts
let knowledgeBaseDocuments = [];
(async () => {
  knowledgeBaseDocuments = await loadAndSplitDocuments();
})();

// Weather tool implementation 
const weatherTool = tool(
  async ({ query }) => {
    console.log("Weather query:", query);
    // In a real implementation, you'd call a weather API here
    return `The weather in ${query} is sunny`;
  },
  {
    name: "weather",
    description: "Get the weather in a given location",
    schema: z.object({
      query: z.string().describe("The location to get weather for"),
    }),
  }
);

// Knowledge Base Search Tool
const knowledgeBaseTool = tool(
  async ({ query }) => {
    console.log("Knowledge Base query:", query);
    if (knowledgeBaseDocuments.length === 0) {
      return "Knowledge base is not loaded or is empty.";
    }

    // Simple keyword search for demonstration. For production, consider a more advanced search.
    const relevantDocs = knowledgeBaseDocuments.filter(doc => 
      doc.pageContent.toLowerCase().includes(query.toLowerCase())
    );

    if (relevantDocs.length > 0) {
      return relevantDocs.map(doc => doc.pageContent).join("\n---\n");
    } else {
      return "No relevant information found in the knowledge base.";
    }
  },
  {
    name: "knowledge_base_search",
    description: "Search the internal knowledge base for information. Use this tool to answer questions about products, policies, or frequently asked questions.",
    schema: z.object({
      query: z.string().describe("The query to search the knowledge base for"),
    }),
  }
);

// Initialize Groq with a valid model name
const model = new ChatGroq({
  model: "deepseek-r1-distill-llama-70b", // Valid Groq model
  temperature: 0,
});

const checkpointSaver = new MemorySaver();

// Create the agent
export const agent = createReactAgent({
  llm: model,
  tools: [weatherTool, knowledgeBaseTool],
  checkpointSaver,
});
