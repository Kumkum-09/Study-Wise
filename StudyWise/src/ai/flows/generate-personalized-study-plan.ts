'use server';

/**
 * @fileOverview A flow to generate a personalized study plan based on user input.
 *
 * - generatePersonalizedStudyPlan - A function that generates a personalized study plan.
 * - GeneratePersonalizedStudyPlanInput - The input type for the generatePersonalizedStudyPlan function.
 * - GeneratePersonalizedStudyPlanOutput - The return type for the generatePersonalizedStudyPlan function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GeneratePersonalizedStudyPlanInputSchema = z.object({
  prompt: z
    .string()
    .describe(
      'A description of the course load, time constraints, and learning preferences.'
    ),
});
export type GeneratePersonalizedStudyPlanInput = z.infer<
  typeof GeneratePersonalizedStudyPlanInputSchema
>;

const DailyPlanSchema = z.object({
  day: z.string().describe('The day of the week (e.g., Monday).'),
  activities: z
    .array(z.string())
    .describe('A list of study activities or tasks for that day.'),
});

const GeneratePersonalizedStudyPlanOutputSchema = z.object({
  title: z.string().describe('A catchy title for the study plan.'),
  summary: z
    .string()
    .describe('A brief summary or introduction to the plan.'),
  dailySchedule: z
    .array(DailyPlanSchema)
    .describe('A weekly schedule with daily activities.'),
  generalAdvice: z
    .array(z.string())
    .describe('A list of general study tips or advice.'),
});
export type GeneratePersonalizedStudyPlanOutput = z.infer<
  typeof GeneratePersonalizedStudyPlanOutputSchema
>;

export async function generatePersonalizedStudyPlan(
  input: GeneratePersonalizedStudyPlanInput
): Promise<GeneratePersonalizedStudyPlanOutput> {
  return generatePersonalizedStudyPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedStudyPlanPrompt',
  input: { schema: GeneratePersonalizedStudyPlanInputSchema },
  output: { schema: GeneratePersonalizedStudyPlanOutputSchema },
  prompt: `You are an AI assistant designed to create personalized study plans for students.

  Based on the student's input, create a detailed, structured study plan.

  The output must be a JSON object that conforms to the specified schema.

  The plan should include a title, a brief summary, a day-by-day schedule, and a list of actionable general advice.

  Consider their course load, time constraints, and learning preferences to tailor the plan to their unique situation.

  Input: {{{prompt}}}`,
});

const generatePersonalizedStudyPlanFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedStudyPlanFlow',
    inputSchema: GeneratePersonalizedStudyPlanInputSchema,
    outputSchema: GeneratePersonalizedStudyPlanOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
