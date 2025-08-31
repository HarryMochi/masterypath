import { config } from 'dotenv';
config();

import '@/ai/flows/generate-structured-course.ts';
import '@/ai/flows/generate-step-by-step-content.ts';
import '@/ai/flows/ask-step-question.ts';
