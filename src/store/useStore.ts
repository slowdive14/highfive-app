import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { generateId } from '../utils/generateId';
import { Task, Child, MemberKey, DayFilter, ChildFilter } from '../types';
import { format, addDays, parseISO, startOfDay, endOfDay } from 'date-fns';
import { expandRecurringTasks } from '../utils/recurrence';

const storage = {
  getItem: async (name: string) => {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(name);
      }
      return await AsyncStorage.getItem(name);
    } catch (e) {
      return null;
    }
  },
  setItem: async (name: string, value: string) => {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(name, value);
      } else {
        await AsyncStorage.setItem(name, value);
      }
    } catch (e) {
      // Ignore
    }
  },
  removeItem: async (name: string) => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(name);
      } else {
        await AsyncStorage.removeItem(name);
      }
    } catch (e) {
      // Ignore
    }
  },
};

interface AppState {
  tasks: Task[];
  children: Child[];
  dayFilter: DayFilter;
  childFilter: ChildFilter;

  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  addChild: (child: Omit<Child, 'id'>) => void;
  updateChild: (id: string, updates: Partial<Child>) => void;
  deleteChild: (id: string) => void;

  setDayFilter: (filter: DayFilter) => void;
  setChildFilter: (filter: ChildFilter) => void;

  getFilteredTasks: () => Task[];
  getTasksByDate: (date: string) => Task[];
}

const getToday = () => format(new Date(), 'yyyy-MM-dd');
const getTomorrow = () => format(addDays(new Date(), 1), 'yyyy-MM-dd');

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      tasks: [],
      children: [],
      dayFilter: 'today',
      childFilter: 'all',

      addTask: (taskData) => {
        const now = new Date().toISOString();
        const newTask: Task = {
          ...taskData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
      },

      updateTask: (id, updates) => {
        const baseId = id.split('_')[0];
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === baseId
              ? { ...task, ...updates, updatedAt: new Date().toISOString() }
              : task
          ),
        }));
      },

      deleteTask: (id) => {
        const baseId = id.split('_')[0];
        console.log('[Store V2] Deleting task:', id, 'Base:', baseId);
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== baseId),
        }));
      },

      addChild: (childData) => {
        const newChild: Child = {
          ...childData,
          id: generateId(),
        };
        set((state) => ({ children: [...state.children, newChild] }));
      },

      updateChild: (id, updates) => {
        set((state) => ({
          children: state.children.map((child) =>
            child.id === id ? { ...child, ...updates } : child
          ),
        }));
      },

      deleteChild: (id) => {
        set((state) => ({
          children: state.children.filter((child) => child.id !== id),
        }));
      },

      setDayFilter: (filter) => set({ dayFilter: filter }),
      setChildFilter: (filter) => set({ childFilter: filter }),

      getFilteredTasks: () => {
        const { tasks, childFilter, dayFilter } = get();
        const dateStr = dayFilter === 'today' ? getToday() : getTomorrow();
        const targetDate = parseISO(dateStr);

        const allExpanded = expandRecurringTasks(tasks, startOfDay(targetDate), endOfDay(targetDate));

        return allExpanded
          .filter((task) => task.date === dateStr)
          .filter((task) => childFilter === 'all' || task.childId === childFilter)
          .sort((a, b) => a.time.localeCompare(b.time));
      },

      getTasksByDate: (dateStr) => {
        const { tasks } = get();
        const targetDate = parseISO(dateStr);

        const allExpanded = expandRecurringTasks(tasks, startOfDay(targetDate), endOfDay(targetDate));

        return allExpanded
          .filter((task) => task.date === dateStr)
          .sort((a, b) => a.time.localeCompare(b.time));
      },
    }),
    {
      name: 'highfive-storage-v3', // v3: endTime 추가
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        tasks: state.tasks,
        children: state.children,
      }),
      // 기존 데이터 마이그레이션: endTime이 없는 task에 기본값 추가
      onRehydrateStorage: () => (state) => {
        if (state?.tasks) {
          state.tasks = state.tasks.map((task) => {
            if (!task.endTime) {
              // 시작 시간 + 1시간을 기본 종료 시간으로 설정
              const [h, m] = task.time.split(':').map(Number);
              const endH = h + 1;
              return {
                ...task,
                endTime: `${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`,
              };
            }
            return task;
          });
        }
      },
    }
  )
);
