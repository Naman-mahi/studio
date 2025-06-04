// Implemented the question clarification chat flow with input and output schemas.

'use server';

/**
 * @fileOverview Implements a chat interface for question clarification and discussion with an AI tutor.
 *
 * - questionClarificationChat - A function that handles the question clarification chat process.
 * - QuestionClarificationChatInput - The input type for the questionClarificationChat function.
 * - QuestionClarificationChatOutput - The return type for the questionClarificationChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuestionClarificationChatInputSchema = z.object({
  question: z.string().describe('The question to be clarified.'),
  context: z.string().optional().describe('Additional context or information about the question.'),
  previousMessages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('Previous messages in the conversation.'),
});
export type QuestionClarificationChatInput = z.infer<typeof QuestionClarificationChatInputSchema>;

const QuestionClarificationChatOutputSchema = z.object({
  answer: z.string().describe('The AI tutor\'s answer to the question.'),
});
export type QuestionClarificationChatOutput = z.infer<typeof QuestionClarificationChatOutputSchema>;

export async function questionClarificationChat(input: QuestionClarificationChatInput): Promise<QuestionClarificationChatOutput> {
  return questionClarificationChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'questionClarificationChatPrompt',
  input: {schema: QuestionClarificationChatInputSchema},
  output: {schema: QuestionClarificationChatOutputSchema},
  prompt: `You are an AI tutor helping students understand and solve problems related to RRB NTPC exams.
  Your goal is to clarify the student's questions and guide them towards the solution, not to directly give them the answer.
  Use the context and previous messages to understand the student's current understanding and provide relevant assistance.

  Question: {{{question}}}
  Context: {{{context}}}

  {{#if previousMessages}}
  Previous Messages:
  {{#each previousMessages}}
  {{#ifEquals role 'user'}}
  Student: {{{content}}}
  {{else}}
  Tutor: {{{content}}}
  {{/ifEquals}}
  {{/each}}
  {{/if}}
  `, // Changed == to ifEquals
  templateHelpers: {
    ifEquals: function(arg1: any, arg2: any, options: any) {
      return arg1 == arg2 ? options.fn(this) : options.inverse(this);
    },
  },
});

const questionClarificationChatFlow = ai.defineFlow(
  {
    name: 'questionClarificationChatFlow',
    inputSchema: QuestionClarificationChatInputSchema,
    outputSchema: QuestionClarificationChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
