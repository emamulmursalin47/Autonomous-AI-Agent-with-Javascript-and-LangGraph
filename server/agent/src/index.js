
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { handleChat, handleModelSwitch, getChatHistory, getAllThreads } from './agent/agent.js';
import { connectDB } from './database.js';
import { registerUser, loginUser, authenticateToken } from './auth.js';

const app = express();
const port = 3001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors({ origin: '*' }));

// Auth routes
app.post('/api/register', registerUser);
app.post('/api/login', loginUser);

// API routes (protected)
app.post('/api/chat', authenticateToken, handleChat);
app.post('/api/switch-model', authenticateToken, handleModelSwitch);
app.get('/api/history/:thread_id', authenticateToken, getChatHistory);
app.get('/api/threads', authenticateToken, getAllThreads);

// Root endpoint
app.get('/', (req, res) => {
  res.send('AI agent server is running');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
