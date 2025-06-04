"use server";

import { generateCurrentAffairs as generateCurrentAffairsFlow } from '@/ai/flows/current-affairs-generator';
import type { CurrentAffairsGeneratorInput, CurrentAffairsGeneratorOutput } from '@/ai/flows/current-affairs-generator';

export async function generateCurrentAffairs(input: CurrentAffairsGeneratorInput): Promise<CurrentAffairsGeneratorOutput> {
  try {
    return await generateCurrentAffairsFlow(input);
  } catch (error) {
    console.error("Error in generateCurrentAffairs action:", error);
    throw new Error("Failed to generate current affairs due to an internal error.");
  }
}
