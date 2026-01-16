import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { initializeKakaoSdk, loginWithKakao } from '../utils/kakaoSdk';

export const LoginScreen: React.FC<{ onChildLogin: () => void }> = (props) => {
    useEffect(() => {
        initializeKakaoSdk();
    }, []);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.emoji}>✋</Text>
                    <Text style={styles.title}>하이파이브</Text>
                    <Text style={styles.subtitle}>우리 가족 하루 스케줄 관리</Text>

                    <View style={styles.spacer} />

                    <TouchableOpacity
                        style={styles.kakaoButton}
                        onPress={loginWithKakao}
                        activeOpacity={0.8}
                    >
                        <View style={styles.iconContainer}>
                            <Text style={styles.buttonIcon}>💬</Text>
                        </View>
                        <Text style={styles.buttonText}>카카오로 시작하기</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.childButton}
                        onPress={props.onChildLogin}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.childButtonText}>아이로 시작하기</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.ui.background,
    },
    container: {
        flex: 1,
        padding: Spacing.xl,
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: 480,
        width: '100%',
        alignSelf: 'center',
    },
    content: {
        width: '100%',
        alignItems: 'center',
    },
    emoji: {
        fontSize: 80,
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: Colors.ui.text,
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: FontSize.lg,
        color: Colors.ui.textLight,
        marginBottom: Spacing.xl * 2,
    },
    spacer: {
        height: 40,
    },
    kakaoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FEE500',
        borderRadius: BorderRadius.lg,
        paddingVertical: 14,
        paddingHorizontal: Spacing.xl,
        width: '100%',
        maxWidth: 300,
    },
    iconContainer: {
        marginRight: 10,
    },
    buttonIcon: {
        fontSize: 20,
        color: '#000000',
    },
    buttonText: {
        color: '#000000',
        fontSize: FontSize.md,
        fontWeight: '600',
    },
    childButton: {
        width: '100%',
        maxWidth: 300,
        paddingVertical: 14,
        alignItems: 'center',
    },
    childButtonText: {
        color: Colors.ui.textMuted,
        fontSize: FontSize.md,
        textDecorationLine: 'underline',
    },
});
