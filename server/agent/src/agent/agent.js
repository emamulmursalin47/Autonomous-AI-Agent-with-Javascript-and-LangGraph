import { MemorySaver } from '@langchain/langgraph';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatGroq } from '@langchain/groq';


import { createTools } from '../tools/tools.js';
import { getModel } from '../models/models.js';
import { Message } from '../database.js';

const checkpointSaver = new MemorySaver();
let currentModel = new ChatGroq({ model: 'llama3-8b-8192', temperature: 0 });
let agent;

async function initializeAgent() {
  const tools = await createTools();
  agent = createReactAgent({
    llm: currentModel,
    tools,
    checkpointSaver,
  });
}

initializeAgent();

export async function handleChat(req, res) {
  const { prompt, thread_id } = req.body;
  const userId = req.user.userId; // Get userId from authenticated token
  console.log('handleChat - userId:', userId);

  if (!prompt || !thread_id) {
    return res.status(400).json({ error: 'Prompt or thread_id is missing' });
  }

  try {
    // Save user message
    try {
      const userMessage = new Message({ thread_id, role: 'user', content: prompt, userId });
      await userMessage.save();
    } catch (saveError) {
      console.error('Error saving user message:', saveError);
    }

    const messages = [
      { role: 'system', content: 'You are a helpful AI assistant. Your responses should always be in JSON format, with a single key \'response\' containing your textual answer. For example: {\"response\": \"Hello! How can I help you today?\"}' },
      { role: 'user', content: prompt }
    ];

    const result = await agent.invoke(
      { messages }, 
      { configurable: { thread_id } }
    );

    const lastMessage = result.messages.at(-1);
    if (lastMessage) {
      let contentToSend = lastMessage.content;
      try {
        const parsedContent = JSON.parse(lastMessage.content);
        if (parsedContent && parsedContent.response) {
          contentToSend = parsedContent.response;
        }
      } catch (jsonError) {
        console.warn('AI response was not valid JSON, sending raw content:', jsonError);
      }

      // Save assistant message
      try {
        const assistantMessage = new Message({ thread_id, role: 'assistant', content: contentToSend, userId });
        await assistantMessage.save();
      } catch (saveError) {
        console.error('Error saving assistant message:', saveError);
      }

      res.json({ content: contentToSend });
    } else {
      res.status(500).json({ error: 'No valid response from agent' });
    }
  } catch (error) {
    console.error('Error invoking agent:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getChatHistory(req, res) {
  const { thread_id } = req.params;
  const userId = req.user.userId; // Get userId from authenticated token
  console.log('getChatHistory - userId:', userId);

  try {
    const history = await Message.find({ thread_id, userId }).sort({ timestamp: 1 });
    res.json({ history });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function handleModelSwitch(req, res) {
  const { modelName } = req.body;

  if (!modelName) {
    return res.status(400).json({ error: 'Model name is missing' });
  }

  try {
    currentModel = getModel(modelName);
    await initializeAgent();
    res.json({ message: `Switched to model: ${modelName}` });
  } catch (error) {
    console.error('Error switching model:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getAllThreads(req, res) {
  const userId = req.user.userId; // Get userId from authenticated token
  console.log('getAllThreads - userId:', userId);
  try {
    const threads = await Message.distinct('thread_id', { userId });
    res.json({ threads });
  } catch (error) {
    console.error('Error fetching all threads:', error);
    res.status(500).json({ error: error.message });
  }
}