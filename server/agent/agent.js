import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatGroq } from "@langchain/groq";
import { z } from "zod";
import { MemorySaver } from "@langchain/langgraph";
import { tool } from "@langchain/core/tools";

let knowledgeBaseDocuments = [];

export function setKnowledgeBaseDocuments(docs) {
  knowledgeBaseDocuments = docs;
}

// Knowledge Base Search Tool
const knowledgeBaseTool = tool(
  async ({ query }) => {
    console.log(`[KnowledgeBaseTool] Query received: "${query}"`);
    if (knowledgeBaseDocuments.length === 0) {
      console.log("[KnowledgeBaseTool] Knowledge base is empty.");
      return "__NO_RELEVANT_INFO__";
    }

    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);

    // Exact match search
    let relevantDocs = knowledgeBaseDocuments.filter(doc =>
      doc.pageContent.toLowerCase().includes(queryLower)
    );

    // If no exact matches, try keyword matching
    if (relevantDocs.length === 0 && queryWords.length > 0) {
      relevantDocs = knowledgeBaseDocuments.filter(doc => {
        const content = doc.pageContent.toLowerCase();
        return queryWords.some(word => content.includes(word));
      });
    }

    if (relevantDocs.length > 0) {
      const result = relevantDocs.map(doc => doc.pageContent).join("\n---\n");
      console.log(`[KnowledgeBaseTool] Found ${relevantDocs.length} relevant documents. Returning snippet.`);
      return result;
    } else {
      console.log("[KnowledgeBaseTool] No relevant information found for query.");
      return "__NO_RELEVANT_INFO__";
    }
  },
  {
    name: "knowledge_base_search",
    description: "Search the internal knowledge base for information.",
    schema: z.object({
      query: z.string().describe("The query to search the knowledge base for"),
    }),
  }
);

const model = new ChatGroq({
  model: "qwen-qwq-32b",
  temperature: 0,
});

const checkpointSaver = new MemorySaver();

export const agent = createReactAgent({
  llm: model,
  tools: [knowledgeBaseTool],
  checkpointSaver,
  system: `1.
  You are Arshiha, the dedicated customer support agent for Arvion Tech.

2.Your role is to professionally assist users with information regarding Arvion Tech's products, services, and policies.

3.Always refer to yourself as Arshiha.
4.You are not an AI, chatbot, or language model — never mention those terms.
5. Do NOT mention Deepseek, Groq, or any underlying models.

6.When a user asks about your nature, identity, or how you work, politely reply with: "I'm Arshiha, your dedicated customer support agent for Arvion Tech."

7.For all other inquiries, focus solely on helping the user with Arvion Tech-related topics.

8. For any query that might require information from the knowledge base, you MUST use the `knowledge_base_search` tool.

9. If the knowledge base search tool returns '__NO_RELEVANT_INFO__', you MUST respond with '__NO_RELEVANT_INFO__' and nothing else.`
});
