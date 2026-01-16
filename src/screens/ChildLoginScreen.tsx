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
    const [familyData, setFamilyData] = useState<{ user: any; children: any[] } | null>(null);

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
            if (result) {
                setFamilyData(result);
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

    const handleChildSelect = (child: any) => {
        loginAsChild(child._id); // Using the ID from DB
    };

    if (familyData) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.profileContainer}>
                    <Text style={styles.title}>누구세요?</Text>
                    <Text style={styles.subtitle}>{familyData.user.name}님의 가족</Text>

                    <View style={styles.grid}>
                        {familyData.children.map((child: any) => {
                            const memberStyle = Members[child.id as MemberKey];
                            const color = memberStyle?.color || Colors.accent.primary;

                            return (
                                <TouchableOpacity
                                    key={child._id}
                                    style={[styles.profileCard, { borderColor: color }]}
                                    onPress={() => handleChildSelect(child)}
                                >
                                    <View style={[styles.avatar, { backgroundColor: color }]}>
                                        <Text style={styles.avatarEmoji}>
                                            {memberStyle?.emoji || '👶'}
                                        </Text>
                                    </View>
                                    <Text style={styles.childName}>{child.name}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <TouchableOpacity onPress={() => setFamilyData(null)} style={styles.backButton}>
                        <Text style={styles.backButtonText}>다시 입력하기</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

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
    profileContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.lg,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: Spacing.lg,
        marginTop: Spacing.xl,
    },
    profileCard: {
        width: 140,
        padding: Spacing.lg,
        backgroundColor: '#FFFFFF',
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    avatarEmoji: {
        fontSize: 40,
    },
    childName: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: Colors.ui.text,
    },
    backButton: {
        marginTop: Spacing.xl * 2,
        padding: Spacing.md,
    },
    backButtonText: {
        color: Colors.ui.textMuted,
        fontSize: FontSize.md,
        textDecorationLine: 'underline',
    },
});
