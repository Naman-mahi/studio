'use server';
/**
 * @fileOverview Generates flashcards for a given subject and topic.
 *
 * - generateFlashcards - A function that generates flashcards.
 * - FlashcardGeneratorInput - The input type for the generateFlashcards function.
 * - FlashcardGeneratorOutput - The return type for the generateFlashcards function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FlashcardSchema = z.object({
  term: z.string().describe('The term, concept, or question for the front of the flashcard.'),
  definition: z.string().describe('The definition, answer, or explanation for the back of the flashcard.'),
});

// Removed 'export' from the schema object
const FlashcardGeneratorInputSchema = z.object({
  subject: z.string().describe('The subject area (e.g., Mathematics, General Awareness).'),
  topic: z.string().describe('The specific topic within the subject (e.g., Algebra, Indian History).'),
  numFlashcards: z.number().min(3).max(15).default(5).describe('The number of flashcards to generate (min 3, max 15).'),
  language: z.string().optional().default('en').describe('The preferred language for the AI response (e.g., "en", "hi"). Defaults to English.'),
});
export type FlashcardGeneratorInput = z.infer<typeof FlashcardGeneratorInputSchema>;

// Removed 'export' from the schema object
const FlashcardGeneratorOutputSchema = z.object({
  flashcards: z.array(FlashcardSchema).describe('An array of generated flashcards, each with a term and a definition.'),
});
export type FlashcardGeneratorOutput = z.infer<typeof FlashcardGeneratorOutputSchema>;

export async function generateFlashcards(input: FlashcardGeneratorInput): Promise<FlashcardGeneratorOutput> {
  return flashcardGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'flashcardGeneratorPrompt',
  input: {schema: FlashcardGeneratorInputSchema},
  output: {schema: FlashcardGeneratorOutputSchema},
  prompt: `You are an expert in creating educational flashcards for RRB NTPC exam preparation.
  Please generate flashcards in {{language}} if possible. If not, English is acceptable.

  Generate {{{numFlashcards}}} flashcards for the following:
  Subject: {{{subject}}}
  Topic: {{{topic}}}

  Each flashcard should have a clear "term" (a keyword, concept, or short question) and a concise "definition" (the explanation or answer).
  The content should be highly relevant for the RRB NTPC 2025 Exams.
  Focus on factual information, key concepts, important formulas, or definitions.

  Format the output as a JSON object containing a "flashcards" array. Each element in the array should be an object with "term" and "definition".
  The term and definition should be plain text.

  Example of a single flashcard object:
  {
    "term": "What is the SI unit of power?",
    "definition": "Watt (W)"
  }

  Ensure the entire output is a valid JSON object matching the defined schema.
  `,
});

const flashcardGeneratorFlow = ai.defineFlow(
  {
    name: 'flashcardGeneratorFlow',
    inputSchema: FlashcardGeneratorInputSchema,
    outputSchema: FlashcardGeneratorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output || !output.flashcards || !Array.isArray(output.flashcards) || output.flashcards.length === 0) {
        const errorMsg = input.language === 'hi' ? "एआई फ़्लैशकार्ड उत्पन्न करने में विफल रहा। कृपया पुनः प्रयास करें।" : "AI failed to generate flashcards. Please try again.";
        throw new Error(errorMsg);
    }
    // Validate each flashcard
    for (const card of output.flashcards) {
        if (!card.term || card.term.trim() === '' || !card.definition || card.definition.trim() === '') {
            const errorMsg = input.language === 'hi' ? "एआई ने अमान्य फ़्लैशकार्ड सामग्री उत्पन्न की।" : "AI generated invalid flashcard content.";
            throw new Error(errorMsg);
        }
    }
    return output!;
  }
);
