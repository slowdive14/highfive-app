import { ChildShape } from '../constants/theme';

export type MemberKey = 'subin' | 'songin' | 'sua' | 'seungwoo';

export type UserRole = 'admin' | 'member';

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface RecurrenceRule {
  type: 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly';
  days?: DayOfWeek[];  // 특정 요일 선택 (예: ['tue', 'thu'])
}

export interface Child {
  id: string;
  name: string;
  shape: ChildShape;
}

export interface Task {
  id: string;
  title: string;
  childId: string;
  date: string;           // YYYY-MM-DD
  time: string;           // HH:mm (시작 시간)
  endTime: string;        // HH:mm (종료 시간)
  recurrence: RecurrenceRule;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  partnerCode?: string;
}

export type DayFilter = 'today' | 'tomorrow';
export type ChildFilter = 'all' | string;  // 'all' or childId
export type ViewMode = 'daily' | 'weekly' | 'monthly';
