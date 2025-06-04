"use server";

import { solveQuestionPaper as solveQuestionPaperFlow } from '@/ai/flows/ai-question-solver';
import type { SolveQuestionPaperInput, SolveQuestionPaperOutput } from '@/ai/flows/ai-question-solver';

export async function solveQuestionPaper(input: SolveQuestionPaperInput): Promise<SolveQuestionPaperOutput> {
  try {
    // Basic validation or pre-processing can go here
    if (!input.questionPaper || input.questionPaper.trim() === "") {
      throw new Error("Question paper content cannot be empty.");
    }
    return await solveQuestionPaperFlow(input);
  } catch (error) {
    console.error("Error in solveQuestionPaper action:", error);
    // It's better to throw a more generic error or a custom error type
    // to avoid leaking sensitive details from the AI flow to the client.
    throw new Error("Failed to solve question paper due to an internal error.");
  }
}
