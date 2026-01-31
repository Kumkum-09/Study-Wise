'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Task, Subject } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const taskFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  subjectId: z
    .string({ required_error: 'Please select a subject.' })
    .min(1, 'Please select a subject.'),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.date({ required_error: 'A due date is required.' }),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

type EditTaskDialogProps = {
  task: Task;
  subjects: Subject[];
  onUpdateTask: (
    taskId: string,
    data: Omit<Task, 'id' | 'completed' | 'createdAt' | 'userId'>
  ) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditTaskDialog({
  task,
  subjects,
  onUpdateTask,
  open,
  onOpenChange,
}: EditTaskDialogProps) {
  const { toast } = useToast();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
  });

  useEffect(() => {
    if (task && open) {
      const dueDate =
        task.dueDate instanceof Date ? task.dueDate : task.dueDate.toDate();
      form.reset({
        title: task.title,
        subjectId: task.subjectId,
        priority: task.priority,
        dueDate: dueDate,
      });
    }
  }, [task, open, form]);

  function onSubmit(data: TaskFormValues) {
    onUpdateTask(task.id, data);
    onOpenChange(false);
    toast({
      title: 'Task Updated',
      description: `"${data.title}" has been updated.`,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Make changes to your task here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Chapter 3 revision" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          <div className="flex items-center">
                            <span
                              className="mr-2 h-2 w-2 rounded-full"
                              style={{ backgroundColor: subject.color }}
                            />
                            {subject.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={
                          field.value ? format(field.value, 'yyyy-MM-dd') : ''
                        }
                        onChange={(e) => {
                          if (e.target.value) {
                            field.onChange(
                              new Date(e.target.value + 'T00:00:00')
                            );
                          } else {
                            field.onChange(undefined);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
