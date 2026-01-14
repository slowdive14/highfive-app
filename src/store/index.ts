// Convex URL이 있으면 Convex 사용, 없으면 로컬 스토어 사용
const hasConvex = !!process.env.EXPO_PUBLIC_CONVEX_URL;

export { useStore } from './useStore';
export { useConvexStore } from './useConvexStore';

// 사용할 스토어 결정 (Convex 연결 시 useConvexStore, 아니면 useStore)
export const useAppStore = hasConvex
  ? require('./useConvexStore').useConvexStore
  : require('./useStore').useStore;
