---
name: mobile-design
description: Mobile UX/UI design guidelines for Buddy React Native app. Use when creating or refining mobile screens, navigation layouts, gesture handling, touch ergonomics, and responsiveness.
---

# Buddy Mobile Design System

## 1. Ergonomics & Touch Targets

- Minimum **48x48 dp** touch targets for buttons, list items, and icons.
- Position primary actions within comfortable thumb-reach zones (lower two-thirds of screen).
- Bottom-sheet modals for complex inputs and secondary actions instead of full screen jumps when appropriate.

## 2. Navigation Patterns

- **Expo Router**: File-based routing in `app/`.
- Use `CustomNavigationHeader` across all screens — default React Native headers are disabled.
- Bottom navigation with 4 main tabs (`Home`, `Trackers`, `Groups`, `Settings`).

## 3. UI Primitives & Fluid Surface

- Compose layouts with `ScreenContainer` and `GlassSurface`.
- Use Tamagui tokens (`$space`, `$size`, `$radius`) for spacing and sizing consistency.
- Ensure seamless dark/light theme switching with `useTamaguiTheme()`.
- Keyboard handling: Wrap scrollable forms with `KeyboardAvoidingView` and `ScreenWrapper`.
