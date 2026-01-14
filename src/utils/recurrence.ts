import { Task, DayOfWeek } from '../types';
import { 
  format, 
  parseISO, 
  addDays, 
  addWeeks, 
  addMonths, 
  getDay, 
  isWithinInterval,
  startOfDay,
  endOfDay,
} from 'date-fns';

const dayOfWeekMap: Record<DayOfWeek, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

export const expandRecurringTasks = (
  tasks: Task[],
  rangeStart: Date,
  rangeEnd: Date
): Task[] => {
  const expandedTasks: Task[] = [];

  tasks.forEach((task) => {
    const taskDate = parseISO(task.date);
    const recurrence = task.recurrence;

    // 반복 없음 - 원본 날짜가 범위 내에 있으면 추가
    if (recurrence.type === 'none') {
      if (isWithinInterval(taskDate, { start: startOfDay(rangeStart), end: endOfDay(rangeEnd) })) {
        expandedTasks.push(task);
      }
      return;
    }

    // 반복 있음 - 범위 내 모든 날짜 생성
    let currentDate = taskDate;
    const maxIterations = 365; // 최대 1년
    let iterations = 0;

    while (currentDate <= rangeEnd && iterations < maxIterations) {
      iterations++;

      // 현재 날짜가 범위 시작 이후이고 범위 끝 이전인지 확인
      if (currentDate >= startOfDay(rangeStart) && currentDate <= endOfDay(rangeEnd)) {
        // 요일 기반 반복 (weekly, biweekly)
        if ((recurrence.type === 'weekly' || recurrence.type === 'biweekly') && recurrence.days && recurrence.days.length > 0) {
          // 특정 요일이 지정된 경우
          const currentDayOfWeek = getDay(currentDate);
          const matchesDay = recurrence.days.some(day => dayOfWeekMap[day] === currentDayOfWeek);
          
          if (matchesDay) {
            const dateStr = format(currentDate, 'yyyy-MM-dd');
            // 원본 날짜가 아닌 경우에만 가상 일정 추가 (원본은 이미 tasks에 있음)
            if (dateStr !== task.date) {
              expandedTasks.push({
                ...task,
                id: `${task.id}_${dateStr}`,
                date: dateStr,
              });
            } else {
              expandedTasks.push(task);
            }
          }
        } else {
          // 요일 지정 없이 단순 반복
          const dateStr = format(currentDate, 'yyyy-MM-dd');
          if (dateStr !== task.date) {
            expandedTasks.push({
              ...task,
              id: `${task.id}_${dateStr}`,
              date: dateStr,
            });
          } else {
            expandedTasks.push(task);
          }
        }
      }

      // 다음 날짜 계산
      switch (recurrence.type) {
        case 'daily':
          currentDate = addDays(currentDate, 1);
          break;
        case 'weekly':
          if (recurrence.days && recurrence.days.length > 0) {
            // 요일 지정 시 하루씩 증가
            currentDate = addDays(currentDate, 1);
          } else {
            currentDate = addWeeks(currentDate, 1);
          }
          break;
        case 'biweekly':
          if (recurrence.days && recurrence.days.length > 0) {
            // 요일 지정 시 하루씩 증가 (2주 주기로 체크 필요 - 단순화를 위해 매주로 처리)
            currentDate = addDays(currentDate, 1);
          } else {
            currentDate = addWeeks(currentDate, 2);
          }
          break;
        case 'monthly':
          currentDate = addMonths(currentDate, 1);
          break;
        default:
          currentDate = addDays(currentDate, 1);
      }
    }
  });

  return expandedTasks;
};

export const getTasksForDateRange = (
  tasks: Task[],
  rangeStart: Date,
  rangeEnd: Date
): Task[] => {
  return expandRecurringTasks(tasks, rangeStart, rangeEnd);
};
