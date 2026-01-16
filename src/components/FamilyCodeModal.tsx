import React, { useEffect, useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    TextInput,
    ActivityIndicator,
    Alert,
} from 'react-native';

// ... (imports)

// ... (component start)

const handleSaveManual = async () => {
    if (!userId) return;
    if (manualCode.length !== 4 || isNaN(Number(manualCode))) {
        Alert.alert('오류', '4자리 숫자를 입력해주세요.');
        return;
    }

    setIsLoading(true);
    try {
        await setAccessCode({ userId, code: manualCode });
        setIsEditing(false);
        Alert.alert('성공', '가족 코드가 변경되었습니다.');
    } catch (e) {
        Alert.alert('오류', '코드를 저장하는 중 문제가 발생했습니다.');
    } finally {
        setIsLoading(false);
    }
};

return (
    <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
    >
        <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.overlay}>
                <TouchableWithoutFeedback>
                    <View style={styles.modalParams}>
                        <View style={styles.container}>
                            <Text style={styles.title}>우리 가족 접속 코드 🏠</Text>
                            <Text style={styles.description}>
                                아이가 로그인할 때 이 코드를 입력하면{"\n"}
                                별도 계정 없이 바로 접속할 수 있어요.
                            </Text>

                            <View style={styles.codeContainer}>
                                {isEditing ? (
                                    <TextInput
                                        style={styles.codeInput}
                                        value={manualCode}
                                        onChangeText={(text) => setManualCode(text.replace(/[^0-9]/g, '').slice(0, 4))}
                                        keyboardType="number-pad"
                                        maxLength={4}
                                        autoFocus
                                        textAlign="center"
                                    />
                                ) : (
                                    user?.accessCode ? (
                                        <TouchableOpacity onPress={() => {
                                            setManualCode(user.accessCode!);
                                            setIsEditing(true);
                                        }}>
                                            <Text style={styles.codeText}>{user.accessCode}</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <Text style={styles.placeholderText}>코드가 없습니다</Text>
                                    )
                                )}
                            </View>

                            <TouchableOpacity
                                style={[styles.generateButton, isEditing && { backgroundColor: Colors.accent.primary }]}
                                onPress={isEditing ? handleSaveManual : handleGenerate}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.generateButtonText}>
                                        {isEditing ? '저장하기' : (user?.accessCode ? '새로 발급받기' : '코드 생성하기')}
                                    </Text>
                                )}
                            </TouchableOpacity>

                            {!isEditing && (
                                <TouchableOpacity
                                    style={styles.manualButton}
                                    onPress={() => {
                                        setManualCode(user?.accessCode || '');
                                        setIsEditing(true);
                                    }}
                                >
                                    <Text style={styles.manualButtonText}>직접 입력하기</Text>
                                </TouchableOpacity>
                            )}

                            {isEditing && (
                                <TouchableOpacity style={styles.manualButton} onPress={() => setIsEditing(false)}>
                                    <Text style={styles.manualButtonText}>취소</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                                <Text style={styles.closeButtonText}>닫기</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        </TouchableWithoutFeedback>
    </Modal>
);
};

const styles = StyleSheet.create({
    // ... existing styles
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalParams: {
        width: '90%',
        maxWidth: 340,
    },
    container: {
        // ... previous props
        backgroundColor: '#FFFFFF',
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    title: {
        fontSize: FontSize.xl,
        fontWeight: 'bold',
        color: Colors.ui.text,
        marginBottom: Spacing.md,
    },
    description: {
        fontSize: FontSize.md,
        color: Colors.ui.textLight,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: Spacing.xl,
    },
    codeContainer: {
        backgroundColor: Colors.ui.background,
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.xl * 2,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.xl,
        minWidth: 200,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.ui.border,
        justifyContent: 'center',
    },
    codeText: {
        fontSize: 32,
        fontWeight: '800',
        color: Colors.accent.primary,
        letterSpacing: 4,
    },
    codeInput: {
        fontSize: 32,
        fontWeight: '800',
        color: Colors.accent.primary,
        letterSpacing: 4,
        minWidth: 120,
        padding: 0,
    },
    placeholderText: {
        fontSize: FontSize.md,
        color: Colors.ui.textMuted,
    },
    generateButton: {
        backgroundColor: Colors.ui.text,
        width: '100%',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    generateButtonText: {
        color: '#FFFFFF',
        fontSize: FontSize.md,
        fontWeight: '600',
    },
    manualButton: {
        padding: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    manualButtonText: {
        color: Colors.accent.primary,
        fontSize: FontSize.md,
        fontWeight: '600',
    },
    closeButton: {
        padding: Spacing.md,
    },
    closeButtonText: {
        color: Colors.ui.textMuted,
        fontSize: FontSize.md,
        textDecorationLine: 'underline',
    },
});
