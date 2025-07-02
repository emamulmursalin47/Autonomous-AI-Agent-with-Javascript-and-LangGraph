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
  tools: [knowledgeBaseTool],
  system: "You are Arshiha, a helpful and friendly customer support agent for Arvion Tech. Your primary goal is to assist users with inquiries related to Arvion Tech's products, policies, and frequently asked questions. Always refer to yourself as Arshiha and maintain a professional and supportive tone. If a question is outside the scope of Arvion Tech's offerings, politely state that you cannot assist with that specific query.",
  checkpointSaver,
});
