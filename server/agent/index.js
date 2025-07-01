import express from 'express';
import cors from 'cors';
import { agent } from './agent.js';

const app = express();
const port = 3001;

// Global middleware
app.use(express.json());  // Middleware to parse JSON bodies
app.use(cors({ origin: '*' }));  // Middleware to allow cross-origin requests

// Flag to prevent processing the same request multiple times
let isRequestProcessing = false;

// Utility function to log errors
const logError = (message) => {
  console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
};

// Route to test server
app.get('/', (req, res) => {
  res.send('Hello World');
});

// POST route to generate response from agent
app.post('/generate', async (req, res) => {
  if (isRequestProcessing) {
    logError('Request is already being processed.');
    return res.status(400).json({ error: 'Request is already being processed' });
  }

  // Set the flag to true to prevent further requests from being processed
  isRequestProcessing = true;

  const { prompt, thread_id } = req.body;

  // Validate the input
  if (!prompt || !thread_id) {
    logError('Prompt or thread_id is missing');
    isRequestProcessing = false;
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

    // Reset the processing flag
    isRequestProcessing = false;

    if (result && result.messages && result.messages.length > 0) {
      const messageContent = result.messages.at(-1)?.content;
      console.log(`[INFO] Generated response: ${messageContent}`);
      return res.json({ content: messageContent });
    } else {
      logError('Agent response is invalid or empty');
      return res.status(500).json({ error: 'No valid response from agent' });
    }
  } catch (error) {
    
    isRequestProcessing = false;
    logError(`Error invoking agent: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
