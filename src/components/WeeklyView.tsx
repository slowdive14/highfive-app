import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Task, Child, ChildFilter, MemberKey } from '../types';
import { Colors, Spacing, FontSize, BorderRadius, Members } from '../constants/theme';
import { format, addDays, isSameDay, getDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { getTasksForDateRange } from '../utils/recurrence';

interface WeeklyViewProps {
  tasks: Task[];
  children: Child[];
  childFilter: ChildFilter;
  currentWeekStart: Date;
  onDayPress: (date: Date) => void;
  onTaskPress: (task: Task) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

const dayNames = ['월', '화', '수', '목', '금', '토', '일'];

// 시간 설정
const START_HOUR = 9;   // 오전 9시
const END_HOUR = 22;    // 오후 10시
const BLOCK_MINUTES = 30; // 30분 단위로 그룹화
const SLOT_HEIGHT = 48;   // 일정이 있는 블록 높이
const COLLAPSED_HEIGHT = 8; // 빈 블록 높이
const TIME_COLUMN_WIDTH = 40;

// 시간 문자열을 분으로 변환
const timeToMinutes = (time: string): number => {
  if (!time) return 0;
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

// 30분 블록 생성
const generateTimeBlocks = () => {
  const blocks: { start: number; end: number; label: string }[] = [];
  for (let hour = START_HOUR; hour < END_HOUR; hour++) {
    for (let minute = 0; minute < 60; minute += BLOCK_MINUTES) {
      const startMin = hour * 60 + minute;
      const endMin = startMin + BLOCK_MINUTES;
      blocks.push({
        start: startMin,
        end: endMin,
        label: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      });
    }
  }
  return blocks;
};

const timeBlocks = generateTimeBlocks();

// 두 일정이 겹치는지 확인
const tasksOverlap = (task1: Task, task2: Task): boolean => {
  const start1 = timeToMinutes(task1.time);
  const end1 = timeToMinutes(task1.endTime) || start1 + 60;
  const start2 = timeToMinutes(task2.time);
  const end2 = timeToMinutes(task2.endTime) || start2 + 60;
  return start1 < end2 && end1 > start2;
};

// 겹치는 일정 그룹 및 각 일정의 위치 계산 (클러스터링 적용)
const calculateTaskColumns = (tasks: Task[]): Map<string, { column: number; totalColumns: number }> => {
  const result = new Map<string, { column: number; totalColumns: number }>();
  if (tasks.length === 0) return result;

  // 1. 시작 시간순 정렬
  const sorted = [...tasks].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

  let i = 0;
  while (i < sorted.length) {
    // 2. 클러스터(서로 겹치는 일정 그룹) 구성
    const cluster = [sorted[i]];
    let clusterEnd = timeToMinutes(sorted[i].endTime) || (timeToMinutes(sorted[i].time) + 60);

    let j = i + 1;
    while (j < sorted.length) {
      const t = sorted[j];
      const tStart = timeToMinutes(t.time);

      // 클러스터의 끝 시간보다 시작 시간이 빠르면 겹치는 그룹으로 간주
      if (tStart < clusterEnd) {
        cluster.push(t);
        const tEnd = timeToMinutes(t.endTime) || (tStart + 60);
        if (tEnd > clusterEnd) clusterEnd = tEnd;
        j++;
      } else {
        break;
      }
    }

    // 3. 클러스터 내부에서 컬럼 할당 (기존 로직 적용)
    const columns: Task[][] = [];
    cluster.forEach((task) => {
      let placed = false;
      for (let col = 0; col < columns.length; col++) {
        const canPlace = columns[col].every((t) => !tasksOverlap(t, task));
        if (canPlace) {
          columns[col].push(task);
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push([task]);
      }
    });

    // 4. 결과 저장 (해당 클러스터의 최대 컬럼 수 기준)
    const totalColumns = columns.length;
    columns.forEach((col, colIndex) => {
      col.forEach((task) => {
        result.set(task.id, { column: colIndex, totalColumns });
      });
    });

    // 다음 클러스터로 이동
    i = j;
  }

  return result;
};

export const WeeklyView: React.FC<WeeklyViewProps> = ({
  tasks,
  children,
  childFilter,
  currentWeekStart,
  onDayPress,
  onTaskPress,
  onPrevWeek,
  onNextWeek,
}) => {
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  const today = new Date();
  const weekEnd = addDays(currentWeekStart, 6);

  const expandedTasks = useMemo(() => {
    return getTasksForDateRange(tasks, currentWeekStart, weekEnd);
  }, [tasks, currentWeekStart, weekEnd]);

  const getTasksForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return expandedTasks
      .filter((task) => task.date === dateStr)
      .filter((task) => childFilter === 'all' || task.childId === childFilter);
  };

  // 각 블록에 일정이 있는지 확인 (전체 주 기준)
  const blockHasTask = useMemo(() => {
    const result: boolean[] = [];
    timeBlocks.forEach((block) => {
      const hasTask = weekDays.some((date) => {
        const dayTasks = getTasksForDate(date);
        return dayTasks.some((task) => {
          const taskStart = timeToMinutes(task.time);
          const taskEnd = timeToMinutes(task.endTime) || taskStart + 60;
          // 시간 범위가 겹치는지 확인
          return taskStart < block.end && taskEnd > block.start;
        });
      });
      result.push(hasTask);
    });
    return result;
  }, [expandedTasks, childFilter, currentWeekStart]);

  // 블록들의 누적 높이 계산 (일정 위치 계산용)
  const blockOffsets = useMemo(() => {
    const offsets: number[] = [];
    let cumulative = 0;
    timeBlocks.forEach((_, index) => {
      offsets.push(cumulative);
      cumulative += blockHasTask[index] ? SLOT_HEIGHT : COLLAPSED_HEIGHT;
    });
    return offsets;
  }, [blockHasTask]);

  const weekLabel = format(currentWeekStart, 'M월', { locale: ko });

  // 일정 위치 및 크기 계산 (축소 고려)
  const getTaskStyle = (task: Task) => {
    const taskStart = timeToMinutes(task.time);
    const taskEnd = timeToMinutes(task.endTime) || taskStart + 60;
    const startMinutes = START_HOUR * 60;
    const endMinutes = END_HOUR * 60;

    // 범위 내로 클램핑
    const clampedStart = Math.max(taskStart, startMinutes);
    const clampedEnd = Math.min(taskEnd, endMinutes);

    if (clampedStart >= clampedEnd) return null;

    // 시작 블록과 끝 블록 찾기
    let top = 0;
    let bottom = 0;

    for (let i = 0; i < timeBlocks.length; i++) {
      const block = timeBlocks[i];
      const blockHeight = blockHasTask[i] ? SLOT_HEIGHT : COLLAPSED_HEIGHT;

      if (clampedStart >= block.start && clampedStart < block.end) {
        // 블록 내에서의 비율 계산
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

    const height = Math.max(bottom - top, 20);
    return { top, height };
  };

  const totalHeight = blockOffsets[blockOffsets.length - 1] +
    (blockHasTask[blockHasTask.length - 1] ? SLOT_HEIGHT : COLLAPSED_HEIGHT);

  return (
    <View style={styles.container}>
      {/* 주간 네비게이션 */}
      <View style={styles.weekNav}>
        <TouchableOpacity onPress={onPrevWeek} style={styles.navButton}>
          <Text style={styles.navButtonText}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.weekLabel}>{weekLabel}</Text>
        <TouchableOpacity onPress={onNextWeek} style={styles.navButton}>
          <Text style={styles.navButtonText}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* 요일 헤더 */}
      <View style={styles.headerRow}>
        <View style={styles.timeHeader}>
          <Text style={styles.timeHeaderText}>시간</Text>
        </View>
        {weekDays.map((date, index) => {
          const isToday = isSameDay(date, today);
          const dayName = dayNames[index];
          const dayOfWeek = getDay(date);
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

          return (
            <TouchableOpacity
              key={index}
              style={[styles.dayHeader, isToday && styles.dayHeaderToday]}
              onPress={() => onDayPress(date)}
            >
              <Text style={[
                styles.dayName,
                isWeekend && styles.dayNameWeekend,
                isToday && styles.dayNameToday
              ]}>
                {dayName}
              </Text>
              <Text style={[styles.dayDate, isToday && styles.dayDateToday]}>
                {format(date, 'd')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 시간 그리드 */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.gridContainer, { height: totalHeight }]}>
          {/* 시간 라벨 열 */}
          <View style={styles.timeColumn}>
            {timeBlocks.map((block, index) => {
              const height = blockHasTask[index] ? SLOT_HEIGHT : COLLAPSED_HEIGHT;
              const showLabel = blockHasTask[index];

              return (
                <View
                  key={block.label}
                  style={[
                    styles.timeSlot,
                    { height },
                    !blockHasTask[index] && styles.timeSlotCollapsed
                  ]}
                >
                  {showLabel && (
                    <Text style={styles.timeLabel}>{block.label}</Text>
                  )}
                </View>
              );
            })}
          </View>

          {/* 요일별 열 */}
          {weekDays.map((date, dayIndex) => {
            const dayTasks = getTasksForDate(date);
            const isToday = isSameDay(date, today);
            const taskColumns = calculateTaskColumns(dayTasks);

            return (
              <View
                key={dayIndex}
                style={[styles.dayColumn, isToday && styles.dayColumnToday]}
              >
                {/* 그리드 라인 */}
                {timeBlocks.map((block, blockIndex) => {
                  const height = blockHasTask[blockIndex] ? SLOT_HEIGHT : COLLAPSED_HEIGHT;
                  return (
                    <View
                      key={block.label}
                      style={[
                        styles.gridCell,
                        { height },
                        !blockHasTask[blockIndex] && styles.gridCellCollapsed,
                      ]}
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
                          backgroundColor: memberColor + '40',
                          borderLeftColor: memberColor,
                        },
                      ]}
                      onPress={() => onTaskPress(task)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.taskTitle, { color: memberColor }]} numberOfLines={2}>
                        {task.title}
                      </Text>
                      {taskStyle.height > 30 && (
                        <Text style={styles.taskTime}>
                          {task.time}~{task.endTime || ''}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  weekNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
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
  weekLabel: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.ui.text,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: Colors.ui.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  timeHeader: {
    width: TIME_COLUMN_WIDTH,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.ui.border,
  },
  timeHeaderText: {
    fontSize: FontSize.xs,
    color: Colors.ui.textMuted,
  },
  dayHeader: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.ui.border,
  },
  dayHeaderToday: {
    backgroundColor: Colors.accent.primary,
    borderRadius: BorderRadius.md,
    marginHorizontal: 2,
    borderRightWidth: 0,
  },
  dayName: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.ui.textLight,
  },
  dayNameWeekend: {
    color: Colors.members.songin,
  },
  dayNameToday: {
    color: '#FFFFFF',
  },
  dayDate: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.ui.text,
    marginTop: 2,
  },
  dayDateToday: {
    color: '#FFFFFF',
  },
  scrollView: {
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
    paddingLeft: 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  timeSlotCollapsed: {
    backgroundColor: Colors.ui.background,
    borderBottomColor: Colors.ui.border + '40',
  },
  timeLabel: {
    fontSize: 9,
    color: Colors.ui.textMuted,
    marginTop: 2,
  },
  dayColumn: {
    flex: 1,
    position: 'relative',
    borderRightWidth: 1,
    borderRightColor: Colors.ui.border,
    backgroundColor: Colors.ui.card,
  },
  dayColumnToday: {
    backgroundColor: '#F0F8FF',
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
    borderLeftWidth: 3,
    borderRadius: 2,
    paddingHorizontal: 2,
    paddingVertical: 1,
    overflow: 'hidden',
  },
  taskTitle: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 12,
  },
  taskTime: {
    fontSize: 8,
    color: Colors.ui.textMuted,
  },
});
