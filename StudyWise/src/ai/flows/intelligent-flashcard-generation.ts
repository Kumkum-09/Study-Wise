'use server';
/**
 * @fileOverview This file defines a Genkit flow for intelligent flashcard generation from study materials.
 *
 * The flow takes study materials as input and generates a set of flashcards based on key concepts,
 * vocabulary, and important facts.
 *
 * @fileOverview
 * - `generateFlashcards`: The main function to generate flashcards. Accepts study material and returns a list of flashcards.
 * - `FlashcardGenerationInput`: The input type for `generateFlashcards`, defining the structure of the study material.
 * - `FlashcardGenerationOutput`: The output type for `generateFlashcards`, defining the structure of a flashcard.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FlashcardSchema = z.object({
  front: z.string().describe('The question or term on the front of the flashcard.'),
  back: z.string().describe('The answer or definition on the back of the flashcard.'),
});

export type Flashcard = z.infer<typeof FlashcardSchema>;

const FlashcardGenerationInputSchema = z.object({
  studyMaterial: z
    .string()
    .describe(
      'The study material to generate flashcards from. Should be text content, such as lecture notes, textbook chapters, or articles.'
    ),
});

export type FlashcardGenerationInput = z.infer<typeof FlashcardGenerationInputSchema>;

const FlashcardGenerationOutputSchema = z.array(FlashcardSchema).describe('A list of generated flashcards.');

export type FlashcardGenerationOutput = z.infer<typeof FlashcardGenerationOutputSchema>;

export async function generateFlashcards(input: FlashcardGenerationInput): Promise<FlashcardGenerationOutput> {
  return intelligentFlashcardGenerationFlow(input);
}

const intelligentFlashcardGenerationPrompt = ai.definePrompt({
  name: 'intelligentFlashcardGenerationPrompt',
  input: {schema: FlashcardGenerationInputSchema},
  output: {schema: FlashcardGenerationOutputSchema},
  prompt: `You are an expert educator skilled at creating effective flashcards.

  Given the following study material, generate a list of flashcards that cover the key concepts, vocabulary, and important facts.

  Study Material:
  {{studyMaterial}}

  Each flashcard should have a clear question or term on the front and a concise answer or definition on the back.
  Focus on creating flashcards that will help students efficiently review and memorize the information.

  {{#each this}}
  Front: {{front}}
  Back: {{back}}
  {{/each}}`,
});

const intelligentFlashcardGenerationFlow = ai.defineFlow(
  {
    name: 'intelligentFlashcardGenerationFlow',
    inputSchema: FlashcardGenerationInputSchema,
    outputSchema: FlashcardGenerationOutputSchema,
  },
  async input => {
    const {output} = await intelligentFlashcardGenerationPrompt(input);
    return output!;
  }
);
