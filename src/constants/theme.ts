// High Five Design System - Pastel Edition
// Fresh, soft, and accessible

export const Colors = {
  // 4명의 멤버 색상 (파스텔톤)
  members: {
    subin: '#8CB9BD',     // 파스텔 아쿠아 블루 (스카이블루)
    songin: '#F3B664',    // 파스텔 번트 오렌지
    sua: '#B6A6CA',       // 파스텔 퍼플
    seungwoo: '#A1C298',  // 파스텔 세이지 그린 (눈이 편안한 녹색)
  },

  // UI Colors - 파스텔 베이스
  ui: {
    background: '#FBF9F7',    // 크림 화이트
    card: '#FFFFFF',
    border: '#E8E4E0',
    text: '#3D3D3D',
    textLight: '#6B6B6B',
    textMuted: '#A0A0A0',
  },



  // Accent
  accent: {
    primary: '#7EB8DA',
    warning: '#FFD4A3',
    success: '#B8E6C9',
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 22,
  xxl: 28,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const BorderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

// Child Shape Icons (for accessibility - no color dependency)
export const ChildShapes = {
  circle: '●',
  square: '■',
  star: '★',
  triangle: '▲',
  diamond: '◆',
} as const;

export type ChildShape = keyof typeof ChildShapes;

// 멤버 정보
export type MemberKey = 'subin' | 'songin' | 'sua' | 'seungwoo';

export const Members: Record<MemberKey, { name: string; color: string; emoji: string }> = {
  sua: { name: '수아', color: Colors.members.sua, emoji: '💜' },
  seungwoo: { name: '승우', color: Colors.members.seungwoo, emoji: '💚' },
  subin: { name: '수빈', color: Colors.members.subin, emoji: '💙' },
  songin: { name: '송인', color: Colors.members.songin, emoji: '🧡' },
};
