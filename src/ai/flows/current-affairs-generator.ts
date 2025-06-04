
'use server';
/**
 * @fileOverview Generates current affairs summaries.
 *
 * - generateCurrentAffairs - A function that generates current affairs.
 * - CurrentAffairsGeneratorInput - The input type for the generateCurrentAffairs function.
 * - CurrentAffairsGeneratorOutput - The return type for the generateCurrentAffairs function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CurrentAffairsGeneratorInputSchema = z.object({
  category: z.enum([
      "General",
      "National",
      "International",
      "Sports",
      "Science & Technology",
      "Economy",
      "Awards & Honors",
      "Summits & Conferences"
    ]).optional().default("General").describe('Category of current affairs. Defaults to General.'),
  language: z.string().optional().default('en').describe('The preferred language for the AI response (e.g., "en", "hi"). Defaults to English.'),
});
export type CurrentAffairsGeneratorInput = z.infer<typeof CurrentAffairsGeneratorInputSchema>;

const CurrentAffairsGeneratorOutputSchema = z.object({
  summary: z.string().describe('A concise summary of recent current affairs for the given category, relevant to RRB NTPC exams.'),
});
export type CurrentAffairsGeneratorOutput = z.infer<typeof CurrentAffairsGeneratorOutputSchema>;

export async function generateCurrentAffairs(input: CurrentAffairsGeneratorInput): Promise<CurrentAffairsGeneratorOutput> {
  return currentAffairsGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'currentAffairsGeneratorPrompt',
  input: {schema: CurrentAffairsGeneratorInputSchema},
  output: {schema: CurrentAffairsGeneratorOutputSchema},
  prompt: `You are a current affairs expert. Generate a concise summary of recent (last 1-2 weeks) current affairs relevant to the RRB NTPC 2025 exam.
Focus on the category: {{{category}}}.
Please provide your summary in {{language}} if possible. If not, English is acceptable.
The summary should be factual, brief, and easy to understand for exam preparation. Present the information in bullet points or a well-structured paragraph.
Ensure the information is as up-to-date as possible within your knowledge cut-off.
Prioritize events of national and international importance, major government schemes, significant scientific developments, major sports achievements, and important economic updates relevant to India.`,
});

const currentAffairsGeneratorFlow = ai.defineFlow(
  {
    name: 'currentAffairsGeneratorFlow',
    inputSchema: CurrentAffairsGeneratorInputSchema,
    outputSchema: CurrentAffairsGeneratorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
