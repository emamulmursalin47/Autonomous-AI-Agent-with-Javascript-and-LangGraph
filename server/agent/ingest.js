import 'dotenv/config';
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const KNOWLEDGE_BASE_PATH = "./knowledge_base";

export async function loadAndSplitDocuments() {
  try {
    console.log("--- Starting document loading and splitting ---");

    const loader = new DirectoryLoader(
      KNOWLEDGE_BASE_PATH,
      {
        ".txt": (path) => new TextLoader(path),
      },
      true
    );

    const docs = await loader.load();
    console.log(`Loaded ${docs.length} documents from ${KNOWLEDGE_BASE_PATH}`);

    if (docs.length === 0) {
      console.log("No documents found. Exiting.");
      return [];
    }

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200
    });
    const splitDocs = await textSplitter.splitDocuments(docs);
    console.log(`Split documents into ${splitDocs.length} chunks.`);

    console.log("--- Document loading and splitting complete! ---");
    return splitDocs;

  } catch (error) {
    console.error("An error occurred during document loading and splitting:", error);
    process.exit(1);
  }
}