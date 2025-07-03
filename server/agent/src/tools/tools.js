
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export async function createTools() {
  const weatherTool = tool(
    async ({ query }) => {
      return `The weather in ${query} is sunny`;
    },
    {
      name: 'weather',
      description: 'Get the weather in a given location',
      schema: z.object({
        query: z.string().describe('The location to get weather for'),
      }),
    }
  );

  return [weatherTool];
}
