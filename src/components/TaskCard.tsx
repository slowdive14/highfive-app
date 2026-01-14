import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Task, Child, MemberKey } from '../types';
import { Colors, Spacing, FontSize, BorderRadius, Members } from '../constants/theme';

interface TaskCardProps {
  task: Task;
  child?: Child;
  onPress?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  child,
  onPress,
}) => {
  // Use child/person color for the card
  const memberColor = child ? (Members[child.id as MemberKey]?.color || Colors.accent.primary) : Colors.ui.textMuted;

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.card}
        onPress={() => onPress?.(task)}
      >
        <View style={[styles.memberBar, { backgroundColor: memberColor }]} />

        <View style={styles.cardContent}>
          <View style={styles.header}>
            <View style={styles.timeChildRow}>
              <Text style={styles.time}>{task.time}</Text>
              {child && (
                <View style={[styles.childBadge, { backgroundColor: memberColor + '1A' }]}>
                  <Text style={[styles.childName, { color: memberColor }]}>{child.name}</Text>
                </View>
              )}
            </View>
          </View>

          <Text style={styles.title}>{task.title}</Text>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.ui.card,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  memberBar: {
    width: 6,
  },
  cardContent: {
    flex: 1,
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  timeChildRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  time: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.ui.text,
  },
  childBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  childName: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.ui.text,
  },
});
