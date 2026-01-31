import type { Task, Subject, StudySession, Streak } from './types';

export const mockSubjects: Omit<Subject, 'userId'>[] = [
  { id: 'subj-1', name: 'Mathematics', color: 'hsl(var(--chart-1))' },
  { id: 'subj-2', name: 'Physics', color: 'hsl(var(--chart-2))' },
  { id: 'subj-3', name: 'History', color: 'hsl(var(--chart-3))' },
  { id: 'subj-4', name: 'Literature', color: 'hsl(var(--chart-4))' },
  { id: 'subj-5', name: 'Computer Science', color: 'hsl(var(--chart-5))' },
];

export const mockTasks: Omit<Task, 'userId'>[] = [
  {
    id: 'task-1',
    title: 'Complete Chapter 5 exercises',
    completed: false,
    priority: 'high',
    subjectId: 'subj-1',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 3)),
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
  },
  {
    id: 'task-2',
    title: 'Prepare for quiz on kinematics',
    completed: false,
    priority: 'high',
    subjectId: 'subj-2',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    createdAt: new Date(new Date().setDate(new Date().getDate() - 2)),
  },
  {
    id: 'task-3',
    title: 'Write essay on World War II',
    completed: false,
    priority: 'medium',
    subjectId: 'subj-3',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 10)),
    createdAt: new Date(new Date().setDate(new Date().getDate() - 3)),
  },
  {
    id: 'task-4',
    title: 'Read "The Great Gatsby"',
    completed: true,
    priority: 'low',
    subjectId: 'subj-4',
    dueDate: new Date(new Date().setDate(new Date().getDate() - 5)),
    createdAt: new Date(new Date().setDate(new Date().getDate() - 10)),
  },
  {
    id: 'task-5',
    title: 'Build a React component library',
    completed: false,
    priority: 'medium',
    subjectId: 'subj-5',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 20)),
    createdAt: new Date(new Date().setDate(new Date().getDate() - 4)),
  },
  {
    id: 'task-6',
    title: 'Review differential equations',
    completed: false,
    priority: 'medium',
    subjectId: 'subj-1',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
    createdAt: new Date(new Date().setDate(new Date().getDate() - 0)),
  },
  {
    id: 'task-7',
    title: 'Study for Quantum Mechanics exam',
    subjectId: 'subj-2',
    priority: 'high',
    completed: false,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    createdAt: new Date(new Date().setDate(new Date().getDate() - 5)),
  },
  {
    id: 'task-8',
    title: 'Finish reading "Pride and Prejudice"',
    subjectId: 'subj-4',
    priority: 'low',
    completed: true,
    dueDate: new Date(new Date().setDate(new Date().getDate() - 10)),
    createdAt: new Date(new Date().setDate(new Date().getDate() - 15)),
  },
  {
    id: 'task-9',
    title: 'Implement Redux in the side project',
    subjectId: 'subj-5',
    priority: 'high',
    completed: false,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 4)),
    createdAt: new Date(new Date().setDate(new Date().getDate() - 2)),
  },
  {
    id: 'task-10',
    title: 'Research the fall of the Roman Empire',
    subjectId: 'subj-3',
    priority: 'medium',
    completed: false,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
    createdAt: new Date(),
  },
  {
    id: 'task-11',
    title: 'Solve problem set 3 on linear algebra',
    subjectId: 'subj-1',
    priority: 'high',
    completed: false,
    dueDate: new Date(new Date().setDate(new Date().getDate() - 2)),
    createdAt: new Date(new Date().setDate(new Date().getDate() - 7)),
  },
  {
    id: 'task-12',
    title: 'Lab report for optics experiment',
    subjectId: 'subj-2',
    priority: 'medium',
    completed: true,
    dueDate: new Date(new Date().setDate(new Date().getDate() - 1)),
    createdAt: new Date(new Date().setDate(new Date().getDate() - 6)),
  },
];

export const mockStudySessions: Omit<StudySession, 'userId'>[] = [
  {
    id: 'session-1',
    taskId: 'task-4', // Read "The Great Gatsby" (completed)
    startTime: new Date(new Date().setDate(new Date().getDate() - 6)),
    endTime: new Date(new Date().setDate(new Date().getDate() - 6)),
    duration: 60, // 1 hour
    completed: true,
  },
  {
    id: 'session-2',
    taskId: 'task-12', // Lab report for optics experiment (completed)
    startTime: new Date(new Date().setDate(new Date().getDate() - 2)),
    endTime: new Date(new Date().setDate(new Date().getDate() - 2)),
    duration: 90, // 1.5 hours
    completed: true,
  },
  {
    id: 'session-3',
    taskId: 'task-1', // Complete Chapter 5 exercises
    startTime: new Date(new Date().setDate(new Date().getDate() - 1)),
    endTime: new Date(new Date().setDate(new Date().getDate() - 1)),
    duration: 45, // 45 minutes
    completed: false, // In progress maybe
  },
  {
    id: 'session-4',
    taskId: 'task-2', // Prepare for quiz on kinematics
    startTime: new Date(),
    endTime: new Date(),
    duration: 75, // 1.25 hours
    completed: false, // In progress
  },
  {
    id: 'session-5',
    taskId: 'task-6', // Review differential equations
    startTime: new Date(new Date().setDate(new Date().getDate() - 4)),
    endTime: new Date(new Date().setDate(new Date().getDate() - 4)),
    duration: 120, // 2 hours
    completed: true,
  },
];

export const mockStreaks: Omit<Streak, 'userId'>[] = [
  {
    id: 'streak-1',
    startDate: new Date(new Date().setDate(new Date().getDate() - 4)),
    endDate: new Date(),
    days: 5,
    longestStreak: 12,
  },
];

export function getSubjectById(subjects: Subject[], id: string) {
  return subjects.find((s) => s.id === id);
}
