import React from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { DashboardScreen } from './src/screens/DashboardScreen';

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL || '';
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export default function App() {
  if (!convex) {
    return <DashboardScreen />;
  }

  return (
    <ConvexProvider client={convex}>
      <DashboardScreen />
    </ConvexProvider>
  );
}
