// Implemented Genkit flow for AI-powered question paper solving, generating solutions and answer keys.

'use server';

/**
 * @fileOverview AI-powered question paper solver for RRB NTPC exams.
 *
 * - solveQuestionPaper - A function that handles the question paper solving process.
 * - SolveQuestionPaperInput - The input type for the solveQuestionPaper function.
 * - SolveQuestionPaperOutput - The return type for the solveQuestionPaper function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SolveQuestionPaperInputSchema = z.object({
  questionPaper: z
    .string()
    .describe(
      'The question paper, either as text or an image data URI (data:<mimetype>;base64,<encoded_data>).'
    ),
});
export type SolveQuestionPaperInput = z.infer<typeof SolveQuestionPaperInputSchema>;

const SolveQuestionPaperOutputSchema = z.object({
  solutions: z.string().describe('The solutions to the questions in the paper.'),
  answerKey: z.string().describe('The answer key for the question paper.'),
});
export type SolveQuestionPaperOutput = z.infer<typeof SolveQuestionPaperOutputSchema>;

export async function solveQuestionPaper(input: SolveQuestionPaperInput): Promise<SolveQuestionPaperOutput> {
  return solveQuestionPaperFlow(input);
}

const prompt = ai.definePrompt({
  name: 'solveQuestionPaperPrompt',
  input: {schema: SolveQuestionPaperInputSchema},
  output: {schema: SolveQuestionPaperOutputSchema},
  prompt: `You are an expert in solving RRB NTPC exam question papers.

You will receive a question paper as input, and your task is to generate the solutions to the questions and create an answer key.

Question Paper: {{{questionPaper}}}`,
});

const solveQuestionPaperFlow = ai.defineFlow(
  {
    name: 'solveQuestionPaperFlow',
    inputSchema: SolveQuestionPaperInputSchema,
    outputSchema: SolveQuestionPaperOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
