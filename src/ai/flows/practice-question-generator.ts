
// src/ai/flows/practice-question-generator.ts
'use server';

/**
 * @fileOverview Generates practice questions or quiz questions based on a given topic, subject, and difficulty for the RRB NTPC exam.
 *
 * - generateQuizQuestions - A function that generates practice/quiz questions.
 * - QuizQuestionGeneratorInput - The input type for the generateQuizQuestions function.
 * - QuizQuestionGeneratorOutput - The return type for the generateQuizQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuizQuestionGeneratorInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate practice questions (e.g., Algebra, History).'),
  subject: z.string().describe('The subject area (e.g., Mathematics, General Awareness).'),
  numQuestions: z.number().default(5).describe('The number of practice questions to generate (min 5, max 10).'),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional().default("Medium").describe('The difficulty level of the questions.'),
  language: z.string().optional().default('en').describe('The preferred language for the AI response (e.g., "en", "hi"). Defaults to English.'),
});

export type QuizQuestionGeneratorInput = z.infer<typeof QuizQuestionGeneratorInputSchema>;

const QuizQuestionGeneratorOutputSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe('The practice question.'),
      answer: z.string().describe('The answer to the practice question.'),
      explanation: z.string().optional().describe('A brief explanation for the correct answer, clarifying why it is correct.'),
    })
  ).describe('An array of practice questions, their corresponding answers, and explanations.'),
});

export type QuizQuestionGeneratorOutput = z.infer<typeof QuizQuestionGeneratorOutputSchema>;

export async function generateQuizQuestions(input: QuizQuestionGeneratorInput): Promise<QuizQuestionGeneratorOutput> {
  if (input.numQuestions < 5 || input.numQuestions > 10) {
    throw new Error("Number of questions must be between 5 and 10.");
  }
  return practiceQuestionGeneratorFlow(input);
}

const practiceQuestionPrompt = ai.definePrompt({
  name: 'practiceQuestionPrompt', // Internal Genkit name, can remain
  input: {schema: QuizQuestionGeneratorInputSchema},
  output: {schema: QuizQuestionGeneratorOutputSchema},
  prompt: `You are an expert in generating practice questions for the RRB NTPC 2025 exam.
  Please generate questions, answers, and explanations in {{language}} if possible. If not, English is acceptable.

  Generate {{{numQuestions}}} practice questions of {{{difficulty}}} difficulty, their answers, and concise explanations based on the specified topic and subject.
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
    name: 'practiceQuestionGeneratorFlow', // Internal Genkit name, can remain
    inputSchema: QuizQuestionGeneratorInputSchema,
    outputSchema: QuizQuestionGeneratorOutputSchema,
  },
  async input => {
    const {output} = await practiceQuestionPrompt(input);
    return output!;
  }
);

