
"use server";

import { generateStudyPlan as generateStudyPlanFlow } from '@/ai/flows/study-plan-generator';
import type { StudyPlanGeneratorInput, StudyPlanGeneratorOutput } from '@/ai/flows/study-plan-generator';

export async function generateStudyPlan(input: StudyPlanGeneratorInput): Promise<StudyPlanGeneratorOutput> {
  try {
    if (!input.targetExam || input.targetExam.trim() === "") {
      throw new Error("Target exam cannot be empty.");
    }
    // Add any other specific validations for input fields if necessary
    if (input.studyDurationMonths && (input.studyDurationMonths < 1 || input.studyDurationMonths > 24)) {
        throw new Error("Study duration must be between 1 and 24 months.");
    }
    if (input.hoursPerWeek && (input.hoursPerWeek < 1 || input.hoursPerWeek > 100)) {
        throw new Error("Study hours per week must be realistic (1-100).");
    }

    return await generateStudyPlanFlow(input);
  } catch (error: any) {
    console.error("Error in generateStudyPlan action:", error);
    if (error.message) {
        throw new Error(error.message);
    }
    throw new Error("Failed to generate study plan due to an internal error.");
  }
}
