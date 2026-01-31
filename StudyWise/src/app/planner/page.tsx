'use client';

import { useFormStatus } from 'react-dom';
import { useActionState } from 'react';
import { Bot, List, Loader2, Sparkle, Sparkles, Terminal } from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { createStudyPlan } from './actions';
import type { GeneratePersonalizedStudyPlanOutput } from '@/ai/flows/generate-personalized-study-plan';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

const initialState = {
  plan: null,
  errors: {},
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="gap-2">
      {pending ? (
        <>
          <Loader2 className="animate-spin" /> Generating...
        </>
      ) : (
        <>
          <Sparkles /> Generate Plan
        </>
      )}
    </Button>
  );
}

function StudyPlanDisplay({ plan }: { plan: GeneratePersonalizedStudyPlanOutput }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">{plan.title}</h2>
        <p className="text-muted-foreground">{plan.summary}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List /> Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pl-10">
          {plan.dailySchedule.map((daily) => (
            <div key={daily.day}>
              <h3 className="font-semibold text-primary">{daily.day}</h3>
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                {daily.activities.map((activity, i) => (
                  <li key={i}>{activity}</li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkle /> General Advice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-10 text-muted-foreground">
            {plan.generalAdvice.map((advice, i) => (
              <li key={i}>{advice}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}


export default function PlannerPage() {
  const [state, formAction] = useActionState(createStudyPlan, initialState);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <PageHeader
        title="AI Study Planner"
        description="Let our AI create a personalized study timetable just for you."
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Describe Your Needs</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Tell us about your subjects, available study times, deadlines,
                and learning style. The more detail, the better the plan!
              </p>
              <Textarea
                name="prompt"
                placeholder="e.g., I'm taking Calculus II, Physics I, and Intro to Philosophy. I work part-time on weekends. My Calculus final is in 3 weeks, and I have a Physics midterm next Friday..."
                rows={10}
                required
              />
              {state?.errors?.prompt && (
                <Alert variant="destructive">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Input Error</AlertTitle>
                  <AlertDescription>{state.errors.prompt}</AlertDescription>
                </Alert>
              )}
              {state?.errors?._form && (
                <Alert variant="destructive">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Something went wrong</AlertTitle>
                  <AlertDescription>{state.errors._form[0]}</AlertDescription>
                </Alert>
              )}
              <div className="flex justify-end">
                <SubmitButton />
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Your Personalized Plan</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            {state?.plan ? (
               <ScrollArea className="h-[500px] w-full rounded-md border p-4">
                  <StudyPlanDisplay plan={state.plan} />
              </ScrollArea>
            ) : (
              <div className="flex h-full items-center justify-center rounded-md border border-dashed bg-muted/50 p-8 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Bot className="size-12" />
                  <p>Your generated study plan will appear here.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
