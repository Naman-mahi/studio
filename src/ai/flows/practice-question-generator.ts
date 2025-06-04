
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
      explanation: z.string().optional().describe('A brief explanation for the correct answer, clarifying why it is correct.'),
    })
  ).describe('An array of practice questions, their corresponding answers, and explanations.'),
});

export type PracticeQuestionGeneratorOutput = z.infer<typeof PracticeQuestionGeneratorOutputSchema>;

export async function generatePracticeQuestions(input: PracticeQuestionGeneratorInput): Promise<PracticeQuestionGeneratorOutput> {
  return practiceQuestionGeneratorFlow(input);
}

const practiceQuestionPrompt = ai.definePrompt({
  name: 'practiceQuestionPrompt',
  input: {schema: PracticeQuestionGeneratorInputSchema},
  output: {schema: PracticeQuestionGeneratorOutputSchema},
  prompt: `You are an expert in generating practice questions for the RRB NTPC 2025 exam.

  Generate {{{numQuestions}}} practice questions, their answers, and concise explanations based on the specified topic and subject.
  The questions should be relevant for the RRB NTPC 2025 Exams.

  Topic: {{{topic}}}
  Subject: {{{subject}}}

  Format the output as a JSON array of question, answer, and explanation pairs.
  The question, answer, and explanation should be plain text, not markdown.
  The explanation should clarify why the answer is correct.

  {
    "questions": [
      {
        "question": "...",
        "answer": "...",
        "explanation": "..."
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
