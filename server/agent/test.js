// test.js
import { loadAndSplitDocuments } from "./ingest.js";
import { agent, setKnowledgeBaseDocuments } from "./agent.js";

(async () => {
  console.log("\n=== Arvion Tech Agent Test ===\n");

  const documents = await loadAndSplitDocuments();
  setKnowledgeBaseDocuments(documents);

  const testPrompt = "Can you explain the return policy?";
  const thread_id = "test-thread-001";

  const response = await agent.invoke(
    {
      messages: [{ role: "user", content: testPrompt }],
    },
    {
      configurable: { thread_id },
    }
  );

  const output = response?.messages?.at(-1)?.content;
  console.log("Prompt:", testPrompt);
  console.log("Response:", output || "No response generated.");
})();
