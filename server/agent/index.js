import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { agent } from './agent.js';

const app = express();
const port = 3001;

app.use(express.static('public'));

// Global middleware
app.use(express.json());  // Middleware to parse JSON bodies
app.use(cors({ origin: '*' }));  // Middleware to allow cross-origin requests

// Utility function to log errors
const logError = (message, error) => {
  console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
};

// Utility function to strip Markdown from text
const stripMarkdown = (text) => {
  // Remove bold and italics
  let strippedText = text.replace(/\*\*(.*?)\*\*/g, '$1'); // **bold**
  strippedText = strippedText.replace(/__(.*?)__/g, '$1'); // __bold__
  strippedText = strippedText.replace(/\*(.*?)\*/g, '$1');   // *italics*
  strippedText = strippedText.replace(/_(.*?)_/g, '$1');   // _italics_

  // Remove inline code blocks
  strippedText = strippedText.replace(/`(.*?)`/g, '$1');

  // Remove code blocks (multiline)
  strippedText = strippedText.replace(/```[\s\S]*?```/g, '');

  // Remove headers
  strippedText = strippedText.replace(/^#+\s*(.*)/gm, '$1');

  // Remove list markers
  strippedText = strippedText.replace(/^[\*\-+]\s+/gm, '');
  strippedText = strippedText.replace(/^\d+\.\s+/gm, '');

  // Remove blockquotes
  strippedText = strippedText.replace(/^>\s*/gm, '');

  return strippedText.trim();
};

// Route to test server
app.get('/', (req, res) => {
  res.send('Hello World');
});

// POST route to generate response from agent
app.post('/generate', async (req, res) => {
  const { prompt, thread_id } = req.body;

  // Validate the input
  if (!prompt || !thread_id) {
    logError('Prompt or thread_id is missing');
    return res.status(400).json({ error: 'Prompt or thread_id is missing' });
  }

  console.log(`[INFO] Received request for thread_id: ${thread_id}, prompt: ${prompt}`);

  try {
    // Invoke agent to process the prompt
    const result = await agent.invoke(
      {
        messages: [{ role: 'user', content: prompt }],
      },
      {
        configurable: { thread_id },
      }
    );

    if (result && result.messages && result.messages.length > 0) {
      let messageContent = result.messages.at(-1)?.content;
      messageContent = stripMarkdown(messageContent); // Apply markdown stripping
      console.log(`[INFO] Generated response: ${messageContent}`);
      return res.json({ content: messageContent });
    } else {
      logError('Agent response is invalid or empty');
      return res.status(500).json({ error: 'No valid response from agent' });
    }
  } catch (error) {
    logError(`Error invoking agent for thread_id: ${thread_id}`, error);
    return res.status(500).json({ error: error.message });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
