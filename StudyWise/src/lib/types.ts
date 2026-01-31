import type { Timestamp } from 'firebase/firestore';

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  subjectId: string;
  dueDate: Date | Timestamp;
  createdAt: Date | Timestamp;
  userId: string;
};

export type Subject = {
  id: string;
  name: string;
  color: string;
  userId: string;
};

export type StudySession = {
  id: string;
  userId: string;
  taskId: string;
  startTime: Date | Timestamp;
  endTime: Date | Timestamp;
  duration: number; // in minutes
  completed: boolean;
};

export type Streak = {
  id: string;
  userId: string;
  startDate: Date | Timestamp;
  endDate: Date | Timestamp;
  days: number;
  longestStreak: number;
};

    