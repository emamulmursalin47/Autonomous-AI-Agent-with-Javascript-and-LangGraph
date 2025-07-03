
import { ChatGroq } from '@langchain/groq';


const models = {
  'llama3-8b-8192': () => new ChatGroq({ model: 'llama3-8b-8192', temperature: 0 }),
 
  'deepseek-r1-distill-llama-70b': () => new ChatGroq({ model: 'deepseek-r1-distill-llama-70b', temperature: 0 }),
  'meta-llama/llama-4-maverick-17b-128e-instruct': () => new ChatGroq({ model: 'meta-llama/llama-4-maverick-17b-128e-instruct', temperature: 0 }),
  'mistral-saba-24b': () => new ChatGroq({ model: 'mistral-saba-24b', temperature: 0 }),
};

export function getModel(modelName) {
  const modelFactory = models[modelName];
  if (!modelFactory) {
    throw new Error(`Invalid model name: ${modelName}`);
  }
  return modelFactory();
}
