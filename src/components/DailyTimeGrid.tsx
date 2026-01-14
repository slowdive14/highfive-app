import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Task, Child, ChildFilter, MemberKey } from '../types';
import { Colors, Spacing, FontSize, BorderRadius, Members } from '../constants/theme';
import { format, startOfDay, endOfDay } from 'date-fns';
import { expandRecurringTasks } from '../utils/recurrence';

interface DailyTimeGridProps {
  tasks: Task[];
  children: Child[];
  childFilter: ChildFilter;
  date: Date;
  onTaskPress: (task: Task) => void;
}

// 시간 설정
const START_HOUR = 9;
const END_HOUR = 22;
const BLOCK_MINUTES = 30;
const SLOT_HEIGHT = 56;
const COLLAPSED_HEIGHT = 8;
const TIME_COLUMN_WIDTH = 50;

const timeToMinutes = (time: string): number => {
  if (!time) return 0;
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const generateTimeBlocks = () => {
  const blocks: { start: number; end: number; label: string }[] = [];
  for (let hour = START_HOUR; hour < END_HOUR; hour++) {
    for (let minute = 0; minute < 60; minute += BLOCK_MINUTES) {
      const startMin = hour * 60 + minute;
      blocks.push({
        start: startMin,
        end: startMin + BLOCK_MINUTES,
        label: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      });
    }
  }
  return blocks;
};

const timeBlocks = generateTimeBlocks();

const tasksOverlap = (task1: Task, task2: Task): boolean => {
  const start1 = timeToMinutes(task1.time);
  const end1 = timeToMinutes(task1.endTime) || start1 + 60;
  const start2 = timeToMinutes(task2.time);
  const end2 = timeToMinutes(task2.endTime) || start2 + 60;
  return start1 < end2 && end1 > start2;
};

const calculateTaskColumns = (tasks: Task[]): Map<string, { column: number; totalColumns: number }> => {
  const result = new Map<string, { column: number; totalColumns: number }>();
  if (tasks.length === 0) return result;

  const sorted = [...tasks].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
  const columns: Task[][] = [];

  sorted.forEach((task) => {
    let placed = false;
    for (let col = 0; col < columns.length; col++) {
      if (columns[col].every((t) => !tasksOverlap(t, task))) {
        columns[col].push(task);
        placed = true;
        break;
      }
    }
    if (!placed) columns.push([task]);
  });

  const totalColumns = columns.length;
  columns.forEach((col, colIndex) => {
    col.forEach((task) => {
      result.set(task.id, { column: colIndex, totalColumns });
    });
  });

  return result;
};

export const DailyTimeGrid: React.FC<DailyTimeGridProps> = ({
  tasks,
  children,
  childFilter,
  date,
  onTaskPress,
}) => {
  const dateStr = format(date, 'yyyy-MM-dd');

  const expandedTasks = useMemo(() => {
    return expandRecurringTasks(tasks, startOfDay(date), endOfDay(date));
  }, [tasks, date]);

  const dayTasks = useMemo(() => {
    return expandedTasks
      .filter((task) => task.date === dateStr)
      .filter((task) => childFilter === 'all' || task.childId === childFilter);
  }, [expandedTasks, dateStr, childFilter]);

  const blockHasTask = useMemo(() => {
    return timeBlocks.map((block) => {
      return dayTasks.some((task) => {
        const taskStart = timeToMinutes(task.time);
        const taskEnd = timeToMinutes(task.endTime) || taskStart + 60;
        return taskStart < block.end && taskEnd > block.start;
      });
    });
  }, [dayTasks]);

  const blockOffsets = useMemo(() => {
    const offsets: number[] = [];
    let cumulative = 0;
    timeBlocks.forEach((_, index) => {
      offsets.push(cumulative);
      cumulative += blockHasTask[index] ? SLOT_HEIGHT : COLLAPSED_HEIGHT;
    });
    return offsets;
  }, [blockHasTask]);

  const taskColumns = calculateTaskColumns(dayTasks);

  const getTaskStyle = (task: Task) => {
    const taskStart = timeToMinutes(task.time);
    const taskEnd = timeToMinutes(task.endTime) || taskStart + 60;
    const startMinutes = START_HOUR * 60;
    const endMinutes = END_HOUR * 60;

    const clampedStart = Math.max(taskStart, startMinutes);
    const clampedEnd = Math.min(taskEnd, endMinutes);
    if (clampedStart >= clampedEnd) return null;

    let top = 0, bottom = 0;
    for (let i = 0; i < timeBlocks.length; i++) {
      const block = timeBlocks[i];
      const blockHeight = blockHasTask[i] ? SLOT_HEIGHT : COLLAPSED_HEIGHT;

      if (clampedStart >= block.start && clampedStart < block.end) {
        const ratio = (clampedStart - block.start) / BLOCK_MINUTES;
        top = blockOffsets[i] + ratio * blockHeight;
      }
      if (clampedEnd > block.start && clampedEnd <= block.end) {
        const ratio = (clampedEnd - block.start) / BLOCK_MINUTES;
        bottom = blockOffsets[i] + ratio * blockHeight;
      } else if (clampedEnd > block.end) {
        bottom = blockOffsets[i] + blockHeight;
      }
    }

    return { top, height: Math.max(bottom - top, 24) };
  };

  const totalHeight = blockOffsets[blockOffsets.length - 1] +
    (blockHasTask[blockHasTask.length - 1] ? SLOT_HEIGHT : COLLAPSED_HEIGHT);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.gridContainer, { height: totalHeight }]}>
        {/* 시간 열 */}
        <View style={styles.timeColumn}>
          {timeBlocks.map((block, index) => {
            const height = blockHasTask[index] ? SLOT_HEIGHT : COLLAPSED_HEIGHT;
            return (
              <View
                key={block.label}
                style={[styles.timeSlot, { height }, !blockHasTask[index] && styles.timeSlotCollapsed]}
              >
                {blockHasTask[index] && <Text style={styles.timeLabel}>{block.label}</Text>}
              </View>
            );
          })}
        </View>

        {/* 일정 영역 */}
        <View style={styles.taskArea}>
          {/* 그리드 라인 */}
          {timeBlocks.map((block, index) => {
            const height = blockHasTask[index] ? SLOT_HEIGHT : COLLAPSED_HEIGHT;
            return (
              <View
                key={block.label}
                style={[styles.gridCell, { height }, !blockHasTask[index] && styles.gridCellCollapsed]}
              />
            );
          })}

          {/* 일정들 */}
          {dayTasks.map((task) => {
            const taskStyle = getTaskStyle(task);
            if (!taskStyle) return null;

            const columnInfo = taskColumns.get(task.id);
            const column = columnInfo?.column || 0;
            const totalColumns = columnInfo?.totalColumns || 1;
            const widthPercent = 100 / totalColumns;
            const leftPercent = column * widthPercent;

            const child = children.find(c => c.id === task.childId);
            const memberColor = child
              ? (Members[child.id as MemberKey]?.color || Colors.accent.primary)
              : Colors.ui.textMuted;

            return (
              <TouchableOpacity
                key={task.id}
                style={[
                  styles.taskBlock,
                  {
                    top: taskStyle.top,
                    height: taskStyle.height,
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                    backgroundColor: memberColor + '30',
                    borderLeftColor: memberColor,
                  },
                ]}
                onPress={() => onTaskPress(task)}
                activeOpacity={0.7}
              >
                <Text style={[styles.taskTime, { color: memberColor }]}>
                  {task.time}~{task.endTime}
                </Text>
                <Text style={[styles.taskTitle, { color: memberColor }]} numberOfLines={2}>
                  {task.title}
                </Text>
                {child && <Text style={[styles.taskChild, { color: memberColor }]}>{child.name}</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {dayTasks.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>일정이 없습니다</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
  },
  timeColumn: {
    width: TIME_COLUMN_WIDTH,
    borderRightWidth: 1,
    borderRightColor: Colors.ui.border,
    backgroundColor: Colors.ui.card,
  },
  timeSlot: {
    justifyContent: 'flex-start',
    paddingLeft: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  timeSlotCollapsed: {
    backgroundColor: Colors.ui.background,
    borderBottomColor: Colors.ui.border + '40',
  },
  timeLabel: {
    fontSize: 11,
    color: Colors.ui.textMuted,
    marginTop: 2,
  },
  taskArea: {
    flex: 1,
    position: 'relative',
    backgroundColor: Colors.ui.card,
  },
  gridCell: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  gridCellCollapsed: {
    backgroundColor: Colors.ui.background + '80',
    borderBottomColor: Colors.ui.border + '40',
  },
  taskBlock: {
    position: 'absolute',
    borderLeftWidth: 4,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  taskTime: {
    fontSize: 11,
    fontWeight: '500',
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  taskChild: {
    fontSize: 11,
    marginTop: 2,
  },
  emptyState: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.ui.textMuted,
  },
});
