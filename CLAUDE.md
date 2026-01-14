# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HighFive (하이파이브) is a family schedule management app built with React Native and Expo. It allows families to track tasks/schedules for children and parents with support for recurring tasks and multiple view modes (daily, weekly, monthly).

## Development Commands

```bash
# Start development server
npm start

# Platform-specific
npm run android    # Start with Android
npm run ios        # Start with iOS
npm run web        # Start with web
```

## Architecture

### State Management
- **Zustand store** (`src/store/useStore.ts`): Central state with persistence to localStorage
- Manages: tasks, children, filters (day/child), and provides filtered task getters
- Persistence key: `highfive-storage-v2`

### Data Model
- **Task**: Has title, childId, date (YYYY-MM-DD), time (HH:mm), and recurrence rules
- **Child**: Has name and shape (geometric icon for accessibility)
- **RecurrenceRule**: Supports none/daily/weekly/biweekly/monthly with optional day-of-week selection

### Recurrence System
The `expandRecurringTasks()` utility in `src/utils/recurrence.ts` generates virtual task instances for a date range. Virtual tasks get IDs like `{originalId}_{date}`. When updating/deleting, the store extracts the base ID via `id.split('_')[0]`.

### Component Structure
- `src/screens/DashboardScreen.tsx`: Main entry point, orchestrates all views
- `src/components/`: UI components (modals, tabs, cards, calendar views)
- `src/constants/theme.ts`: Design tokens (colors, spacing, typography, member definitions)

### Key Patterns
- Parents (Subin, Songin) are hardcoded as pseudo-children in DashboardScreen for scheduling
- Child shapes (circle, square, star, triangle, diamond) provide color-independent identification
- Filters: DayFilter ('today'|'tomorrow'), ChildFilter ('all'|childId), ViewMode ('daily'|'weekly'|'monthly')
