'use client';

import { MoreHorizontal } from 'lucide-react';
import type { Row, Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Task, Subject } from '@/lib/types';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EditTaskDialog } from './edit-task-dialog';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  table: Table<TData>;
}

// This is how to extend the TableMeta interface
declare module '@tanstack/react-table' {
  interface TableMeta<TData extends Record<string, unknown>> {
    deleteTask: (taskId: string) => void;
    toggleTaskStatus: (task: TData) => void;
    updateTask: (
      taskId: string,
      data: Omit<Task, 'id' | 'completed' | 'createdAt' | 'userId'>
    ) => void;
    subjects: Subject[];
  }
}

export function DataTableRowActions<TData>({
  row,
  table,
}: DataTableRowActionsProps<TData>) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const task = row.original as Task;
  const meta = table.options.meta;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onSelect={() => setShowEditDialog(true)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => meta?.toggleTaskStatus(row.original)}
          >
            {task.completed ? 'Mark as to-do' : 'Mark as done'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            onSelect={() => setShowDeleteDialog(true)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              task &quot;{task.title}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                meta?.deleteTask(task.id);
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {meta?.updateTask && meta?.subjects && (
        <EditTaskDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          task={task}
          subjects={meta.subjects}
          onUpdateTask={meta.updateTask}
        />
      )}
    </>
  );
}
