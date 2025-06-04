
'use server';
/**
 * @fileOverview Generates a personalized study plan for RRB NTPC exams.
 *
 * - generateStudyPlan - A function that handles the study plan generation.
 * - StudyPlanGeneratorInput - The input type for the generateStudyPlan function.
 * - StudyPlanGeneratorOutput - The return type for the generateStudyPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StudyPlanGeneratorInputSchema = z.object({
  targetExam: z.string().default("RRB NTPC 2025").describe("The target examination (e.g., RRB NTPC 2025)."),
  studyDurationMonths: z.number().optional().describe("Optional total study duration in months (e.g., 3, 6, 9)."),
  hoursPerWeek: z.number().optional().describe("Optional estimated study hours per week (e.g., 10, 15, 20)."),
  subjectsToFocus: z.array(z.string()).optional().describe("Optional list of specific subjects or topics to prioritize."),
  language: z.string().optional().default('en').describe('The preferred language for the AI response (e.g., "en", "hi"). Defaults to English.'),
});
export type StudyPlanGeneratorInput = z.infer<typeof StudyPlanGeneratorInputSchema>;

const WeeklyBreakdownSchema = z.object({
  week: z.string().describe("Label for the week or period (e.g., 'Week 1-4', 'Month 1')."),
  focusAreas: z.array(z.string()).describe("Key subjects or topics to focus on during this period."),
  suggestedActivities: z.array(z.string()).describe("Specific activities or tasks for this period (e.g., 'Complete 2 chapters of X', 'Take 1 practice quiz')."),
});

const StudyPlanGeneratorOutputSchema = z.object({
  planTitle: z.string().describe("A suitable title for the generated study plan."),
  overview: z.string().describe("A brief overview or introduction to the study plan."),
  weeklyBreakdown: z.array(WeeklyBreakdownSchema).describe("A structured breakdown of the study plan by weeks or months."),
  tipsForSuccess: z.array(z.string()).describe("General tips for successful exam preparation."),
});
export type StudyPlanGeneratorOutput = z.infer<typeof StudyPlanGeneratorOutputSchema>;

export async function generateStudyPlan(input: StudyPlanGeneratorInput): Promise<StudyPlanGeneratorOutput> {
  return studyPlanGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'studyPlanGeneratorPrompt',
  input: {schema: StudyPlanGeneratorInputSchema},
  output: {schema: StudyPlanGeneratorOutputSchema},
  prompt: `You are an expert academic planner specializing in creating study plans for competitive exams like the RRB NTPC.
Generate a personalized study plan based on the following user inputs.
Please provide your response (plan title, overview, weekly breakdown, tips) in {{language}} if possible. If not, English is acceptable.

Target Exam: {{{targetExam}}}
{{#if studyDurationMonths}}Study Duration: {{{studyDurationMonths}}} months{{/if}}
{{#if hoursPerWeek}}Estimated Study Hours Per Week: {{{hoursPerWeek}}} hours{{/if}}
{{#if subjectsToFocus}}
Prioritized Subjects/Topics:
{{#each subjectsToFocus}}
- {{{this}}}
{{/each}}
{{else}}
Consider all core subjects for the RRB NTPC exam (Mathematics, General Intelligence & Reasoning, General Awareness including current affairs and general science).
{{/if}}

Structure the plan with:
1.  **planTitle**: A concise and relevant title for the plan.
2.  **overview**: A short paragraph summarizing the plan's approach.
3.  **weeklyBreakdown**: An array of objects. Each object should represent a period (e.g., "Week 1-2", "Month 1") and include:
    *   **week**: The period label.
    *   **focusAreas**: An array of strings listing key subjects/topics for that period.
    *   **suggestedActivities**: An array of strings with actionable tasks (e.g., "Cover X topic from Y subject", "Solve Z practice problems", "Revise all concepts from Week 1").
    If a specific study duration (in months) is provided, try to break the plan down by month or groups of weeks covering that duration. If not, provide a general 3-month plan structure.
    The breakdown should be logical and cover core RRB NTPC subjects comprehensively.
4.  **tipsForSuccess**: An array of 3-5 general, actionable study tips for exam success.

Ensure the output is a valid JSON object matching the defined schema.
The plan should be realistic and motivating.
Example for a weeklyBreakdown item:
{ "week": "Month 1: Weeks 1-4", "focusAreas": ["Mathematics: Number System, Percentage", "General Awareness: Ancient History"], "suggestedActivities": ["Complete Number System theory and examples", "Practice 50 Percentage problems", "Read Ancient History notes", "Take 1 weekly quiz on covered topics"] }
`,
});

const studyPlanGeneratorFlow = ai.defineFlow(
  {
    name: 'studyPlanGeneratorFlow',
    inputSchema: StudyPlanGeneratorInputSchema,
    outputSchema: StudyPlanGeneratorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output || !output.weeklyBreakdown || !Array.isArray(output.weeklyBreakdown) || output.weeklyBreakdown.length === 0) {
      console.error('AI did not return a valid study plan structure:', output);
      if (input.language === 'hi') {
           throw new Error("एआई अध्ययन योजना बनाने में विफल रहा। कृपया पुनः प्रयास करें।");
      }
      throw new Error("AI failed to generate a valid study plan. Please try again.");
    }
    return output!;
  }
);
