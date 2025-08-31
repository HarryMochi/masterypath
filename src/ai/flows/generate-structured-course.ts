// src/ai/flows/generate-structured-course.ts
'use server';

/**
 * @fileOverview Generates a structured course outline based on the selected topic and depth.
 *
 * - generateStructuredCourse - A function that generates a structured course outline.
 * - GenerateStructuredCourseInput - The input type for the generateStructuredCourse function.
 * - GenerateStructuredCourseOutput - The return type for the generateStructuredCourse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStructuredCourseInputSchema = z.object({
  topic: z.string().describe('The topic of the course.'),
  depth: z.enum(['20', '50', '100']).describe('The depth of the course (20 for overview, 50 for deep dive, 100 for mastery).'),
});

export type GenerateStructuredCourseInput = z.infer<typeof GenerateStructuredCourseInputSchema>;

const GenerateStructuredCourseOutputSchema = z.object({
  courseOutline: z.array(z.object({
    step: z.number().describe('The step number.'),
    title: z.string().describe('The title of the step.'),
    description: z.string().describe('A brief description of what the step covers.'),
  })).describe('A structured course outline with the specified number of steps.'),
});

export type GenerateStructuredCourseOutput = z.infer<typeof GenerateStructuredCourseOutputSchema>;

export async function generateStructuredCourse(input: GenerateStructuredCourseInput): Promise<GenerateStructuredCourseOutput> {
  return generateStructuredCourseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStructuredCoursePrompt',
  input: {schema: GenerateStructuredCourseInputSchema},
  output: {schema: GenerateStructuredCourseOutputSchema},
  prompt: `You are an AI course generator that can create a structured course outline based on a topic and desired depth.

    Your goal is to create a course that can take a user from a beginner level to mastery for the given topic.

    - For a '20' step course, create a high-level overview.
    - For a '50' step course, create a detailed, in-depth course.
    - For a '100' step course, create a comprehensive, expert-level course designed for mastery. It should cover fundamentals, advanced topics, practical applications, and best practices.

    Topic: {{{topic}}}
    Depth: {{{depth}}} steps

    Generate a structured course outline with the specified number of steps for the given topic. The course outline should be detailed and comprehensive, ensuring a clear learning path for users. The content language should be easy to understand.
    The output should be a well-structured course outline ready to be displayed in the UI.`,
});

const generateStructuredCourseFlow = ai.defineFlow(
  {
    name: 'generateStructuredCourseFlow',
    inputSchema: GenerateStructuredCourseInputSchema,
    outputSchema: GenerateStructuredCourseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
