import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Task, Child, DayOfWeek, RecurrenceRule, MemberKey } from '../types';
import { Colors, Spacing, FontSize, BorderRadius, ChildShapes, Members, MemberKey as MemberKeyType } from '../constants/theme';

interface EditTaskModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onSubmit: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  children: Child[];
}

type RecurrenceType = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly';

const recurrenceOptions: { value: RecurrenceType; label: string }[] = [
  { value: 'none', label: '반복 안함' },
  { value: 'daily', label: '매일' },
  { value: 'weekly', label: '매주' },
  { value: 'biweekly', label: '격주' },
  { value: 'monthly', label: '매월' },
];

const dayOptions: { value: DayOfWeek; label: string }[] = [
  { value: 'mon', label: '월' },
  { value: 'tue', label: '화' },
  { value: 'wed', label: '수' },
  { value: 'thu', label: '목' },
  { value: 'fri', label: '금' },
  { value: 'sat', label: '토' },
  { value: 'sun', label: '일' },
];



export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  visible,
  task,
  onClose,
  onSubmit,
  onDelete,
  children,
}) => {
  const [title, setTitle] = useState('');
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [date, setDate] = useState('');
  const [hour, setHour] = useState('14');
  const [minute, setMinute] = useState('00');
  const [endHour, setEndHour] = useState('15');
  const [endMinute, setEndMinute] = useState('00');

  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('none');
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setSelectedChild(task.childId);
      setDate(task.date);
      const [h, m] = task.time.split(':');
      setHour(h || '14');
      setMinute(m || '00');

      const [eh, em] = (task.endTime || '15:00').split(':');
      setEndHour(eh || '15');
      setEndMinute(em || '00');

      setRecurrenceType(task.recurrence.type);
      setSelectedDays(task.recurrence.days || []);
    }
  }, [task]);

  const toggleDay = (day: DayOfWeek) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = () => {
    if (!title.trim() || !selectedChild || !task) return;

    const recurrence: RecurrenceRule = {
      type: recurrenceType,
      days: recurrenceType === 'weekly' || recurrenceType === 'biweekly'
        ? selectedDays.length > 0 ? selectedDays : undefined
        : undefined,
    };

    onSubmit(task.id, {
      title: title.trim(),
      childId: selectedChild,
      date,
      time: `${hour}:${minute}`,
      endTime: `${endHour}:${endMinute}`,
      recurrence,
    });

    onClose();
  };

  const handleDelete = () => {
    if (!task) return;

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('정말 이 일정을 삭제하시겠습니까?');
      if (confirmed) {
        onDelete(task.id);
        onClose();
      }
    } else {
      Alert.alert(
        '일정 삭제',
        '정말 이 일정을 삭제하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '삭제',
            style: 'destructive',
            onPress: () => {
              onDelete(task.id);
              onClose();
            }
          },
        ]
      );
    }
  };

  const showDaySelector = recurrenceType === 'weekly' || recurrenceType === 'biweekly';

  if (!task) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>취소</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>일정 수정</Text>
          <TouchableOpacity onPress={handleSubmit}>
            <Text style={[styles.saveButton, !title.trim() && styles.saveButtonDisabled]}>
              저장
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View style={styles.field}>
            <Text style={styles.label}>일정 이름</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="예: 태권도 픽업"
              placeholderTextColor={Colors.ui.textMuted}
            />
          </View>

          {/* Child Selection */}
          <View style={styles.field}>
            <Text style={styles.label}>인물 선택</Text>
            <View style={styles.optionsRow}>
              {children.map((child) => {
                const memberColor = Members[child.id as MemberKeyType]?.color || Colors.accent.primary;
                const isActive = selectedChild === child.id;

                return (
                  <TouchableOpacity
                    key={child.id}
                    style={[
                      styles.option,
                      { borderColor: memberColor },
                      isActive && { backgroundColor: memberColor },
                    ]}
                    onPress={() => setSelectedChild(child.id)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: memberColor },
                        isActive && styles.optionTextActive,
                      ]}
                    >
                      {child.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>



          {/* Date */}
          <View style={styles.field}>
            <Text style={styles.label}>날짜</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.ui.textMuted}
            />
          </View>

          {/* Time */}
          <View style={styles.field}>
            <Text style={styles.label}>시작 시간</Text>
            <View style={styles.timeRow}>
              <TextInput
                style={[styles.input, styles.timeInput]}
                value={hour}
                onChangeText={(t) => setHour(t.replace(/[^0-9]/g, '').slice(0, 2))}
                placeholder="14"
                placeholderTextColor={Colors.ui.textMuted}
                keyboardType="number-pad"
                maxLength={2}
              />
              <Text style={styles.timeSeparator}>:</Text>
              <TextInput
                style={[styles.input, styles.timeInput]}
                value={minute}
                onChangeText={(t) => setMinute(t.replace(/[^0-9]/g, '').slice(0, 2))}
                placeholder="00"
                placeholderTextColor={Colors.ui.textMuted}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
          </View>

          {/* End Time */}
          <View style={styles.field}>
            <Text style={styles.label}>종료 시간</Text>
            <View style={styles.timeRow}>
              <TextInput
                style={[styles.input, styles.timeInput]}
                value={endHour}
                onChangeText={(t) => setEndHour(t.replace(/[^0-9]/g, '').slice(0, 2))}
                placeholder="15"
                placeholderTextColor={Colors.ui.textMuted}
                keyboardType="number-pad"
                maxLength={2}
              />
              <Text style={styles.timeSeparator}>:</Text>
              <TextInput
                style={[styles.input, styles.timeInput]}
                value={endMinute}
                onChangeText={(t) => setEndMinute(t.replace(/[^0-9]/g, '').slice(0, 2))}
                placeholder="00"
                placeholderTextColor={Colors.ui.textMuted}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
          </View>

          {/* Recurrence */}
          <View style={styles.field}>
            <Text style={styles.label}>반복</Text>
            <View style={styles.optionsWrap}>
              {recurrenceOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.option,
                    recurrenceType === option.value && styles.optionActive,
                  ]}
                  onPress={() => setRecurrenceType(option.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      recurrenceType === option.value && styles.optionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Day Selector */}
          {showDaySelector && (
            <View style={styles.field}>
              <Text style={styles.label}>반복 요일</Text>
              <View style={styles.daysRow}>
                {dayOptions.map((day) => (
                  <TouchableOpacity
                    key={day.value}
                    style={[
                      styles.dayButton,
                      selectedDays.includes(day.value) && styles.dayButtonActive,
                    ]}
                    onPress={() => toggleDay(day.value)}
                  >
                    <Text
                      style={[
                        styles.dayButtonText,
                        selectedDays.includes(day.value) && styles.dayButtonTextActive,
                      ]}
                    >
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Delete Button */}
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>일정 삭제</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ui.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.ui.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.ui.text,
  },
  cancelButton: {
    fontSize: FontSize.md,
    color: Colors.ui.textLight,
  },
  saveButton: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.accent.primary,
  },
  saveButtonDisabled: {
    color: Colors.ui.textMuted,
  },
  form: {
    flex: 1,
    padding: Spacing.md,
  },
  field: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.ui.text,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.ui.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.ui.text,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  timeInput: {
    width: 60,
    textAlign: 'center',
  },
  timeSeparator: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.ui.text,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.ui.card,
    borderWidth: 1.5,
    borderColor: Colors.ui.border,
    gap: Spacing.xs,
  },
  optionActive: {
    backgroundColor: Colors.accent.primary,
    borderColor: Colors.accent.primary,
  },
  optionShape: {
    fontSize: FontSize.md,
  },
  optionText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.ui.text,
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  memberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  memberOption: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.ui.card,
    borderWidth: 2,
    borderColor: Colors.ui.border,
  },
  memberOptionActive: {
    backgroundColor: Colors.ui.textMuted,
    borderColor: Colors.ui.textMuted,
  },
  memberOptionText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.ui.text,
  },
  memberOptionTextActive: {
    color: '#FFFFFF',
  },
  daysRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.ui.card,
    borderWidth: 1.5,
    borderColor: Colors.ui.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonActive: {
    backgroundColor: Colors.accent.primary,
    borderColor: Colors.accent.primary,
  },
  dayButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.ui.text,
  },
  dayButtonTextActive: {
    color: '#FFFFFF',
  },
  deleteButton: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
    backgroundColor: '#FFE5E5',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFCCCC',
  },
  deleteButtonText: {
    color: '#CC4444',
    fontSize: FontSize.md,
    fontWeight: '600',
  },
});
