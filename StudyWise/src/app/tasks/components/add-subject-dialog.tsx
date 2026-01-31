'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Subject } from '@/lib/types';
import { cn } from '@/lib/utils';

const subjectColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const subjectFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  color: z.string().min(1, 'Please select a color.'),
});

type SubjectFormValues = z.infer<typeof subjectFormSchema>;

type AddSubjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addSubject: (
    subject: Omit<Subject, 'id' | 'userId'>
  ) => Promise<string | undefined>;
};

export function AddSubjectDialog({
  open,
  onOpenChange,
  addSubject,
}: AddSubjectDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: {
      name: '',
      color: subjectColors[0],
    },
  });

  async function onSubmit(data: SubjectFormValues) {
    setIsSubmitting(true);
    try {
      const newSubjectId = await addSubject(data);
      if (newSubjectId) {
        toast({
          title: 'Subject Created',
          description: `"${data.name}" has been added.`,
        });
        onOpenChange(false);
        form.reset();
      } else {
        throw new Error('Failed to get new subject ID.');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create subject. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Subject</DialogTitle>
          <DialogDescription>
            Create a new subject to categorize your tasks.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Biology" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {subjectColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => field.onChange(color)}
                          className={cn(
                            'h-8 w-8 rounded-full border-2 transition-all',
                            field.value === color
                              ? 'border-ring scale-110'
                              : 'border-transparent'
                          )}
                          style={{ backgroundColor: color }}
                          aria-label={`Select color ${color}`}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Subject'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
