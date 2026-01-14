import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Task, Child, ChildFilter, MemberKey } from '../types';
import { Colors, Spacing, FontSize, BorderRadius, ChildShapes, Members } from '../constants/theme';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { getTasksForDateRange } from '../utils/recurrence';

interface MonthlyViewProps {
  tasks: Task[];
  children: Child[];
  childFilter: ChildFilter;
  currentMonth: Date;
  onDayPress: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const dayNames = ['월', '화', '수', '목', '금', '토', '일'];

export const MonthlyView: React.FC<MonthlyViewProps> = ({
  tasks,
  children,
  childFilter,
  currentMonth,
  onDayPress,
  onPrevMonth,
  onNextMonth,
}) => {
  const today = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    calendarDays.push(day);
    day = addDays(day, 1);
  }

  const weeks: Date[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  const expandedTasks = useMemo(() => {
    return getTasksForDateRange(tasks, calendarStart, calendarEnd);
  }, [tasks, calendarStart, calendarEnd]);

  const getTasksForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return expandedTasks
      .filter((task) => task.date === dateStr)
      .filter((task) => childFilter === 'all' || task.childId === childFilter)
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const getChildById = (childId: string) => {
    return children.find((c) => c.id === childId);
  };

  const getTotalTasksForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return expandedTasks
      .filter((task) => task.date === dateStr)
      .filter((task) => childFilter === 'all' || task.childId === childFilter).length;
  };

  return (
    <View style={styles.container}>
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={onPrevMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>
          {format(currentMonth, 'yyyy년 M월', { locale: ko })}
        </Text>
        <TouchableOpacity onPress={onNextMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>▶</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dayNamesRow}>
        {dayNames.map((name, index) => (
          <View key={index} style={styles.dayNameCell}>
            <Text style={[
              styles.dayNameText,
              index === 5 && styles.dayNameSaturday,
              index === 6 && styles.dayNameSunday,
            ]}>
              {name}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView style={styles.calendarScroll} showsVerticalScrollIndicator={false}>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {week.map((date, dayIndex) => {
              const isCurrentMonth = isSameMonth(date, currentMonth);
              const isToday = isSameDay(date, today);
              const dayTasks = getTasksForDate(date);
              const totalTasks = getTotalTasksForDate(date);
              const hasMoreTasks = totalTasks > 3;

              return (
                <TouchableOpacity
                  key={dayIndex}
                  style={[
                    styles.dayCell,
                    !isCurrentMonth && styles.dayCellOtherMonth,
                    isToday && styles.dayCellToday,
                  ]}
                  onPress={() => onDayPress(date)}
                >
                  <View style={[styles.dateNumber, isToday && styles.dateNumberToday]}>
                    <Text style={[
                      styles.dateText,
                      !isCurrentMonth && styles.dateTextOtherMonth,
                      isToday && styles.dateTextToday,
                      date.getDay() === 0 && isCurrentMonth && styles.dateTextSunday,
                      date.getDay() === 6 && isCurrentMonth && styles.dateTextSaturday,
                    ]}>
                      {format(date, 'd')}
                    </Text>
                  </View>

                  <View style={styles.tasksPreview}>
                    {dayTasks.slice(0, 4).map((task) => {
                      const child = children.find(c => c.id === task.childId);
                      const memberColor = child ? (Members[child.id as MemberKey]?.color || Colors.accent.primary) : Colors.ui.textMuted;
                      return (
                        <View
                          key={task.id}
                          style={[styles.taskDot, { backgroundColor: memberColor }]}
                        />
                      );
                    })}
                    {totalTasks > 4 && (
                      <Text style={styles.moreTasksText}>+{totalTasks - 4}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <View style={styles.legend}>
        {Object.entries(Members).map(([key, member]) => (
          <View key={key} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: member.color }]} />
            <Text style={styles.legendText}>{member.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.ui.card,
  },
  navButton: {
    padding: Spacing.sm,
    backgroundColor: Colors.ui.background,
    borderRadius: BorderRadius.md,
  },
  navButtonText: {
    fontSize: FontSize.md,
    color: Colors.accent.primary,
  },
  monthLabel: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.ui.text,
  },
  dayNamesRow: {
    flexDirection: 'row',
    backgroundColor: Colors.ui.card,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
  },
  dayNameText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.ui.textLight,
  },
  dayNameSunday: {
    color: Colors.members.songin,
  },
  dayNameSaturday: {
    color: Colors.accent.primary,
  },
  calendarScroll: {
    flex: 1,
  },
  weekRow: {
    flexDirection: 'row',
    minHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  dayCell: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: Colors.ui.border,
    padding: 3,
    backgroundColor: Colors.ui.card,
  },
  dayCellOtherMonth: {
    backgroundColor: Colors.ui.background,
  },
  dayCellToday: {
    backgroundColor: '#F0F8FF',
  },
  dateNumber: {
    alignItems: 'center',
    marginBottom: 2,
  },
  dateNumberToday: {
    backgroundColor: Colors.accent.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  dateText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    color: Colors.ui.text,
  },
  dateTextOtherMonth: {
    color: Colors.ui.textMuted,
  },
  dateTextToday: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dateTextSunday: {
    color: Colors.members.songin,
  },
  dateTextSaturday: {
    color: Colors.accent.primary,
  },
  tasksPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    justifyContent: 'center',
    paddingTop: 2,
  },
  taskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  moreTasksText: {
    fontSize: 8,
    color: Colors.ui.textMuted,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.ui.card,
    borderTopWidth: 1,
    borderTopColor: Colors.ui.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: FontSize.xs,
    color: Colors.ui.textLight,
  },
});
