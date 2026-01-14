import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DayFilter } from '../types';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { format, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';

interface DayTabsProps {
  selected: DayFilter;
  onSelect: (day: DayFilter) => void;
}

export const DayTabs: React.FC<DayTabsProps> = ({ selected, onSelect }) => {
  const today = new Date();
  const tomorrow = addDays(today, 1);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, selected === 'today' && styles.tabActive]}
        onPress={() => onSelect('today')}
      >
        <Text style={[styles.tabLabel, selected === 'today' && styles.tabLabelActive]}>
          오늘
        </Text>
        <Text style={[styles.tabDate, selected === 'today' && styles.tabDateActive]}>
          {format(today, 'M/d (E)', { locale: ko })}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, selected === 'tomorrow' && styles.tabActive]}
        onPress={() => onSelect('tomorrow')}
      >
        <Text style={[styles.tabLabel, selected === 'tomorrow' && styles.tabLabelActive]}>
          내일
        </Text>
        <Text style={[styles.tabDate, selected === 'tomorrow' && styles.tabDateActive]}>
          {format(tomorrow, 'M/d (E)', { locale: ko })}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.ui.card,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.ui.border,
  },
  tabActive: {
    backgroundColor: Colors.accent.primary,
    borderColor: Colors.accent.primary,
  },
  tabLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.ui.text,
  },
  tabLabelActive: {
    color: '#FFFFFF',
  },
  tabDate: {
    fontSize: FontSize.xs,
    color: Colors.ui.textLight,
    marginTop: 2,
  },
  tabDateActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
