import React, { useEffect, useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface FamilyCodeModalProps {
    visible: boolean;
    onClose: () => void;
    userId: Id<"users"> | undefined;
}

export const FamilyCodeModal: React.FC<FamilyCodeModalProps> = ({ visible, onClose, userId }) => {
    const [isLoading, setIsLoading] = useState(false);

    // Directly query the user to get the access code
    const user = useQuery(api.auth.getUser, userId ? { id: userId } : "skip");
    const generateAccessCode = useMutation(api.users.generateAccessCode);

    const handleGenerate = async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            await generateAccessCode({ userId });
        } catch (e) {
            Alert.alert('오류', '코드를 생성하는 중 문제가 발생했습니다.');
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
                                    {user?.accessCode ? (
                                        <Text style={styles.codeText}>{user.accessCode}</Text>
                                    ) : (
                                        <Text style={styles.placeholderText}>코드가 없습니다</Text>
                                    )}
                                </View>

                                <TouchableOpacity
                                    style={styles.generateButton}
                                    onPress={handleGenerate}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.generateButtonText}>
                                            {user?.accessCode ? '코드 재발급 받기' : '코드 생성하기'}
                                        </Text>
                                    )}
                                </TouchableOpacity>

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
    },
    codeText: {
        fontSize: 32,
        fontWeight: '800',
        color: Colors.accent.primary,
        letterSpacing: 4,
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
    closeButton: {
        padding: Spacing.md,
    },
    closeButtonText: {
        color: Colors.ui.textMuted,
        fontSize: FontSize.md,
        textDecorationLine: 'underline',
    },
});
