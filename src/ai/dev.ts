
import { config } from 'dotenv';
config();

import '@/ai/flows/question-clarification-chat.ts';
import '@/ai/flows/practice-question-generator.ts'; // This flow is now for quiz questions
import '@/ai/flows/ai-question-solver.ts';
import '@/ai/flows/general-qa-chat.ts';
import '@/ai/flows/current-affairs-generator.ts';
import '@/ai/flows/study-plan-generator.ts';
