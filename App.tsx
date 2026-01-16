import React, { useEffect, useState } from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { KakaoRedirectHandler } from './src/components/auth/KakaoRedirectHandler';
import { useAuthStore } from './src/store/useAuthStore';
import { ChildLoginScreen } from './src/screens/ChildLoginScreen';

// Convex URL 직접 설정
const CONVEX_URL = 'https://enchanted-hamster-323.convex.cloud';
const convex = new ConvexReactClient(CONVEX_URL);

const MainContent = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isReady, setIsReady] = useState(false);
  const [loginMode, setLoginMode] = useState<'main' | 'child'>('main');

  useEffect(() => {
    // Zustand persist hydration check (simplified)
    setIsReady(true);
  }, []);

  if (!isReady) return null;

  if (isAuthenticated) {
    return <DashboardScreen />;
  }

  return (
    <>
      <KakaoRedirectHandler />
      {loginMode === 'main' ? (
        <LoginScreen onChildLogin={() => setLoginMode('child')} />
      ) : (
        <ChildLoginScreen onBack={() => setLoginMode('main')} />
      )}
    </>
  );
};

export default function App() {
  return (
    <ConvexProvider client={convex}>
      <MainContent />
    </ConvexProvider>
  );
}
