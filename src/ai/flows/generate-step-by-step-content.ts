'use server';
/**
 * @fileOverview Generates detailed, easy-to-understand content for each step in a course.
 *
 * - generateStepContent - A function that generates content for a specific step.
 * - GenerateStepContentInput - The input type for the generateStepContent function.
 * - GenerateStepContentOutput - The return type for the generateStepContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStepContentInputSchema = z.object({
  topic: z.string().describe('The topic of the course.'),
  outline: z.string().describe('The structured course outline.'),
  stepNumber: z.number().describe('The step number for which to generate content.'),
  stepTitle: z.string().describe('The title of the step.'),
});
export type GenerateStepContentInput = z.infer<typeof GenerateStepContentInputSchema>;

const GenerateStepContentOutputSchema = z.object({
  content: z.string().describe('The detailed content for the step, formatted in Markdown. Use headings, lists, bold text, and icons to make it engaging and readable.'),
});
export type GenerateStepContentOutput = z.infer<typeof GenerateStepContentOutputSchema>;

export async function generateStepContent(input: GenerateStepContentInput): Promise<GenerateStepContentOutput> {
  return generateStepContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStepContentPrompt',
  input: {schema: GenerateStepContentInputSchema},
  output: {schema: GenerateStepContentOutputSchema},
  prompt: `You are an expert educator who can make content easy to understand and visually engaging.

  Based on the course outline and the current step, generate detailed and easy-to-understand content for the step.

  Format the content using Markdown. Use elements like headings (#, ##), bullet points (*), numbered lists (1.), bold text (**text**), and relevant emojis or icons (like 💡, 🚀, ✅) where appropriate to make the content structured, readable, and engaging.

  Topic: {{{topic}}}
  Outline: {{{outline}}}
  Step Number: {{{stepNumber}}}
  Step Title: {{{stepTitle}}}

  Content:`,
});

const generateStepContentFlow = ai.defineFlow(
  {
    name: 'generateStepContentFlow',
    inputSchema: GenerateStepContentInputSchema,
    outputSchema: GenerateStepContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
