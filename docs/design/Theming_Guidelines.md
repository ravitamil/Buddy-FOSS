# Theming Guidelines

- Use Tamagui color tokens via `colorToken(name)` for all colors.
- For dark/light backgrounds:
  - Unselected surfaces: `gray2` (dark), `gray1` (light)
  - Separators/borders: `gray4` (dark), `gray3` (light)
- Emphasis colors:
  - Primary actions: `blue6` (dark), `blue7` (light)
  - Success: `green6` (dark), `green7` (light)
  - Warning: `orange6` (dark), `orange7` (light)
  - Error: `red6` (dark), `red7` (light)
- Avoid hardcoded rgba/hexcodes; prefer tokens and theme-aware helpers.
- Shadows:
  - Use `EnhancedShadowView` with `ShadowPresets` for cards/buttons.
- Accessibility:
  - Ensure `accessibilityLabel`, `accessibilityHint`, and selection states are provided.
