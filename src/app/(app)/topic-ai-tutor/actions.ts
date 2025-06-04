
"use server";

import { questionClarificationChat as topicTutorChatFlow } from '@/ai/flows/question-clarification-chat';
import type { QuestionClarificationChatInput, QuestionClarificationChatOutput } from '@/ai/flows/question-clarification-chat';

export async function askTopicTutor(input: QuestionClarificationChatInput): Promise<QuestionClarificationChatOutput> {
   try {
    if (!input.question || input.question.trim() === "") {
      throw new Error("Question cannot be empty.");
    }
    if (!input.subject || !input.topic) {
      throw new Error("Subject and Topic must be selected for Topic AI Tutor.");
    }
    return await topicTutorChatFlow(input);
  } catch (error) {
    console.error("Error in askTopicTutor action:", error);
    throw new Error("Failed to get chat response from Topic AI Tutor due to an internal error.");
  }
}
