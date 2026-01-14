import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { Task, Child, DayFilter, ChildFilter } from '../types';
import { useState, useMemo } from 'react';
import { format, addDays, parseISO, startOfDay, endOfDay } from 'date-fns';
import { expandRecurringTasks } from '../utils/recurrence';

const getToday = () => format(new Date(), 'yyyy-MM-dd');
const getTomorrow = () => format(addDays(new Date(), 1), 'yyyy-MM-dd');

// Convex 데이터를 앱 타입으로 변환
const convertTask = (task: any): Task => ({
  id: task._id,
  title: task.title,
  childId: task.childId,
  date: task.date,
  time: task.time,
  endTime: task.endTime,
  recurrence: task.recurrence,
  createdAt: task._creationTime?.toString() || new Date().toISOString(),
  updatedAt: task._creationTime?.toString() || new Date().toISOString(),
});

const convertChild = (child: any): Child => ({
  id: child._id,
  name: child.name,
  shape: child.shape,
});

export const useConvexStore = () => {
  const [dayFilter, setDayFilter] = useState<DayFilter>('today');
  const [childFilter, setChildFilter] = useState<ChildFilter>('all');

  // Convex 쿼리
  const rawTasks = useQuery(api.tasks.list) || [];
  const rawChildren = useQuery(api.children.list) || [];

  // Convex 뮤테이션
  const addTaskMutation = useMutation(api.tasks.add);
  const updateTaskMutation = useMutation(api.tasks.update);
  const deleteTaskMutation = useMutation(api.tasks.remove);
  const addChildMutation = useMutation(api.children.add);
  const updateChildMutation = useMutation(api.children.update);
  const deleteChildMutation = useMutation(api.children.remove);

  // 데이터 변환
  const tasks = useMemo(() => rawTasks.map(convertTask), [rawTasks]);
  const children = useMemo(() => rawChildren.map(convertChild), [rawChildren]);

  // 액션 함수들
  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    await addTaskMutation({
      title: taskData.title,
      childId: taskData.childId,
      date: taskData.date,
      time: taskData.time,
      endTime: taskData.endTime,
      recurrence: taskData.recurrence,
    });
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const baseId = id.split('_')[0] as Id<'tasks'>;
    const { id: _, createdAt, updatedAt, ...validUpdates } = updates as any;
    await updateTaskMutation({ id: baseId, ...validUpdates });
  };

  const deleteTask = async (id: string) => {
    const baseId = id.split('_')[0] as Id<'tasks'>;
    await deleteTaskMutation({ id: baseId });
  };

  const addChild = async (childData: Omit<Child, 'id'>) => {
    await addChildMutation(childData);
  };

  const updateChild = async (id: string, updates: Partial<Child>) => {
    const { id: _, ...validUpdates } = updates as any;
    await updateChildMutation({ id: id as Id<'children'>, ...validUpdates });
  };

  const deleteChild = async (id: string) => {
    await deleteChildMutation({ id: id as Id<'children'> });
  };

  const getFilteredTasks = () => {
    const dateStr = dayFilter === 'today' ? getToday() : getTomorrow();
    const targetDate = parseISO(dateStr);

    const allExpanded = expandRecurringTasks(tasks, startOfDay(targetDate), endOfDay(targetDate));

    return allExpanded
      .filter((task) => task.date === dateStr)
      .filter((task) => childFilter === 'all' || task.childId === childFilter)
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const getTasksByDate = (dateStr: string) => {
    const targetDate = parseISO(dateStr);
    const allExpanded = expandRecurringTasks(tasks, startOfDay(targetDate), endOfDay(targetDate));

    return allExpanded
      .filter((task) => task.date === dateStr)
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  return {
    tasks,
    children,
    dayFilter,
    childFilter,
    setDayFilter,
    setChildFilter,
    addTask,
    updateTask,
    deleteTask,
    addChild,
    updateChild,
    deleteChild,
    getFilteredTasks,
    getTasksByDate,
  };
};
