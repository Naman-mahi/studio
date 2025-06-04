
'use server';
/**
 * @fileOverview A general question & answer AI chat assistant.
 *
 * - askGeneralQuestion - A function that handles the general Q&A chat process.
 * - GeneralQaChatInput - The input type for the askGeneralQuestion function.
 * - GeneralQaChatOutput - The return type for the askGeneralQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneralQaChatInputSchema = z.object({
  question: z.string().describe('The question to be answered.'),
  previousMessages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('Previous messages in the conversation.'),
  language: z.string().optional().default('en').describe('The preferred language for the AI response (e.g., "en", "hi"). Defaults to English.'),
});
export type GeneralQaChatInput = z.infer<typeof GeneralQaChatInputSchema>;

const GeneralQaChatOutputSchema = z.object({
  answer: z.string().describe('The AI assistant\'s answer to the question.'),
});
export type GeneralQaChatOutput = z.infer<typeof GeneralQaChatOutputSchema>;

export async function askGeneralQuestion(input: GeneralQaChatInput): Promise<GeneralQaChatOutput> {
  return generalQaChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generalQaChatPrompt',
  input: {schema: GeneralQaChatInputSchema},
  output: {schema: GeneralQaChatOutputSchema},
  prompt: `You are a helpful AI assistant for RRB NTPC exam aspirants. Answer the user's questions directly and accurately. If the question is outside the scope of RRB NTPC preparation or general knowledge suitable for such exams, politely state that.
  Please provide your response in {{language}} if possible. If not, English is acceptable.

{{#if previousMessages}}
Previous Conversation:
{{#each previousMessages}}
{{#ifEquals role 'user'}}User: {{{content}}}{{else}}Assistant: {{{content}}}{{/ifEquals}}
{{/each}}
{{/if}}

Current Question:
User: {{{question}}}
Assistant:`,
  templateHelpers: {
    ifEquals: function(arg1: any, arg2: any, options: any) {
      return arg1 == arg2 ? options.fn(this) : options.inverse(this);
    },
  },
});

const generalQaChatFlow = ai.defineFlow(
  {
    name: 'generalQaChatFlow',
    inputSchema: GeneralQaChatInputSchema,
    outputSchema: GeneralQaChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
