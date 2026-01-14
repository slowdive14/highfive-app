import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ViewMode } from '../types';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';

interface ViewTabsProps {
  selected: ViewMode;
  onSelect: (mode: ViewMode) => void;
}

const viewOptions: { value: ViewMode; label: string; icon: string }[] = [
  { value: 'daily', label: '일간', icon: '📋' },
  { value: 'weekly', label: '주간', icon: '📅' },
  { value: 'monthly', label: '월간', icon: '🗓️' },
];

export const ViewTabs: React.FC<ViewTabsProps> = ({ selected, onSelect }) => {
  return (
    <View style={styles.container}>
      {viewOptions.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[styles.tab, selected === option.value && styles.tabActive]}
          onPress={() => onSelect(option.value)}
        >
          <Text style={styles.tabIcon}>{option.icon}</Text>
          <Text style={[styles.tabText, selected === option.value && styles.tabTextActive]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
    backgroundColor: Colors.ui.card,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.ui.background,
    gap: Spacing.xs,
  },
  tabActive: {
    backgroundColor: Colors.accent.primary,
  },
  tabIcon: {
    fontSize: FontSize.sm,
  },
  tabText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.ui.text,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
});
