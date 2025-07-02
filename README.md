# Autonomous AI Agent with Javascript and LangGraph

This project demonstrates an autonomous AI agent built with JavaScript and LangGraph, featuring integration with various Large Language Models (LLMs) and custom tools.

## Features

*   **Express.js Server:** A lightweight Node.js server to handle API requests and serve the client.
*   **LangChain Agent:** Core AI agent logic powered by LangChain, enabling interaction with LLMs.
*   **Multiple LLM Support:** Configurable to use Groq, Google GenAI, or OpenAI models.
*   **Custom Tools:**
    *   **Knowledge Base Search:** Searches pre-loaded documents for relevant information.
    *   **Weather Tool:** A placeholder for fetching real-time weather data.
*   **Document Ingestion:** Loads and processes text documents from a local knowledge base.
*   **Simple Web Client:** A basic HTML interface for interacting with the agent.

## Technologies Used

*   **Node.js**
*   **Express.js**
*   **LangChain.js**
*   **LangGraph.js**
*   **Groq SDK** (and potential for Google GenAI, OpenAI)
*   **dotenv** for environment variables
*   **Zod** for schema validation

## Project Structure

*   `server/agent/`: Contains the core server and agent logic.
    *   `agent.js`: Defines the LangChain agent and its tools.
    *   `index.js`: Express server setup and API endpoint (`/generate`).
    *   `ingest.js`: Handles loading and splitting knowledge base documents.
    *   `knowledge_base/`: Directory for text files used by the knowledge base tool.
    *   `public/`: Contains the `index.html` client.
*   `package.json`: Root project dependencies.
*   `server/agent/package.json`: Server-specific dependencies.

## Setup

To get this project up and running, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd Autonomous-AI-Agent-with-Javascript-and-LangGraph
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    cd server/agent
    npm install
    cd ../..
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the `server/agent/` directory with your LLM API key. For example, if using Groq:
    ```
    GROQ_API_KEY=your_groq_api_key_here
    ```
    (Refer to `agent.js` for other potential API key requirements if switching LLMs).

4.  **Start the server:**
    ```bash
    node server/agent/index.js
    ```
    The server will start on `http://localhost:3001`.

## Usage

1.  Open your web browser and navigate to `http://localhost:3001`.
2.  Enter your prompt in the input field and click "Send".
3.  The agent's response will be displayed on the page.

## Suggested Improvements

Here are some areas where this project could be significantly enhanced:

1.  **Enhanced Knowledge Base Search (RAG):**
    *   **Current:** Simple keyword `includes` search.
    *   **Improvement:** Implement a proper vector store (e.g., Pinecone, Chroma, or a local in-memory solution like `HNSWLib` or `Faiss`) with embeddings for semantic search. This will drastically improve the relevance and quality of retrieved information from the knowledge base.

2.  **Dynamic Thread Management:**
    *   **Current:** The `thread_id` in the client (`index.html`) is hardcoded to '42', meaning all conversations share the same history.
    *   **Improvement:** Generate unique `thread_id`s for each new conversation or user session (e.g., using UUIDs on the client or server) to maintain separate and persistent conversation histories.

3.  **Robust Error Handling and UI Feedback:**
    *   **Current:** Basic server-side error logging; minimal client-side feedback.
    *   **Improvement:** Implement more comprehensive error handling on both the server and client. Provide clear, user-friendly messages in the UI for network issues, agent errors, or invalid inputs.

4.  **Asynchronous Knowledge Base Loading:**
    *   **Current:** Knowledge base documents are loaded synchronously on server startup, which can block the process for large datasets.
    *   **Improvement:** Implement a more robust ingestion pipeline. Consider lazy loading, a dedicated ingestion script, or a background process for very large knowledge bases.

5.  **Tool Expansion and Implementation:**
    *   **`weatherTool`:** Fully implement the `weatherTool` by integrating with a real weather API (e.g., OpenWeatherMap, WeatherAPI.com).
    *   **New Tools:** Add more practical tools based on potential use cases, such as:
        *   A calculator tool for mathematical operations.
        *   A web search tool for external information retrieval.
        *   A calendar or scheduling tool.

6.  **Client-Side Enhancements:**
    *   **Interactive Chat Interface:** Transform `index.html` into a more dynamic and user-friendly chat interface, displaying the full conversation history.
    *   **Loading Indicators:** Provide visual feedback (e.g., spinners) when the agent is processing a request.
    *   **Input Management:** Automatically clear the input field after a prompt is sent.

7.  **Configuration Management:**
    *   **Current:** API keys are managed via `.env`.
    *   **Improvement:** For more complex configurations, consider a dedicated configuration file or a configuration management library to centralize settings like LLM models, tool parameters, and server ports.

8.  **Testing:**
    *   **Current:** No tests implemented.
    *   **Improvement:** Add unit tests for individual functions (e.g., `ingest.js`, tool logic) and integration tests for the server API and agent interactions.

9.  **Deployment Strategy:**
    *   **Current:** Manual local execution.
    *   **Improvement:** Provide instructions or scripts for deploying the application to a cloud platform (e.g., Heroku, AWS, Vercel) or a Docker container.

10. **Security Considerations:**
    *   **Current:** Basic setup.
    *   **Improvement:** For public-facing applications, implement security measures such as authentication/authorization, rate limiting, and more robust input sanitization to prevent common web vulnerabilities.
