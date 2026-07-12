// src/inngest/functions.ts
import { inngest } from "./client";
import { createAgent, gemini, openai } from '@inngest/agent-kit';

const codeWriterAgent = createAgent({
  name: 'Code writer',
  system: 'You are an expert TypeScript programmer.  Given a set of asks, you think step-by-step to plan clean, ' +
    'idiomatic TypeScript code, with comments and tests as necessary.' +
    'Do not respond with anything else other than the following XML tags:' +
    '- If you would like to write code, add all code within the following tags (replace $filename and $contents appropriately):' +
    "  <file name='$filename.ts'>$contents</file> (Make sure to only give code and nothing else) only the <file> tag)",
  model: gemini({ model: 'gemini-3-flash-preview' }), 
});

export const processTask = inngest.createFunction(
  { id: "process-task", triggers: { event: "app/task.created" } },
  async ({ event, step, runId }) => {
    
    const response = await codeWriterAgent.run(
      'Write an backend code for auth. only use the standard npm like salt, and other things'
    );
    
    await step.sleep("pause", "1s");

    return { 
      message: `Task ${runId} complete`, 
      response: response 
    };
  }
);