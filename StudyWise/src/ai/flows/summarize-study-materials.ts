'use server';
/**
 * @fileOverview An AI agent that summarizes study materials into key concepts and takeaways.
 *
 * - summarizeStudyMaterials - A function that handles the summarization process.
 * - SummarizeStudyMaterialsInput - The input type for the summarizeStudyMaterials function.
 * - SummarizeStudyMaterialsOutput - The return type for the summarizeStudyMaterials function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeStudyMaterialsInputSchema = z.object({
  studyMaterial: z
    .string()
    .describe('The study material to summarize, can be text or a link to an online resource.'),
});
export type SummarizeStudyMaterialsInput = z.infer<typeof SummarizeStudyMaterialsInputSchema>;

const SummarizeStudyMaterialsOutputSchema = z.object({
  summary: z.string().describe('The summary of the study material.'),
});
export type SummarizeStudyMaterialsOutput = z.infer<typeof SummarizeStudyMaterialsOutputSchema>;

export async function summarizeStudyMaterials(
  input: SummarizeStudyMaterialsInput
): Promise<SummarizeStudyMaterialsOutput> {
  return summarizeStudyMaterialsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeStudyMaterialsPrompt',
  input: {schema: SummarizeStudyMaterialsInputSchema},
  output: {schema: SummarizeStudyMaterialsOutputSchema},
  prompt: `You are an expert summarizer, skilled at condensing large amounts of text into key concepts and takeaways.\n\nSummarize the following study material:\n\n{{studyMaterial}}`,
});

const summarizeStudyMaterialsFlow = ai.defineFlow(
  {
    name: 'summarizeStudyMaterialsFlow',
    inputSchema: SummarizeStudyMaterialsInputSchema,
    outputSchema: SummarizeStudyMaterialsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
