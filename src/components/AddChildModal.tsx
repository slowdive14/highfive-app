import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { ChildShape } from '../constants/theme';
import { Colors, Spacing, FontSize, BorderRadius, ChildShapes } from '../constants/theme';

interface AddChildModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (child: { name: string; shape: ChildShape }) => void;
}

const shapeOptions: { value: ChildShape; label: string }[] = [
  { value: 'circle', label: '● 동그라미' },
  { value: 'square', label: '■ 네모' },
  { value: 'star', label: '★ 별' },
  { value: 'triangle', label: '▲ 세모' },
  { value: 'diamond', label: '◆ 다이아' },
];

export const AddChildModal: React.FC<AddChildModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [selectedShape, setSelectedShape] = useState<ChildShape>('circle');

  const handleSubmit = () => {
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      shape: selectedShape,
    });

    setName('');
    setSelectedShape('circle');
    onClose();
  };

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
          <Text style={styles.headerTitle}>아이 등록</Text>
          <TouchableOpacity onPress={handleSubmit}>
            <Text style={[styles.saveButton, !name.trim() && styles.saveButtonDisabled]}>
              저장
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          {/* 이름 */}
          <View style={styles.field}>
            <Text style={styles.label}>이름</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="예: 민준, 서연"
              placeholderTextColor={Colors.ui.textMuted}
              autoFocus
            />
          </View>

          {/* 아이콘 선택 */}
          <View style={styles.field}>
            <Text style={styles.label}>아이콘 (구분용)</Text>
            <View style={styles.shapeGrid}>
              {shapeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.shapeOption,
                    selectedShape === option.value && styles.shapeOptionActive,
                  ]}
                  onPress={() => setSelectedShape(option.value)}
                >
                  <Text style={styles.shapeIcon}>{ChildShapes[option.value]}</Text>
                  <Text
                    style={[
                      styles.shapeLabel,
                      selectedShape === option.value && styles.shapeLabelActive,
                    ]}
                  >
                    {option.label.split(' ')[1]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 미리보기 */}
          {name.trim() && (
            <View style={styles.preview}>
              <Text style={styles.previewLabel}>미리보기</Text>
              <View style={styles.previewBadge}>
                <Text style={styles.previewShape}>{ChildShapes[selectedShape]}</Text>
                <Text style={styles.previewName}>{name}</Text>
              </View>
            </View>
          )}
        </View>
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
  shapeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  shapeOption: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.ui.card,
    borderWidth: 2,
    borderColor: Colors.ui.border,
    minWidth: 80,
  },
  shapeOptionActive: {
    backgroundColor: Colors.accent.primary,
    borderColor: Colors.accent.primary,
  },
  shapeIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  shapeLabel: {
    fontSize: FontSize.xs,
    color: Colors.ui.text,
  },
  shapeLabelActive: {
    color: '#FFFFFF',
  },
  preview: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.ui.card,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: FontSize.xs,
    color: Colors.ui.textMuted,
    marginBottom: Spacing.sm,
  },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.ui.background,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  previewShape: {
    fontSize: FontSize.lg,
  },
  previewName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.ui.text,
  },
});
