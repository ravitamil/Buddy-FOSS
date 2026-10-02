---
name: fluid-surface-design
description: Design system guidelines for the semi-translucent Fluid Surface visual language in Buddy. Use when building cards, containers, headers, or screen surfaces.
---

# Buddy Fluid Surface Design System

## Visual Identity & Philosophy

Buddy uses the **semi-translucent Fluid Surface** design language over calm, warm-neutral screen backgrounds. It is NOT generic frosted glass. The effect communicates depth through environmental blur, a restrained translucent tint, a light-catching edge, and soft elevation.

## Surface Ownership

1. **`ScreenContainer`** owns the edge-to-edge background, atmosphere, safe-area insets, and native blur target.
2. **`GlassSurface`** is the canonical shared component owning standard Fluid Surface translucent tint, light-catching edge, 16–20pt corner radius, and depth elevation.
3. Feature components must compose `GlassSurface` instead of inventing local blur/border/RGBA recipes.

## Platform Differences

- **iOS**: Uses native blur with material tint.
- **Android**: Uses Expo smooth translucent fallback to avoid native Dimezis noise/stipple artifacts on physical devices.

## Color Wash Rules

- **Neutral Surface is Default**: No color wash on ordinary cards, navigation rows, or settings items.
- **Semantic Color Wash is Opt-in**:
  - Green / Income semantic wash for positive cashflow metrics.
  - Red / Expense semantic wash for outflow metrics.
  - Blue / Savings semantic wash for goal trackers.
  - Gold / Warning for Pro membership status.
- Washes fill the entire rounded inner surface. Never use tiny wash squares behind icons.

## Accessibility & Interaction

- Minimum **48pt touch targets** on all interactive elements.
- Accessible contrast ratios in both Dark and Light themes.
- Clear accessibility labels on icon buttons.
