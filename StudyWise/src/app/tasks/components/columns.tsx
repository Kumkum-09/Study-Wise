'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { Task, Subject } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Circle,
  CheckCircle2,
} from 'lucide-react';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableRowActions } from './data-table-row-actions';

const priorities = [
  {
    label: 'Low',
    value: 'low',
    icon: ArrowDown,
  },
  {
    label: 'Medium',
    value: 'medium',
    icon: ArrowRight,
  },
  {
    label: 'High',
    value: 'high',
    icon: ArrowUp,
  },
];

export const columns = (subjects: Subject[]): ColumnDef<Task>[] => [
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Task" />
    ),
    cell: ({ row }) => {
      const subject = subjects.find(
        (s) => s.id === row.original.subjectId
      );
      return (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue('title')}</span>
          {subject && (
            <span className="text-xs" style={{ color: subject.color }}>
              {subject.name}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'completed',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const isCompleted = row.getValue('completed');
      const status = {
        label: isCompleted ? 'Done' : 'Todo',
        icon: isCompleted ? CheckCircle2 : Circle,
      };

      return (
        <div className="flex w-[100px] items-center">
          <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{status.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priority" />
    ),
    cell: ({ row }) => {
      const priority = priorities.find(
        (priority) => priority.value === row.getValue('priority')
      );

      if (!priority) {
        return null;
      }

      return (
        <div className="flex items-center">
          {priority.icon && (
            <priority.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{priority.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'dueDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Due Date" />
    ),
    cell: ({ row }) => {
      const dueDate = row.getValue('dueDate') as Date | { toDate: () => Date };
      const date = dueDate instanceof Date ? dueDate : dueDate.toDate();
      return <span>{format(date, 'MMM d, yyyy')}</span>;
    },
  },
  {
    id: 'actions',
    cell: ({ row, table }) => <DataTableRowActions row={row} table={table} />,
  },
];
