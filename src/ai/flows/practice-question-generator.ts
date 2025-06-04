
// src/ai/flows/practice-question-generator.ts
'use server';

/**
 * @fileOverview Generates practice quiz questions with multiple-choice options based on a given topic, subject, and difficulty for the RRB NTPC exam.
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

const QuizQuestionSchema = z.object({
  question: z.string().describe('The practice question text.'),
  options: z.array(z.string()).min(3).max(4).describe('An array of 3 to 4 multiple choice options for the question.'),
  answer: z.string().describe('The text of the correct option from the options array.'),
  explanation: z.string().optional().describe('A brief explanation for the correct answer, clarifying why it is correct.'),
});

const QuizQuestionGeneratorOutputSchema = z.object({
  questions: z.array(QuizQuestionSchema).describe('An array of practice questions, their options, correct answers, and explanations.'),
});

export type QuizQuestionGeneratorOutput = z.infer<typeof QuizQuestionGeneratorOutputSchema>;

export async function generateQuizQuestions(input: QuizQuestionGeneratorInput): Promise<QuizQuestionGeneratorOutput> {
  if (input.numQuestions < 5 || input.numQuestions > 10) {
    throw new Error("Number of questions must be between 5 and 10.");
  }
  return practiceQuestionGeneratorFlow(input);
}

const practiceQuestionPrompt = ai.definePrompt({
  name: 'practiceQuestionPrompt',
  input: {schema: QuizQuestionGeneratorInputSchema},
  output: {schema: QuizQuestionGeneratorOutputSchema},
  prompt: `You are an expert in generating multiple-choice practice questions for the RRB NTPC 2025 exam.
  Please generate questions, their options, the correct answer, and explanations in {{language}} if possible. If not, English is acceptable.

  Generate {{{numQuestions}}} multiple-choice practice questions of {{{difficulty}}} difficulty.
  Each question MUST have 3 or 4 distinct options.
  The 'answer' field MUST exactly match the text of one of the provided options.
  The questions should be relevant for the RRB NTPC 2025 Exams.

  Topic: {{{topic}}}
  Subject: {{{subject}}}

  Format the output as a JSON object containing a "questions" array. Each element in the array should be an object with "question", "options" (an array of strings), "answer" (the correct option text), and "explanation".
  The question, options, answer, and explanation should be plain text, not markdown.
  The explanation should clarify why the answer is correct.

  Example of a single question object:
  {
    "question": "What is the capital of India?",
    "options": ["Mumbai", "New Delhi", "Kolkata", "Chennai"],
    "answer": "New Delhi",
    "explanation": "New Delhi is the capital city of India, established in 1911."
  }

  Ensure the entire output is a valid JSON object matching the defined schema.
  `,
});

const practiceQuestionGeneratorFlow = ai.defineFlow(
  {
    name: 'practiceQuestionGeneratorFlow',
    inputSchema: QuizQuestionGeneratorInputSchema,
    outputSchema: QuizQuestionGeneratorOutputSchema,
  },
  async input => {
    const {output} = await practiceQuestionPrompt(input);
    if (!output || !output.questions || !Array.isArray(output.questions)) {
        console.error('AI did not return a valid questions array:', output);
        // Attempt to recover or return empty if critical
        if (input.language === 'hi') {
             throw new Error("एआई प्रश्न उत्पन्न करने में विफल रहा। कृपया पुनः प्रयास करें।");
        }
        throw new Error("AI failed to generate questions. Please try again.");
    }
    // Validate that each question has options and an answer that is one of the options
    for (const q of output.questions) {
        if (!q.options || q.options.length < 3 || q.options.length > 4) {
            console.error('AI generated a question with invalid options:', q);
            if (input.language === 'hi') {
                throw new Error(`प्रश्न "${q.question.substring(0,20)}..." के लिए अमान्य विकल्प।`);
            }
            throw new Error(`Invalid options for question "${q.question.substring(0,20)}...".`);
        }
        if (!q.options.includes(q.answer)) {
            console.error('AI generated an answer not in options:', q);
             if (input.language === 'hi') {
                throw new Error(`प्रश्न "${q.question.substring(0,20)}..." के लिए उत्तर विकल्पों में नहीं है।`);
            }
            throw new Error(`Answer for question "${q.question.substring(0,20)}..." is not in the options.`);
        }
    }
    return output!;
  }
);

