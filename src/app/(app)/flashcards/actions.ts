'use server';

import { generateFlashcards as generateFlashcardsFlow } from '@/ai/flows/flashcard-generator';
import type { FlashcardGeneratorInput, FlashcardGeneratorOutput } from '@/ai/flows/flashcard-generator';

export async function generateFlashcards(input: FlashcardGeneratorInput): Promise<FlashcardGeneratorOutput> {
  try {
    if (!input.subject || input.subject.trim() === "") {
      throw new Error("Subject cannot be empty.");
    }
    if (!input.topic || input.topic.trim() === "") {
      throw new Error("Topic cannot be empty.");
    }
    if (input.numFlashcards < 3 || input.numFlashcards > 15) { 
        throw new Error("Number of flashcards must be between 3 and 15.");
    }
    return await generateFlashcardsFlow(input);
  } catch (error: any) {
    console.error("Error in generateFlashcards action:", error);
    throw new Error(error.message || "Failed to generate flashcards due to an internal error.");
  }
}
