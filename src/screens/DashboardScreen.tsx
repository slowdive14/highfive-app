import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { useConvexStore } from '../store/useConvexStore';
import {
  TaskCard,
  DayTabs,
  ChildFilterTabs,
  AddTaskModal,
  AddChildModal,
  EditTaskModal,
  ViewTabs,
  WeeklyView,
  MonthlyView,
  DailyTimeGrid,
} from '../components';
import { Colors, Spacing, FontSize, BorderRadius, Members, MemberKey } from '../constants/theme';
import { Task, ViewMode, Child } from '../types';
import { startOfWeek, addWeeks, addMonths, format, addDays } from 'date-fns';

export const DashboardScreen: React.FC = () => {
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [childModalVisible, setChildModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const logout = useAuthStore((state) => state.logout);

  const {
    tasks,
    children,
    dayFilter,
    childFilter,
    setDayFilter,
    setChildFilter,
    getFilteredTasks,
    updateTask,
    deleteTask,
    addTask,
    addChild,
  } = useConvexStore();

  // "Child" list now includes Parents (Subin, Songin) for scheduling purposes
  const allMembers: Child[] = [
    ...children,
    { id: 'sua', name: '수아', shape: 'star' },
    { id: 'seungwoo', name: '승우', shape: 'triangle' },
    { id: 'subin', name: '수빈', shape: 'circle' },
    { id: 'songin', name: '송인', shape: 'square' },
  ];

  const handleAddTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    addTask(taskData);
  };

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    updateTask(id, updates);
  };

  const filteredTasks = getFilteredTasks();

  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
    setEditModalVisible(true);
  };

  const getChildById = (childId: string) => {
    return allMembers.find((c) => c.id === childId);
  };

  const handleDayPress = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateStr = format(date, 'yyyy-MM-dd');
    const todayStr = format(today, 'yyyy-MM-dd');
    const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');

    if (dateStr === todayStr) {
      setDayFilter('today');
    } else if (dateStr === tomorrowStr) {
      setDayFilter('tomorrow');
    }
    setViewMode('daily');
  };

  const sortedTasks = [...filteredTasks].sort((a, b) => a.time.localeCompare(b.time));
  const hasChildren = allMembers.length > 0; // Always true due to parents

  const memberKeys = Object.keys(Members) as MemberKey[];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.ui.background} />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>하이파이브</Text>
            <Text style={styles.headerSubtitle}>가족 스케줄 관리 ✋</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
        </View>

        {/* View Mode Tabs */}
        <ViewTabs selected={viewMode} onSelect={setViewMode} />

        {/* Child Filter */}
        {hasChildren && (
          <ChildFilterTabs
            children={allMembers}
            selected={childFilter}
            onSelect={setChildFilter}
          />
        )}

        {/* Content based on View Mode */}
        {viewMode === 'daily' && (
          <>
            <DayTabs selected={dayFilter} onSelect={setDayFilter} />

            {!hasChildren ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>👶</Text>
                <Text style={styles.emptyText}>먼저 아이를 등록해주세요</Text>
                <TouchableOpacity
                  style={styles.addChildButton}
                  onPress={() => setChildModalVisible(true)}
                >
                  <Text style={styles.addChildButtonText}>+ 아이 등록하기</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <DailyTimeGrid
                tasks={tasks}
                children={allMembers}
                childFilter={childFilter}
                date={dayFilter === 'today' ? new Date() : addDays(new Date(), 1)}
                onTaskPress={handleTaskPress}
              />
            )}
          </>
        )}

        {viewMode === 'weekly' && hasChildren && (
          <WeeklyView
            tasks={tasks}
            children={allMembers}
            childFilter={childFilter}
            currentWeekStart={currentWeekStart}
            onDayPress={handleDayPress}
            onTaskPress={handleTaskPress}
            onPrevWeek={() => setCurrentWeekStart(addWeeks(currentWeekStart, -1))}
            onNextWeek={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
          />
        )}

        {viewMode === 'monthly' && hasChildren && (
          <MonthlyView
            tasks={tasks}
            children={allMembers}
            childFilter={childFilter}
            currentMonth={currentMonth}
            onDayPress={handleDayPress}
            onPrevMonth={() => setCurrentMonth(addMonths(currentMonth, -1))}
            onNextMonth={() => setCurrentMonth(addMonths(currentMonth, 1))}
          />
        )}

        {(viewMode === 'weekly' || viewMode === 'monthly') && !hasChildren && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>👶</Text>
            <Text style={styles.emptyText}>먼저 아이를 등록해주세요</Text>
            <TouchableOpacity
              style={styles.addChildButton}
              onPress={() => setChildModalVisible(true)}
            >
              <Text style={styles.addChildButtonText}>+ 아이 등록하기</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* FAB - 일정 추가 */}
        {hasChildren && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setTaskModalVisible(true)}
          >
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        )}

        <AddTaskModal
          visible={taskModalVisible}
          onClose={() => setTaskModalVisible(false)}
          onSubmit={handleAddTask}
          children={allMembers}
        />

        <AddChildModal
          visible={childModalVisible}
          onClose={() => setChildModalVisible(false)}
          onSubmit={addChild}
        />

        <EditTaskModal
          visible={editModalVisible}
          task={selectedTask}
          onClose={() => {
            setEditModalVisible(false);
            setSelectedTask(null);
          }}
          onSubmit={updateTask}
          onDelete={deleteTask}
          children={allMembers}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.ui.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.ui.background,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.ui.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.ui.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.ui.textLight,
    marginTop: 2,
  },
  timeline: {
    flex: 1,
  },
  timelineContent: {
    paddingVertical: Spacing.md,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: FontSize.lg,
    color: Colors.ui.text,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    fontSize: FontSize.sm,
    color: Colors.ui.textMuted,
  },
  addChildButton: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.accent.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  addChildButtonText: {
    color: '#FFFFFF',
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: FontSize.xxl,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  logoutButton: {
    padding: Spacing.sm,
  },
  logoutText: {
    fontSize: FontSize.sm,
    color: Colors.ui.textMuted,
    textDecorationLine: 'underline',
  },
});
