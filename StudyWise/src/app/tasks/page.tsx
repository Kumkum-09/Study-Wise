'use client';
import { useMemo, useCallback } from 'react';
import {
  collection,
  doc,
  serverTimestamp,
  writeBatch,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import {
  useUser,
  useFirestore,
  useCollection,
  useMemoFirebase,
  errorEmitter,
  FirestorePermissionError,
} from '@/firebase';
import { PageHeader } from '@/components/page-header';
import { DataTable } from './components/data-table';
import { columns } from './components/columns';
import type { Task, Subject } from '@/lib/types';
import { AddTaskDialog } from './components/add-task-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  mockSubjects,
  mockTasks,
  mockStudySessions,
  mockStreaks,
} from '@/lib/mock-data';

export default function TasksPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const subjectsQuery = useMemoFirebase(
    () =>
      user ? collection(firestore, 'users', user.uid, 'subjects') : null,
    [firestore, user]
  );
  const { data: subjects, isLoading: isLoadingSubjects } = useCollection<
    Subject
  >(subjectsQuery);

  const tasksQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'tasks') : null),
    [firestore, user]
  );
  const { data: tasks, isLoading: isLoadingTasks } = useCollection<Task>(
    tasksQuery
  );

  const handleAddTask = useCallback(
    async (
      newTask: Omit<Task, 'id' | 'completed' | 'createdAt' | 'userId'>
    ) => {
      if (!user || !firestore) return;
      const tasksCollection = collection(firestore, 'users', user.uid, 'tasks');
      const data = {
        ...newTask,
        completed: false,
        createdAt: serverTimestamp(),
        userId: user.uid,
      };
      try {
        await addDoc(tasksCollection, data);
      } catch (serverError) {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: tasksCollection.path,
            operation: 'create',
            requestResourceData: data,
          })
        );
      }
    },
    [user, firestore]
  );

  const handleAddSubject = useCallback(
    async (
      newSubject: Omit<Subject, 'id' | 'userId'>
    ): Promise<string | undefined> => {
      if (!user || !firestore) return;
      const subjectsCollection = collection(
        firestore,
        'users',
        user.uid,
        'subjects'
      );
      const data = {
        ...newSubject,
        userId: user.uid,
      };
      try {
        const docRef = await addDoc(subjectsCollection, data);
        return docRef.id;
      } catch (serverError) {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: subjectsCollection.path,
            operation: 'create',
            requestResourceData: data,
          })
        );
        return undefined;
      }
    },
    [user, firestore]
  );

  const handleUpdateTask = useCallback(
    async (
      taskId: string,
      data: Omit<Task, 'id' | 'completed' | 'createdAt' | 'userId'>
    ) => {
      if (!user || !firestore) return;
      const taskRef = doc(firestore, 'users', user.uid, 'tasks', taskId);
      try {
        await updateDoc(taskRef, data);
      } catch (serverError) {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: taskRef.path,
            operation: 'update',
            requestResourceData: data,
          })
        );
      }
    },
    [user, firestore]
  );

  const handleToggleTaskStatus = useCallback(
    async (task: Task) => {
      if (!user || !firestore) return;
      const taskRef = doc(firestore, 'users', user.uid, 'tasks', task.id);
      const data = { completed: !task.completed };
      try {
        await updateDoc(taskRef, data);
      } catch (serverError) {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: taskRef.path,
            operation: 'update',
            requestResourceData: data,
          })
        );
      }
    },
    [user, firestore]
  );

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      if (!user || !firestore) return;
      const taskRef = doc(firestore, 'users', user.uid, 'tasks', taskId);
      try {
        await deleteDoc(taskRef);
      } catch (serverError) {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: taskRef.path,
            operation: 'delete',
          })
        );
      }
    },
    [user, firestore]
  );

  const tableColumns = useMemo(() => columns(subjects || []), [subjects]);

  const seedMockData = () => {
    if (!user || !firestore) return;

    const batch = writeBatch(firestore);

    // Seed Subjects
    const subjectsCollection = collection(
      firestore,
      'users',
      user.uid,
      'subjects'
    );
    mockSubjects.forEach((subject) => {
      const docRef = doc(subjectsCollection, subject.id);
      batch.set(docRef, { ...subject, userId: user.uid });
    });

    // Seed Tasks
    const tasksCollection = collection(firestore, 'users', user.uid, 'tasks');
    mockTasks.forEach((task) => {
      const docRef = doc(tasksCollection, task.id);
      batch.set(docRef, { ...task, userId: user.uid });
    });

    // Seed Study Sessions
    const studySessionsCollection = collection(
      firestore,
      'users',
      user.uid,
      'studySessions'
    );
    mockStudySessions.forEach((session) => {
      const docRef = doc(studySessionsCollection, session.id);
      batch.set(docRef, { ...session, userId: user.uid });
    });

    // Seed Streaks
    const streaksCollection = collection(
      firestore,
      'users',
      user.uid,
      'streaks'
    );
    mockStreaks.forEach((streak) => {
      const docRef = doc(streaksCollection, streak.id);
      batch.set(docRef, { ...streak, userId: user.uid });
    });

    batch.commit().catch((err) => console.error('Failed to seed data', err));
  };

  const isLoading = isUserLoading || isLoadingTasks || isLoadingSubjects;

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <PageHeader
          title="Tasks & Assignments"
          description="Manage all your academic tasks in one place."
        >
          <Skeleton className="h-10 w-36" />
        </PageHeader>
        <div className="space-y-4">
          <div className="rounded-md border bg-card">
            <Skeleton className="h-96 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <PageHeader
        title="Tasks & Assignments"
        description="Manage all your academic tasks in one place."
      >
        <AddTaskDialog
          onAddTask={handleAddTask}
          onAddSubject={handleAddSubject}
          subjects={subjects || []}
          isLoadingSubjects={isLoadingSubjects}
        />
      </PageHeader>

      {tasks && tasks.length > 0 ? (
        <DataTable
          columns={tableColumns}
          data={tasks}
          subjects={subjects || []}
          onToggleTaskStatus={handleToggleTaskStatus}
          onDeleteTask={handleDeleteTask}
          onUpdateTask={handleUpdateTask}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
          <div className="flex flex-col items-center gap-2 text-center">
            <h3 className="text-2xl font-bold tracking-tight">
              You have no tasks
            </h3>
            <p className="text-sm text-muted-foreground">
              Add a task to get started. You can also seed some example data.
            </p>
            <Button className="mt-4" onClick={seedMockData}>
              Seed Example Data
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
