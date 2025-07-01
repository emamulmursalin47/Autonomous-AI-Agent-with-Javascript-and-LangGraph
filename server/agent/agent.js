import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatGroq } from "@langchain/groq";

const model = new ChatGroq({
  model: "deepseek-r1-distill-llama-70b",
});
const agent = createReactAgent({
  llm: model,
  tools: [],
});
const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content: "I want a recipe of making coffee",
    },
  ],
});
console.log(result.messages.at(-1).content);
