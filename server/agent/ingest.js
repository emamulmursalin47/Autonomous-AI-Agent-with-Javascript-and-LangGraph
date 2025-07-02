// ingest.js
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { setKnowledgeBaseDocuments } from "./agent.js";

const KNOWLEDGE_BASE_PATH = "./knowledge_base";

async function loadAndSplitDocuments() {
  try {
    console.log("[INFO] Loading and splitting documents...");

    const loader = new DirectoryLoader(KNOWLEDGE_BASE_PATH, {
      ".txt": (path) => new TextLoader(path),
    }, true);

    const rawDocs = await loader.load();
    console.log(`[INFO] Loaded ${rawDocs.length} documents.`);

    if (!rawDocs.length) return [];

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocs = await splitter.splitDocuments(rawDocs);
    console.log(`[INFO] Split into ${splitDocs.length} document chunks.`);

    return splitDocs;
  } catch (err) {
    console.error("[ERROR] Failed to load or split documents:", err);
    throw err;
  }
}

// Load documents and set them in the agent
(async () => {
  try {
    const docs = await loadAndSplitDocuments();
    setKnowledgeBaseDocuments(docs);
    console.log("[INFO] Knowledge base loaded and set in agent.");
  } catch (error) {
    console.error("[ERROR] Failed to initialize knowledge base for agent:", error);
  }
})();
