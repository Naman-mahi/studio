
"use server";

import { questionClarificationChat as topicTutorChatFlow } from '@/ai/flows/question-clarification-chat';
import type { QuestionClarificationChatInput, QuestionClarificationChatOutput } from '@/ai/flows/question-clarification-chat';

export async function askTopicTutor(input: QuestionClarificationChatInput): Promise<QuestionClarificationChatOutput> {
   try {
    if (!input.question || input.question.trim() === "") {
      throw new Error("Question cannot be empty.");
    }
    if (!input.subject || input.subject.trim() === "" || !input.topic || input.topic.trim() === "") {
      throw new Error("Subject and Topic must be selected and cannot be empty for Topic AI Tutor.");
    }
    return await topicTutorChatFlow(input);
  } catch (error: any) {
    console.error("Error in askTopicTutor action:", error);
    if (error instanceof Error) {
        throw new Error(error.message); 
    }
    throw new Error("Failed to get chat response from Topic AI Tutor due to an unexpected error.");
  }
}
