
'use server';

/**
 * @fileOverview Implements a chat interface for question clarification and discussion with an AI tutor.
 * Can optionally focus on a specific subject and topic.
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
  subject: z.string().optional().describe('The subject area the question relates to (e.g., Mathematics, General Awareness).'),
  topic: z.string().optional().describe('The specific topic within the subject (e.g., Algebra, Indian History).'),
  previousMessages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('Previous messages in the conversation.'),
  language: z.string().optional().default('en').describe('The preferred language for the AI response (e.g., "en", "hi"). Defaults to English.'),
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
  Please provide your response in {{language}} if possible. If not, English is acceptable.

  {{#if subject}}
  The student is focusing on Subject: {{{subject}}}{{#if topic}}}, Topic: {{{topic}}}{{/if}}. Tailor your guidance accordingly.
  {{else}}
  You are acting as a general AI tutor.
  {{/if}}

  Question: {{{question}}}
  {{#if context}}
  Context: {{{context}}}
  {{/if}}

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
  Tutor:`,
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
    const result = await prompt(input);
    if (!result.output || typeof result.output.answer !== 'string') {
      console.error('AI tutor (questionClarificationChatFlow) prompt did not return a valid structured output.', { input, output: result.output });
      const defaultErrorMessage = input.language === 'hi' ? "मैं वर्तमान में इस अनुरोध पर कार्रवाई करने में असमर्थ हूं। कृपया पुनः प्रयास करें या कुछ और पूछें।" : "I'm currently unable to process this request. Please try rephrasing or asking something different.";
      return { answer: defaultErrorMessage };
    }
    return result.output;
  }
);
