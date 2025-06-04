// src/ai/flows/practice-question-generator.ts
'use server';

/**
 * @fileOverview Generates practice questions based on a given topic and subject for the RRB NTPC exam.
 *
 * - generatePracticeQuestions - A function that generates practice questions.
 * - PracticeQuestionGeneratorInput - The input type for the generatePracticeQuestions function.
 * - PracticeQuestionGeneratorOutput - The return type for the generatePracticeQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PracticeQuestionGeneratorInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate practice questions (e.g., Algebra, History).'),
  subject: z.string().describe('The subject area (e.g., Mathematics, General Awareness).'),
  numQuestions: z.number().default(5).describe('The number of practice questions to generate.'),
});

export type PracticeQuestionGeneratorInput = z.infer<typeof PracticeQuestionGeneratorInputSchema>;

const PracticeQuestionGeneratorOutputSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe('The practice question.'),
      answer: z.string().describe('The answer to the practice question.'),
    })
  ).describe('An array of practice questions and their corresponding answers.'),
});

export type PracticeQuestionGeneratorOutput = z.infer<typeof PracticeQuestionGeneratorOutputSchema>;

export async function generatePracticeQuestions(input: PracticeQuestionGeneratorInput): Promise<PracticeQuestionGeneratorOutput> {
  return practiceQuestionGeneratorFlow(input);
}

const practiceQuestionPrompt = ai.definePrompt({
  name: 'practiceQuestionPrompt',
  input: {schema: PracticeQuestionGeneratorInputSchema},
  output: {schema: PracticeQuestionGeneratorOutputSchema},
  prompt: `You are an expert in generating practice questions for the RRB NTPC exam.

  Generate {{{numQuestions}}} practice questions and their answers based on the specified topic and subject.

  Topic: {{{topic}}}
  Subject: {{{subject}}}

  Format the output as a JSON array of question and answer pairs.  The question and answer should be plain text, not markdown.
  {
    "questions": [
      {
        "question": "...",
        "answer": "..."
      }
    ]
  }`,
});

const practiceQuestionGeneratorFlow = ai.defineFlow(
  {
    name: 'practiceQuestionGeneratorFlow',
    inputSchema: PracticeQuestionGeneratorInputSchema,
    outputSchema: PracticeQuestionGeneratorOutputSchema,
  },
  async input => {
    const {output} = await practiceQuestionPrompt(input);
    return output!;
  }
);
