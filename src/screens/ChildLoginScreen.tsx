import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { api } from '../../convex/_generated/api';
import { useConvex } from 'convex/react';
import { useAuthStore } from '../store/useAuthStore';
import { Colors, Spacing, FontSize, BorderRadius, Members, MemberKey } from '../constants/theme';

export const ChildLoginScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [code, setCode] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);


    const convex = useConvex();
    const loginAsChild = useAuthStore((state) => state.loginAsChild);

    const handleNumberPress = (num: string) => {
        if (code.length < 4) {
            setCode((prev) => prev + num);
            if (code.length + 1 === 4) {
                verifyCode(code + num);
            }
        }
    };

    const verifyCode = async (fullCode: string) => {
        setIsLoading(true);
        try {
            const result = await convex.query(api.users.verifyAccessCode, { code: fullCode });
            if (result && result.children && result.children.length > 0) {
                // Auto-login with first child found to skip selection
                // "그냥 수아든 승우든 비번 입력하면 바로 스케줄 볼 수 있게 해"
                loginAsChild(result.children[0]._id);
            } else if (result && result.user) {
                // Fallback if no specific children are linked but user found?
                // For now alert if no children found, though schema says children linked by userId
                Alert.alert('알림', '등록된 아이 프로필이 없습니다.');
                setCode('');
            } else {
                Alert.alert('오류', '올바르지 않은 코드입니다.');
                setCode('');
            }
        } catch (e) {
            Alert.alert('오류', '코드 확인 중 문제가 발생했습니다.');
            setCode('');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = () => {
        setCode((prev) => prev.slice(0, -1));
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.ui.background} />

            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.headerBack}>
                    <Text style={styles.headerBackText}>← 뒤로</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>접속 코드 입력</Text>
                <Text style={styles.subtitle}>부모님 앱에서 4자리 코드를 확인하세요</Text>

                <View style={styles.codeDisplay}>
                    {[0, 1, 2, 3].map((i) => (
                        <View key={i} style={[styles.dot, code.length > i && styles.dotFilled]} />
                    ))}
                </View>

                {isLoading ? (
                    <ActivityIndicator size="large" color={Colors.accent.primary} style={{ marginTop: 40 }} />
                ) : (
                    <View style={styles.keypad}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <TouchableOpacity
                                key={num}
                                style={styles.key}
                                onPress={() => handleNumberPress(num.toString())}
                            >
                                <Text style={styles.keyText}>{num}</Text>
                            </TouchableOpacity>
                        ))}
                        <View style={styles.key} />
                        <TouchableOpacity style={styles.key} onPress={() => handleNumberPress('0')}>
                            <Text style={styles.keyText}>0</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.key} onPress={handleDelete}>
                            <Text style={styles.keyText}>⌫</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.ui.background,
    },
    header: {
        padding: Spacing.md,
    },
    headerBack: {
        padding: Spacing.sm,
    },
    headerBackText: {
        fontSize: FontSize.md,
        color: Colors.ui.textMuted,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingTop: Spacing.xl,
    },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: 'bold',
        color: Colors.ui.text,
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: FontSize.md,
        color: Colors.ui.textLight,
        marginBottom: Spacing.xl * 2,
    },
    codeDisplay: {
        flexDirection: 'row',
        marginBottom: Spacing.xl * 2,
        gap: Spacing.lg,
    },
    dot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: Colors.ui.border,
    },
    dotFilled: {
        backgroundColor: Colors.accent.primary,
    },
    keypad: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: 300,
        justifyContent: 'center',
        gap: Spacing.lg,
    },
    key: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 40,
        backgroundColor: '#FFFFFF', // White keys
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    keyText: {
        fontSize: 28,
        fontWeight: '600',
        color: Colors.ui.text,
    },
});
