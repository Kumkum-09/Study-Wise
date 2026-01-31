'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Skeleton } from '@/components/ui/skeleton';
import { AddSubjectDialog } from './add-subject-dialog';
import { Separator } from '@/components/ui/separator';

const taskFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  subjectId: z
    .string({ required_error: 'Please select a subject.' })
    .min(1, 'Please select a subject.'),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.date({ required_error: 'A due date is required.' }),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

type AddTaskDialogProps = {
  onAddTask: (
    task: Omit<Task, 'id' | 'completed' | 'createdAt' | 'userId'>
  ) => void;
  onAddSubject: (
    subject: Omit<Subject, 'id' | 'userId'>
  ) => Promise<string | undefined>;
  subjects: Subject[];
  isLoadingSubjects: boolean;
};

export function AddTaskDialog({
  onAddTask,
  onAddSubject,
  subjects,
  isLoadingSubjects,
}: AddTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [addSubjectOpen, setAddSubjectOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      priority: 'medium',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: '',
        priority: 'medium',
        subjectId: '',
        dueDate: undefined,
      });
    }
  }, [open, form]);

  function onSubmit(data: TaskFormValues) {
    onAddTask(data);
    setOpen(false);
    toast({
      title: 'Task Created',
      description: `"${data.title}" has been added to your list.`,
    });
  }

  const handleSubjectCreate = async (
    newSubject: Omit<Subject, 'id' | 'userId'>
  ) => {
    const newSubjectId = await onAddSubject(newSubject);
    setAddSubjectOpen(false);
    // The subject list will be updated via the onSnapshot listener.
    // The user can then select the new subject from the updated dropdown.
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <PlusCircle />
            Add New Task
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new task to your list.
            </DialogDescription>
          </DialogHeader>
          {isLoadingSubjects ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Chapter 3 revision"
                          {...field}
                        />
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
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subjects.length > 0 ? (
                            subjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.id}>
                                <div className="flex items-center">
                                  <span
                                    className="mr-2 h-2 w-2 rounded-full"
                                    style={{ backgroundColor: subject.color }}
                                  />
                                  {subject.name}
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                              No subjects yet.
                            </div>
                          )}
                          <Separator className="my-1" />
                          <div
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setAddSubjectOpen(true)
                            }}
                            className="cursor-pointer rounded-sm px-2 py-1.5 text-sm text-primary outline-none focus:bg-accent"
                          >
                            Add new subject...
                          </div>
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
                              field.value
                                ? format(field.value, 'yyyy-MM-dd')
                                : ''
                            }
                            onChange={(e) => {
                              if (e.target.value) {
                                // Add T00:00:00 to parse in local time zone and avoid off-by-one day issues
                                field.onChange(
                                  new Date(e.target.value + 'T00:00:00')
                                );
                              } else {
                                field.onChange(undefined);
                              }
                            }}
                            min={format(new Date(), 'yyyy-MM-dd')}
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
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Task</Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
      <AddSubjectDialog
        open={addSubjectOpen}
        onOpenChange={setAddSubjectOpen}
        addSubject={handleSubjectCreate}
      />
    </>
  );
}
