
"use server";

import { generateQuizQuestions as generateQuizQuestionsFlow } from '@/ai/flows/practice-question-generator';
import type { QuizQuestionGeneratorInput, QuizQuestionGeneratorOutput } from '@/ai/flows/practice-question-generator';

export async function generateQuizQuestions(input: QuizQuestionGeneratorInput): Promise<QuizQuestionGeneratorOutput> {
  try {
    if (!input.topic || input.topic.trim() === "") {
      throw new Error("Topic cannot be empty.");
    }
    if (!input.subject || input.subject.trim() === "") {
      throw new Error("Subject cannot be empty.");
    }
    if (input.numQuestions < 5 || input.numQuestions > 10) { 
        throw new Error("Number of questions must be between 5 and 10.");
    }
    return await generateQuizQuestionsFlow(input);
  } catch (error) {
    console.error("Error in generateQuizQuestions action:", error);
    throw new Error("Failed to generate quiz questions due to an internal error.");
  }
}

