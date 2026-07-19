"use server"

import { createAgent, createTool, gemini, createState, openai } from '@inngest/agent-kit';
import { z } from "zod";

const suggestionSchema = z.object({
  suggestion: z
    .string()
    .describe("The code to insert at cursor, or empty string if no completion needed")
});

interface PromptArgs {
  fileName: string;
  previousLines: string;
  lineNumber: number;
  currentLine: string;
  textBeforeCursor: string;
  textAfterCursor: string;
  nextLines: string;
  code: string;
}

const SUGGESTION_PROMPT = ({
  fileName,
  previousLines,
  lineNumber,
  currentLine,
  textBeforeCursor,
  textAfterCursor,
  nextLines,
  code
}: PromptArgs) => {
  return `
    You are a code suggestion assistant.

    <context>
    <file_name>${fileName}</file_name>
    <previous_lines>
    ${previousLines}
    </previous_lines>
    <current_line number="${lineNumber}">${currentLine}</current_line>
    <before_cursor>${textBeforeCursor}</before_cursor>
    <after_cursor>${textAfterCursor}</after_cursor>
    <next_lines>
    ${nextLines}
    </next_lines>
    <full_code>
    ${code}
    </full_code>
    </context>

    <instructions>
    Follow these steps IN ORDER:

    1. First, look at next_lines. If next_lines contains ANY code, check if it continues from where the cursor is. If it does, return empty string immediately - the code is already written.

    2. Check if before_cursor ends with a complete statement (;, }, )). If yes, return empty string.

    3. Only if steps 1 and 2 don't apply: suggest what should be typed at the cursor position, using context from full_code.

    Your suggestion is inserted immediately after the cursor, so never suggest code that's already in the file.
    </instructions>`
}

const provideSuggestionTool = createTool({
  name: "provide_suggestion",
  description: "Call this tool to submit your final autocomplete suggestion output.",
  parameters: suggestionSchema,
  handler: async ({ suggestion }, { network }) => {
    network.state.data.suggestionResult = suggestion;
    return { status: "success" };
  }
});

const suggestionAgent = createAgent({
  name: 'Suggestion writer',
  system: 'You are an automated code completion engine.',
  model: openai({ 
    model: 'gpt-4o-mini', 
    defaultParameters: {
      temperature: 0.1
    } as any
  }),
  tools: [provideSuggestionTool],
  tool_choice: "provide_suggestion" 
});

export const getAutocompleteSuggestion = async (context: PromptArgs): Promise<string> => {
  if (!context.textBeforeCursor.trim() && !context.code.trim()) return "";

  try {
    const dynamicPrompt = SUGGESTION_PROMPT(context);
    const agentState = createState();

    await suggestionAgent.run(dynamicPrompt, { state: agentState });
    const result = agentState.data.suggestionResult;

    return typeof result === "string" ? result : "";
  } catch (error) {
    console.error("Autocomplete backend exception:", error);
    return "";
  }
}