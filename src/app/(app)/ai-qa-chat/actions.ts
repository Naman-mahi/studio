
"use server";

import { askGeneralQuestion as askGeneralQuestionFlow } from '@/ai/flows/general-qa-chat';
import type { GeneralQaChatInput, GeneralQaChatOutput } from '@/ai/flows/general-qa-chat';

export async function askGeneralQuestion(input: GeneralQaChatInput): Promise<GeneralQaChatOutput> {
   try {
    if (!input.question || input.question.trim() === "") {
      throw new Error("Question cannot be empty.");
    }
    return await askGeneralQuestionFlow(input);
  } catch (error) {
    console.error("Error in askGeneralQuestion action:", error);
    throw new Error("Failed to get chat response due to an internal error.");
  }
}
