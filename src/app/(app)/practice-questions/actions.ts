
"use server";

import { generatePracticeQuestions as generatePracticeQuestionsFlow } from '@/ai/flows/practice-question-generator';
import type { PracticeQuestionGeneratorInput, PracticeQuestionGeneratorOutput } from '@/ai/flows/practice-question-generator';

export async function generatePracticeQuestions(input: PracticeQuestionGeneratorInput): Promise<PracticeQuestionGeneratorOutput> {
  try {
    if (!input.topic || input.topic.trim() === "") {
      throw new Error("Topic cannot be empty.");
    }
    if (!input.subject || input.subject.trim() === "") {
      throw new Error("Subject cannot be empty.");
    }
    if (input.numQuestions <= 0 || input.numQuestions > 20) { // Basic validation
        throw new Error("Number of questions must be between 1 and 20.");
    }
    return await generatePracticeQuestionsFlow(input);
  } catch (error) {
    console.error("Error in generatePracticeQuestions action:", error);
    throw new Error("Failed to generate practice questions due to an internal error.");
  }
}
