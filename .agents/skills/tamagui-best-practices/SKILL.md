---
name: tamagui-best-practices
description: Best practices and guidelines for UI styling using Tamagui v2 with @tamagui/config/v5 in Buddy. Use when creating or refactoring UI components, styling layouts, managing themes, or using design tokens.
---

# Tamagui Best Practices for Buddy (v2 + @tamagui/config/v5)

Guidelines and architectural standards for styling UI components with Tamagui in the Buddy project.

## 1. Architecture & Stack Overview

- **Core Framework**: Tamagui v2 (`2.7.7`) running on React Native 0.86 with New Architecture (Fabric).
- **Config**: `@tamagui/config/v5` (`defaultConfig`, `@tamagui/config/v5-reanimated`, `@tamagui/config/v5-css`).
- **Configuration Root**: Root configuration is assembled in `packages/buddy-ui/src/config/createBuddyUIConfig.ts` and exported via `tamagui.config.ts`.
- **UI Package (`@ravitamil/buddy-ui`)**: Buddy packages domain-standard components (`Button`, `Card`, `FormField`, `GlassSurface`, `Input`, `Label`, `ListItem`, `SelectField`, `Switch`, `Text`, `ToggleField`) on top of Tamagui v2 and Config v5.

---

## 2. Core Principles

1. **Tamagui & Buddy UI First**:
   - Use Tamagui layout primitives (`YStack`, `XStack`, `ZStack`, `View`, `Stack`) or `@ravitamil/buddy-ui` stacks (`VStack`, `HStack`, `Box`).
   - Use `@ravitamil/buddy-ui` interactive and form primitives (`Button`, `Text`, `FormField`, `Input`, `Card`, `Switch`).
   - Never use raw React Native components (`View`, `Text`, `TouchableOpacity`, `TextInput`).
2. **Never Hardcode Colors**: Always use theme token names (e.g., `$background`, `$surface`, `$text`, `$textSecondary`, `$borderColor`, `$primary`, `$income`, `$expense`) or resolve them through `useTheme()` / `useBuddyColors()`.
3. **Use v5 Shorthands**: Use Tamagui style shorthands for clean, readable JSX:
   - `bg` for `backgroundColor`
   - `p`, `px`, `py`, `pt`, `pb`, `pl`, `pr` for padding
   - `m`, `mx`, `my`, `mt`, `mb`, `ml`, `mr` for margin
   - `br` for `borderRadius`
   - `bw` for `borderWidth`
   - `bc` for `borderColor`
   - `ai` for `alignItems`, `jc` for `justifyContent`
   - `f` for `flex`
   - `w`, `h`, `minW`, `maxW`, `minH`, `maxH` for dimensions
   - `fs` for `fontSize`, `fw` for `fontWeight`, `lh` for `lineHeight`, `ls` for `letterSpacing`, `ta` for `textAlign`
4. **Dark & Light Mode Parity**: Every component MUST support and render crisply in both light and dark themes. Test both.
5. **Fluid Surface System**:
   - `ScreenContainer` owns the root background atmosphere and blur target.
   - `GlassSurface` owns standard Fluid Surface translucent tint, edge, radius, and depth.
   - Never create ad-hoc blur or unverified RGBA recipes.
6. **No Native Alert.alert**: Always use `ConfirmationDialog` via the `useAlert()` hook.

---

## 3. Theme & Color Tokens (v5 Theme System)

### Theme Hook Usage

```tsx
import {useTamaguiTheme} from '@/context';
import {useTheme, XStack, YStack} from 'tamagui';
import {Text, Button} from '@ravitamil/buddy-ui';

export const MyComponent = () => {
  const {isDarkMode, toggleTheme} = useTamaguiTheme();
  const theme = useTheme(); // Returns live token accessors

  return (
    <YStack bg="$background" p="$4" br="$4" bc="$borderColor" bw={1} gap="$2">
      <Text variant="body1" color="$text" weight="bold">
        Title
      </Text>
      <Text variant="caption" color="$textSecondary">
        Subtitle
      </Text>
      <XStack jc="space-between" ai="center">
        <Text color="$income" weight="semibold">
          +₹5,000
        </Text>
        <Button variant="primary" size="medium" onPress={toggleTheme}>
          Toggle Theme
        </Button>
      </XStack>
    </YStack>
  );
};
```

### Standard Semantic Tokens

| Token                             | Light Theme             | Dark Theme                | Purpose                     |
| --------------------------------- | ----------------------- | ------------------------- | --------------------------- |
| `$background`                     | `#faf8f2` (Warm Sand)   | `#100c08` (Deep Void)     | Root screen canvas          |
| `$surface`                        | `#ffffff`               | `#1b1713` (Smokey Fog)    | Elevated cards / rows       |
| `$surfaceHover` / `$surfacePress` | `#f3f0e8` / `#ebe7df`   | `#241f19` / `#302a22`     | Card touch interactions     |
| `$text` / `$color`                | `#28251f`               | `#f7f4ec`                 | Primary body / title text   |
| `$textSecondary`                  | `#666157`               | `#aba394`                 | Subtitles, captions, hints  |
| `$textDisabled`                   | `#969084`               | `#756d60`                 | Disabled text               |
| `$borderColor`                    | `#dfdbd1`               | `#332c22`                 | Borders, dividers           |
| `$primary`                        | Imperial Coin Gold      | Warm Gold Highlight       | Primary brand accents       |
| `$income`                         | `#16a34a`               | `#4ade80`                 | Positive cashflow, deposits |
| `$expense`                        | `#ef4444`               | `#f87171`                 | Expenses, debt, debits      |
| `$savings`                        | `#8b5cf6`               | `#bfa5f5`                 | Savings goals, investments  |
| `$glassSurfaceStart`              | `rgba(255,255,255,0.9)` | `rgba(255,255,255,0.075)` | Fluid Surface top tint      |
| `$glassSurfaceBorder`             | `rgba(255,255,255,0.9)` | `rgba(255,255,255,0.38)`  | Light-catching edge         |

---

## 4. Layouts & Stacking

- **Vertical**: Use `YStack` from `tamagui` or `VStack` from `@ravitamil/buddy-ui`.
- **Horizontal**: Use `XStack` from `tamagui` or `HStack` from `@ravitamil/buddy-ui`.
- **Layered/Absolute**: Use `ZStack` from `tamagui`.
- **Spacing**: Prefer `gap="$2"`, `gap="$3"`, or `gap="$4"` over individual margins on child elements.
- **Flex Child Sizing**: Use `flex={1}` on text or middle columns to prevent truncation or horizontal overflow.

---

## 5. Forms & Inputs

- Use `FormField` from `@ravitamil/buddy-ui/FormField`:
  ```tsx
  <FormField
    label="Planned Amount"
    placeholder="0.00"
    size="small" // 'small' (14px) or 'medium' (16px) or 'large' (18px)
    value={value}
    onChangeText={setValue}
    keyboardType="decimal-pad"
    leftIcon={
      <Text color="$textSecondary" weight="bold">
        {currencySymbol}
      </Text>
    }
    helpText="Optional helper note"
    error={error}
  />
  ```
- **Size Convention**:
  - `size="small"` uses standard 14px font and compact mobile height (preferred in complex multi-field cards).
  - `size="medium"` is standard 16px font.
- Always provide accessible labels (`accessibilityLabel`).
- Ensure touch targets for buttons and interactive rows meet the **48pt minimum** guideline.

---

## 6. Animations (v5 Reanimated Driver)

Tamagui v2 in Buddy uses `@tamagui/config/v5-reanimated` for smooth native-thread transitions:

- **Presets**: `quick`, `medium`, `slow`, `bouncy`, `lazy`, `smooth`.
- **Entering / Exiting**:
  ```tsx
  <YStack
    animation="quick"
    animateOnly={['transform', 'opacity']}
    enterStyle={{opacity: 0, y: -8}}
    exitStyle={{opacity: 0, y: 8}}
    pressStyle={{opacity: 0.85, scale: 0.98}}>
    ...
  </YStack>
  ```
- **Critical Rule**: Always set `animateOnly={['transform', 'opacity']}` on native components to ensure animations run on the UI thread without triggering native layout passes.
