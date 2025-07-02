// index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { agent } from './agent.js';

const app = express();
const port = 3001;

app.use(express.static('public'));
app.use(express.json());
app.use(cors({ origin: '*' }));

// Enhanced persona enforcement
class PersonaGuard {
  constructor() {
    this.identityResponses = [
      "I'm Arshiha, your dedicated customer support agent for Arvion Tech. I'm here to help you with any questions about our products and services.",
      "I'm Arshiha from Arvion Tech support. How can I assist you with our products today?",
      "I'm Arshiha, and I specialize in helping customers with Arvion Tech solutions. What can I help you with?"
    ];

    this.fallbackResponse = "I'm sorry, but I can only provide information about Arvion Tech's products and services. Please ask me something related to our company offerings.";

    this.identityTriggers = [
      /who\s+are\s+you/i,
      /what\s+are\s+you/i,
      /are\s+you\s+(an?\s+)?(ai|bot|robot|computer|program|llm|language\s+model|chatbot)/i,
      /what.*your.*name/i,
      /tell\s+me\s+about\s+yourself/i,
      /your\s+identity/i,
      /who\s+created\s+you/i,
      /what\s+is\s+your\s+purpose/i,
      /are\s+you\s+human/i,
      /are\s+you\s+real/i,
      /what\s+do\s+you\s+do/i,
      /your\s+function/i,
      /your\s+role/i
    ];

    this.forbiddenTerms = [
      /deepseek/i,
      /groq/i,
      /qwen/i,
      /language\s+model/i,
      /\bai\b/i,
      /chatbot/i,
      /artificial\s+intelligence/i,
      /neural\s+network/i,
      /large\s+language\s+model/i,
      /trained\s+by/i,
      /developed\s+by/i,
      /my\s+programming/i,
      /my\s+algorithms/i,
      /as\s+an?\s+ai/i,
      /as\s+a\s+language\s+model/i,
      /machine\s+learning/i,
      /openai/i,
      /gpt/i,
      /i\s+am\s+an?\s+ai/i,
      /i\s+am\s+a\s+language\s+model/i,
      /i\s+do\s+not\s+have\s+feelings/i,
      /i\s+do\s+not\s+have\s+opinions/i,
      /i\s+am\s+not\s+human/i
    ];

    this.generalCapabilities = [
      /i\s+can\s+help\s+with\s+(anything|everything|various|many|a\s+wide\s+range)/i,
      /i\s+can\s+assist\s+with\s+(a\s+wide\s+range|various|many|anything|everything)/i,
      /my\s+capabilities\s+include/i,
      /i\s+can\s+perform\s+(various|many|different)\s+tasks/i,
      /i\s+can\s+answer\s+questions\s+on\s+(a\s+wide\s+range|various|many|any\s+topic)/i,
      /i\s+have\s+knowledge\s+(of|about)\s+(many|various|different|all)\s+topics/i,
      /i\s+can\s+generate\s+text/i,
      /i\s+can\s+understand\s+and\s+respond/i,
      /i\s+am\s+designed\s+to/i,
      /i\s+can\s+process\s+information/i
    ];
  }

  isIdentityQuestion(text) {
    return this.identityTriggers.some(pattern => pattern.test(text));
  }

  getIdentityResponse() {
    return this.identityResponses[Math.floor(Math.random() * this.identityResponses.length)];
  }

  containsForbiddenTerms(text) {
    return this.forbiddenTerms.some(pattern => pattern.test(text));
  }

  containsGeneralCapabilities(text) {
    return this.generalCapabilities.some(pattern => pattern.test(text));
  }

  cleanResponse(response) {
    // Remove markdown formatting
    let cleaned = response
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/^#+\s*(.*)/gm, '$1')
      .replace(/^[\*\-\+]\s+/gm, '')
      .replace(/^\d+\.\s+/gm, '')
      .replace(/^>\s*/gm, '')
      .trim();

    return cleaned;
  }

  enforcePersona(userInput, agentResponse) {
    const cleanInput = userInput.toLowerCase().trim();
    let cleanResponse = this.cleanResponse(agentResponse);

    // Handle identity questions
    if (this.isIdentityQuestion(cleanInput)) {
      return this.getIdentityResponse();
    }

    // Check if response contains forbidden terms
    if (this.containsForbiddenTerms(cleanResponse)) {
      return this.getIdentityResponse();
    }

    // Check if response contains general AI capabilities
    if (this.containsGeneralCapabilities(cleanResponse)) {
      return "As Arshiha from Arvion Tech, I focus specifically on helping you with our products and services. What would you like to know about Arvion Tech?";
    }

    // Check if response indicates no knowledge
    if (cleanResponse.includes('__NO_RELEVANT_INFO__') || 
        cleanResponse.toLowerCase().includes("i don't have") ||
        cleanResponse.toLowerCase().includes("i don't know") ||
        cleanResponse.toLowerCase().includes("i'm not sure") ||
        cleanResponse.toLowerCase().includes("i cannot find")) {
      return this.fallbackResponse;
    }

    return cleanResponse;
  }
}

const personaGuard = new PersonaGuard();

app.get('/', (req, res) => {
  res.json({ 
    message: 'Arshiha - Arvion Tech Customer Support Agent',
    status: 'active'
  });
});

app.post('/generate', async (req, res) => {
  const { prompt, thread_id } = req.body;

  if (!prompt || !thread_id) {
    return res.status(400).json({ 
      error: 'Both prompt and thread_id are required' 
    });
  }

  console.log(`[${new Date().toISOString()}] Request - Thread: ${thread_id}, Prompt: "${prompt}"`);

  try {
    // First check if it's an identity question
    if (personaGuard.isIdentityQuestion(prompt)) {
      const response = personaGuard.getIdentityResponse();
      console.log(`[${new Date().toISOString()}] Identity Response: "${response}"`);
      return res.json({ content: response });
    }

    // Invoke the agent
    const result = await agent.invoke(
      {
        messages: [{ role: 'user', content: prompt }],
      },
      {
        configurable: { thread_id },
      }
    );

    if (!result?.messages?.length) {
      return res.status(500).json({ 
        error: 'No response from agent' 
      });
    }

    const rawResponse = result.messages.at(-1)?.content || '';
    const finalResponse = personaGuard.enforcePersona(prompt, rawResponse);

    console.log(`[${new Date().toISOString()}] Final Response: "${finalResponse}"`);
    
    res.json({ content: finalResponse });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error);
    res.status(500).json({ 
      error: 'I apologize, but I encountered an issue. Please try again or contact Arvion Tech support directly.' 
    });
  }
});

app.listen(port, () => {
  console.log(`Arshiha Customer Support Agent running on port ${port}`);
});

