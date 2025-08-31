'use server';

import { generateStructuredCourse, type GenerateStructuredCourseInput, type GenerateStructuredCourseOutput } from '@/ai/flows/generate-structured-course';
import { generateStepContent, type GenerateStepContentInput } from '@/ai/flows/generate-step-by-step-content';
import { askStepQuestion, type AskStepQuestionInput, type AskStepQuestionOutput } from '@/ai/flows/ask-step-question';

export async function generateCourseAction(input: GenerateStructuredCourseInput): Promise<GenerateStructuredCourseOutput> {
    try {
        const result = await generateStructuredCourse(input);
        if (!result.courseOutline || result.courseOutline.length === 0) {
            throw new Error("The AI failed to generate a course for this topic. Please try a different topic.");
        }
        return result;
    } catch (error) {
        console.error("Error in generateCourseAction:", error);
        throw new Error("Failed to generate course from AI service.");
    }
}

export async function generateStepContentAction(input: GenerateStepContentInput) {
    try {
        return await generateStepContent(input);
    } catch (error) {
        console.error("Error in generateStepContentAction:", error);
        throw new Error("Failed to generate step content from AI service.");
    }
}

export async function askQuestionAction(input: AskStepQuestionInput): Promise<AskStepQuestionOutput> {
    try {
        return await askStepQuestion(input);
    } catch (error) {
        console.error("Error in askQuestionAction:", error);
        throw new Error("Failed to get answer from AI service.");
    }
}
