import React from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { DashboardScreen } from './src/screens/DashboardScreen';

// Convex URL 직접 설정
const CONVEX_URL = 'https://enchanted-hamster-323.convex.cloud';
const convex = new ConvexReactClient(CONVEX_URL);

export default function App() {
  return (
    <ConvexProvider client={convex}>
      <DashboardScreen />
    </ConvexProvider>
  );
}
