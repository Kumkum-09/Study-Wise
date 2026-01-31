'use client';
import { useMemo, useState, useEffect } from 'react';
import {
  BarChart as BarChartIcon,
  Book,
  CheckCircle2,
  Flame,
  ListChecks,
  PlusCircle,
  Trophy,
} from 'lucide-react';
import {
  isAfter,
  subDays,
  eachDayOfInterval,
  format,
  formatDistanceToNow,
} from 'date-fns';
import { collection, serverTimestamp, type Timestamp, addDoc } from 'firebase/firestore';
import type { ChartConfig } from '@/components/ui/chart';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Line, LineChart } from 'recharts';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useUser,
  useFirestore,
  useCollection,
  useMemoFirebase,
  errorEmitter,
  FirestorePermissionError,
} from '@/firebase';
import type { Task, Subject, StudySession, Streak } from '@/lib/types';
import { AddTaskDialog } from './tasks/components/add-task-dialog';

const toDate = (date: Date | Timestamp | null | undefined): Date | null => {
  if (!date) return null;
  return date instanceof Date ? date : date.toDate();
};

const ClientRelativeTime = ({ date }: { date: Date | null }) => {
  const [relativeTime, setRelativeTime] = useState('');

  useEffect(() => {
    if (date) {
      setRelativeTime(formatDistanceToNow(date, { addSuffix: true }));
    } else {
      setRelativeTime('date not set');
    }
  }, [date]);

  return <>{relativeTime}</>;
};

export default function Dashboard() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const subjectsQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'subjects') : null),
    [firestore, user]
  );
  const { data: subjects, isLoading: isLoadingSubjects } = useCollection<Subject>(subjectsQuery);

  const tasksQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'tasks') : null),
    [firestore, user]
  );
  const { data: tasks, isLoading: isLoadingTasks } = useCollection<Task>(tasksQuery);

  const studySessionsQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'studySessions') : null),
    [firestore, user]
  );
  const { data: studySessions, isLoading: isLoadingStudySessions } = useCollection<StudySession>(studySessionsQuery);

  const streaksQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'streaks') : null),
    [firestore, user]
  );
  const { data: streaks, isLoading: isLoadingStreaks } = useCollection<Streak>(streaksQuery);
  
  const handleAddTask = async (
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
  };

  const handleAddSubject = async (
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
  };

  const [tasksDoneLast7Days, setTasksDoneLast7Days] = useState(0);
  const [weeklyStudyHours, setWeeklyStudyHours] = useState('0.0');
  const [weeklyChartData, setWeeklyChartData] = useState<any[]>([]);

  useEffect(() => {
    if (!tasks) {
      setTasksDoneLast7Days(0);
      return;
    }
    const sevenDaysAgo = subDays(new Date(), 7);
    const count = tasks.filter(
      (task) => {
        const dueDate = toDate(task.dueDate);
        return task.completed && dueDate && isAfter(dueDate, sevenDaysAgo);
      }
    ).length;
    setTasksDoneLast7Days(count);
  }, [tasks]);

  useEffect(() => {
    if (!studySessions) {
      setWeeklyStudyHours('0.0');
      return;
    }
    const sevenDaysAgo = subDays(new Date(), 7);
    const recentSessions = studySessions.filter((session) => {
        const startTime = toDate(session.startTime);
        return startTime && isAfter(startTime, sevenDaysAgo);
    });
    const totalMinutes = recentSessions.reduce(
      (sum, session) => sum + session.duration,
      0
    );
    setWeeklyStudyHours((totalMinutes / 60).toFixed(1));
  }, [studySessions]);
  
  useEffect(() => {
    if (!studySessions) {
      setWeeklyChartData([]);
      return;
    }
    const today = new Date();
    const sevenDaysAgo = subDays(today, 6);
    const dateRange = eachDayOfInterval({ start: sevenDaysAgo, end: today });
  
    const dailyHours = dateRange.map((day) => ({
      day: format(day, 'eeee'),
      hours: 0,
    }));
  
    studySessions.forEach((session) => {
      const sessionDate = toDate(session.startTime);
      if (sessionDate && isAfter(sessionDate, sevenDaysAgo)) {
        const dayIndex = dailyHours.findIndex(
          (d) => d.day === format(sessionDate, 'eeee')
        );
        if (dayIndex !== -1) {
          dailyHours[dayIndex].hours += session.duration / 60;
        }
      }
    });
    setWeeklyChartData(dailyHours);
  }, [studySessions]);


  const isLoading =
    isUserLoading ||
    isLoadingSubjects ||
    isLoadingTasks ||
    isLoadingStudySessions ||
    isLoadingStreaks;

  const { currentStreak, longestStreak } = useMemo(() => {
    if (!streaks || streaks.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }
    // Assuming one streak doc per user for simplicity
    const streakDoc = streaks[0];
    return {
      currentStreak: streakDoc.days || 0,
      longestStreak: streakDoc.longestStreak || 0,
    };
  }, [streaks]);
  
  const weeklyChartConfig = {
    hours: { label: 'Study Hours', color: 'hsl(var(--primary))' },
  } satisfies ChartConfig;

  const { subjectTimeData, subjectChartConfig } = useMemo(() => {
    if (!studySessions || !tasks || !subjects) {
      return { subjectTimeData: [], subjectChartConfig: {} };
    }

    const taskMap = new Map(tasks.map((task) => [task.id, task.subjectId]));
    const subjectDurations: { [key: string]: number } = {};

    studySessions.forEach((session) => {
      const subjectId = taskMap.get(session.taskId);
      if (subjectId) {
        subjectDurations[subjectId] =
          (subjectDurations[subjectId] || 0) + session.duration;
      }
    });

    const subjectTimeData = Object.entries(subjectDurations).map(
      ([subjectId, duration]) => {
        const subject = subjects.find((s) => s.id === subjectId);
        return {
          subject: subject?.name || 'Unknown',
          time: parseFloat((duration / 60).toFixed(1)),
          fill: subject?.color || '#ccc',
        };
      }
    );

    const subjectChartConfig = subjects.reduce((acc, subject) => {
      acc[subject.name] = { label: subject.name, color: subject.color };
      return acc;
    }, {} as ChartConfig);

    return { subjectTimeData, subjectChartConfig };
  }, [studySessions, tasks, subjects]);
  
  const taskCompletionData = useMemo(() => {
    if (!tasks) return [];
    const monthlyData: { [key: string]: { month: string, completed: number, created: number } } = {};

    tasks.forEach(task => {
      const createdDate = toDate(task.createdAt);
      if (!createdDate) return;
      const monthKey = format(createdDate, 'yyyy-MM');
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: format(createdDate, 'MMM'), completed: 0, created: 0 };
      }
      monthlyData[monthKey].created++;
      if (task.completed) {
        monthlyData[monthKey].completed++;
      }
    });

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }, [tasks]);

  const taskChartConfig = {
    completed: { label: 'Tasks Completed', color: 'hsl(var(--primary))' },
    created: { label: 'Tasks Created', color: 'hsl(var(--muted-foreground))' },
  } satisfies ChartConfig;

  const upcomingTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks
      .filter((task) => !task.completed)
      .sort((a, b) => {
        const dateA = toDate(a.dueDate);
        const dateB = toDate(b.dueDate);
        if (dateA && !dateB) return -1;
        if (!dateA && dateB) return 1;
        if (!dateA && !dateB) return 0;
        return dateA!.getTime() - dateB!.getTime();
      })
      .slice(0, 4);
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <PageHeader
          title="Dashboard"
          description="Welcome back! Here's a snapshot of your study progress."
        >
          <Skeleton className="h-10 w-36" />
        </PageHeader>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-2/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 gap-6">
              <Card><CardHeader><Skeleton className="h-8 w-40 mb-2" /><Skeleton className="h-4 w-60" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
              <Card><CardHeader><Skeleton className="h-8 w-40 mb-2" /><Skeleton className="h-4 w-60" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="grid grid-cols-1 gap-6">
              <Card><CardHeader><Skeleton className="h-8 w-40 mb-2" /><Skeleton className="h-4 w-60" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
              <Card><CardHeader><Skeleton className="h-8 w-40 mb-2" /><Skeleton className="h-4 w-60" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's a snapshot of your study progress."
      >
        <AddTaskDialog
          onAddTask={handleAddTask}
          onAddSubject={handleAddSubject}
          subjects={subjects || []}
          isLoadingSubjects={isLoadingSubjects}
        />
      </PageHeader>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Done</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasksDoneLast7Days}</div>
            <p className="text-xs text-muted-foreground">in the last 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStreak} days</div>
            <p className="text-xs text-muted-foreground">Keep it going!</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Hours</CardTitle>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyStudyHours} hrs</div>
            <p className="text-xs text-muted-foreground">this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{longestStreak} days</div>
            <p className="text-xs text-muted-foreground">Your personal best!</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="grid gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Study Activity</CardTitle>
              <CardDescription>
                Here are your study hours for the last 7 days.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={weeklyChartConfig} className="h-64 w-full">
                <BarChart accessibilityLayer data={weeklyChartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Bar dataKey="hours" fill="var(--color-hours)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Task Completion Trend</CardTitle>
              <CardDescription>
                Your task completion rate over the last months.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={taskChartConfig} className="h-64 w-full">
                <LineChart
                  accessibilityLayer
                  data={taskCompletionData}
                  margin={{ left: 12, right: 12, }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Line
                    dataKey="completed"
                    type="monotone"
                    stroke="var(--color-completed)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    dataKey="created"
                    type="monotone"
                    stroke="var(--color-created)"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader className='flex-row items-center justify-between'>
              <div>
                <CardTitle>Upcoming Tasks</CardTitle>
                <CardDescription>Don't miss these deadlines!</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/tasks">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {upcomingTasks.length > 0 ? (
                <ul className="space-y-4">
                  {upcomingTasks.map((task) => {
                    const subject = subjects?.find(
                      (s) => s.id === task.subjectId
                    );
                    const dueDate = toDate(task.dueDate);
                    return (
                      <li key={task.id} className="flex items-start gap-4">
                        <div
                          className="mt-1 h-3 w-3 flex-shrink-0 rounded-full"
                          style={{
                            backgroundColor:
                              subject?.color || 'hsl(var(--muted))',
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-medium leading-none">
                            {task.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Due <ClientRelativeTime date={dueDate} />
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12 text-center">
                  <ListChecks className="size-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No upcoming tasks. You're all caught up!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Time Spent Per Subject</CardTitle>
              <CardDescription>
                Breakdown of your study hours this month.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={subjectChartConfig}
                className="mx-auto aspect-square max-h-[250px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={subjectTimeData}
                    dataKey="time"
                    nameKey="subject"
                    innerRadius={50}
                    strokeWidth={5}
                  />
                  <ChartLegend
                    content={<ChartLegendContent nameKey="subject" />}
                    className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                  />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
