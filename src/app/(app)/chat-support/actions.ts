"use server";

import { questionClarificationChat as questionClarificationChatFlow } from '@/ai/flows/question-clarification-chat';
import type { QuestionClarificationChatInput, QuestionClarificationChatOutput } from '@/ai/flows/question-clarification-chat';

export async function questionClarificationChat(input: QuestionClarificationChatInput): Promise<QuestionClarificationChatOutput> {
   try {
    if (!input.question || input.question.trim() === "") {
      throw new Error("Question cannot be empty.");
    }
    return await questionClarificationChatFlow(input);
  } catch (error) {
    console.error("Error in questionClarificationChat action:", error);
    throw new Error("Failed to get chat response due to an internal error.");
  }
}
