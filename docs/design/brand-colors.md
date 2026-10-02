# Buddy brand colors

Buddy uses coin gold for identity and selection, ivory in light mode, and warm charcoal in dark mode.
This palette takes its direction from `assets/appLogo/coins-logo.png` and the matching Android adaptive icon.
The dotted atmosphere and Fluid Surface composition remain the surface system.

| Role                 | Light     | Dark      |
| -------------------- | --------- | --------- |
| Primary action fill  | `#f2c94c` | `#f2c94c` |
| Brand text and icons | `#805c12` | `#f2c94c` |
| Screen background    | `#faf8f2` | `#171613` |
| Income / success     | `#146c35` | `#4ade80` |
| Ordinary expense     | `#a54842` | `#e6a09a` |
| Savings              | `#71549b` | `#bdafe7` |

Use `$primary` for filled primary actions and `$iconBrand` for brand text and icons on neutral surfaces.
Use `$buttonPrimaryText` (dark ink) on gold primary fills; do not use white labels on gold. Status button labels use `$semanticOnColor`, which changes
to dark ink on bright dark-mode status fills. Ordinary expenses use `$expense`; failures and destructive
actions use `$error`. Warnings use burnt orange so gold remains a brand signal. Green communicates income or success, rather than primary navigation or selection.

Use `useBuddyColors()` when native icons, gradients, or chart APIs need resolved color strings.
It reads the active Tamagui theme on each render. `semanticHexColor()` is a fixed fallback for
non-rendering code; it must not be used as the active color source for theme-sensitive UI.

The foundations and `createBuddyUIThemes` own the palette. Feature components compose `ScreenContainer`
and `GlassSurface`; do not introduce local brand colors or surface recipes. Keep custom category,
wallet, and member identity colors separate from brand roles.

The contrast regression tests cover normal text on solid default, card, and pressed surfaces,
primary action states, and semantic button fills in both themes. Translucent compositing and
individual feature layouts still require native visual checks.
