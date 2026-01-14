import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Child, ChildFilter } from '../types';
import { Colors, Spacing, FontSize, BorderRadius, Members, MemberKey } from '../constants/theme';

interface ChildFilterTabsProps {
  children: Child[];
  selected: ChildFilter;
  onSelect: (filter: ChildFilter) => void;
}

export const ChildFilterTabs: React.FC<ChildFilterTabsProps> = ({
  children,
  selected,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, selected === 'all' && styles.tabActive]}
        onPress={() => onSelect('all')}
      >
        <Text style={[styles.tabText, selected === 'all' && styles.tabTextActive]}>
          전체
        </Text>
      </TouchableOpacity>

      {children.map((child) => {
        const memberColor = Members[child.id as MemberKey]?.color || Colors.accent.primary;
        const isActive = selected === child.id;

        return (
          <TouchableOpacity
            key={child.id}
            style={[
              styles.tab,
              { borderColor: memberColor },
              isActive && { backgroundColor: memberColor }
            ]}
            onPress={() => onSelect(child.id)}
          >
            <Text style={[
              styles.tabText,
              { color: memberColor },
              isActive && styles.tabTextActive
            ]}>
              {child.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    backgroundColor: Colors.ui.background,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.ui.card,
    borderWidth: 1.5,
    borderColor: Colors.ui.border,
    gap: Spacing.xs,
  },
  tabActive: {
    backgroundColor: Colors.accent.primary,
    borderColor: Colors.accent.primary,
  },
  shape: {
    fontSize: FontSize.sm,
  },
  tabText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.ui.text,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
});
