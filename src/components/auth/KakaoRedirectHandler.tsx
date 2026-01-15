import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuthStore } from '../../store/useAuthStore';
import { Colors } from '../../constants/theme';
import { Id } from '../../../convex/_generated/dataModel';

export const KakaoRedirectHandler = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const kakaoLogin = useAction(api.auth.kakaoLogin);
    const login = useAuthStore((state) => state.login);

    useEffect(() => {
        // Only run on web environment
        if (Platform.OS !== 'web' || typeof window === 'undefined') return;

        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (code) {
            handleLogin(code);
        }
    }, []);

    const handleLogin = async (code: string) => {
        setIsProcessing(true);
        try {
            const redirectUri = window.location.origin;

            const result = await kakaoLogin({
                code,
                redirectUri,
            });

            // Update local auth state
            login({
                id: result.userId as Id<'users'>,
                name: result.name,
                avatarUrl: result.avatarUrl,
                email: result.email,
            });

            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);

        } catch (error) {
            console.error('Login failed', error);
            alert('Login failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isProcessing) return null;

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={Colors.accent.primary} />
            <Text style={styles.text}>Logging in...</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    text: {
        marginTop: 20,
        fontSize: 16,
        color: Colors.ui.text,
    },
});
