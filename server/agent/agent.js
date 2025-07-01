import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatGroq } from "@langchain/groq";
import { z } from "zod";
import { MemorySaver } from "@langchain/langgraph";
import { tool } from "@langchain/core/tools";

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

// Initialize Groq with a valid model name
const model = new ChatGroq({
  model: "deepseek-r1-distill-llama-70b", // Valid Groq model
  temperature: 0,
});

const checkpointSaver = new MemorySaver();

// Create the agent
export const agent = createReactAgent({
  llm: model,
  tools: [weatherTool],
  checkpointSaver,
});

// // Main execution
// (async () => {
//   try {
//     // First query
//     const result = await agent.invoke(
//       {
//         messages: [
//           {
//             role: "user",
//             content: "what's the weather in Tokyo?",
//           },
//         ],
//       },
//       {
//         configurable: { thread_id: "42" },
//       }
//     );

//     console.log(result.messages.at(-1)?.content);

//     // Follow-up query
//     const followup = await agent.invoke(
//       {
//         messages: [
//           {
//             role: "user",
//             content: "what city is that for?",
//           },
//         ],
//       },
//       {
//         configurable: { thread_id: "42" }, // Same thread ID maintains conversation
//       }
//     );

//     console.log("Follow up:", followup.messages.at(-1)?.content);
//   } catch (error) {
//     console.error("Error:", error);
//   }
// })();