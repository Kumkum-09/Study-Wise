'use server';

import {
  generatePersonalizedStudyPlan,
  type GeneratePersonalizedStudyPlanOutput,
} from '@/ai/flows/generate-personalized-study-plan';
import { z } from 'zod';

const schema = z.object({
  prompt: z.string().min(50, {
    message:
      'Please provide more details (at least 50 characters) for a better plan.',
  }),
});

type State = {
  plan?: GeneratePersonalizedStudyPlanOutput | null;
  errors?: {
    prompt?: string[];
    _form?: string[];
  };
};

export async function createStudyPlan(
  prevState: State,
  formData: FormData
): Promise<State> {
  const validatedFields = schema.safeParse({
    prompt: formData.get('prompt'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await generatePersonalizedStudyPlan({
      prompt: validatedFields.data.prompt,
    });
    return { plan: result };
  } catch (error) {
    console.error('Error generating study plan:', error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'An unexpected error occurred. Please try again later.';
    return {
      errors: {
        _form: [errorMessage],
      },
    };
  }
}
