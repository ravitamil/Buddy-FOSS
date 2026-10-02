# @ravitamil/buddy-ui

Portable Tamagui foundations and mobile UI primitives extracted from BuddyIO.
The package is deliberately app-agnostic: product copy, navigation, data access,
fonts, and domain-specific cards remain in the consuming application.

## Install from GitHub Packages

Authenticate the `@ravitamil` scope in the consuming repository without committing
a token:

```ini
@ravitamil:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Then install the package and its native peers with the Expo-compatible versions for
that application:

```powershell
npm install @ravitamil/buddy-ui
npx expo install tamagui @tamagui/config @expo/vector-icons expo-blur expo-linear-gradient react-native-safe-area-context @react-native-community/datetimepicker lottie-react-native
```

The package publishes compiled ESM, CommonJS, and TypeScript declarations. Consumer
applications do not compile Buddy UI source.

## Public component families

- Foundations: `Box`, `HStack`, `VStack`, `Text`, `Label`, `Button`, `Card`, `Input`, `FormField`
- Surfaces: `GlassSurface`, `DottedBackground`, `Screen`, `ScreenScrollView`, `KeyboardScreen`
- Forms: `Switch`, `ToggleField`, `SelectField`, `SegmentedControl`
- Actions: `IconAction`, `FloatingAction`, `ActionGrid`, `QuickActionPanel`
- Content: `IconTile`, `EmptyState`, `MetricCard`, `ListItem`, `SearchField`, `Skeleton`, `Avatar`, `Badge`
- Feedback: `ToastBanner`, `SuccessState`, `LoadingIndicator`
- Overlays: `Dialog`, `ConfirmationDialog`, `BottomSheet`, `BottomSheetAction`, `BottomSheetOption`, `DatePickerSheet`
- Optional animation: `LottieAnimationView`

Feature screens, finance models, product copy, navigation, services, application
contexts, feature controls, Supabase, and bundled assets remain in the consuming app.

## Configure an Expo app

Point the app's Tamagui configuration at the shared default:

```ts
// tamagui.config.ts
import {buddyUIConfig} from '@ravitamil/buddy-ui/config';

export default buddyUIConfig;

export type AppConfig = typeof buddyUIConfig;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}
```

Then mount the provider once at the application root:

```tsx
import {TamaguiProvider} from 'tamagui';
import {buddyUIConfig} from '@ravitamil/buddy-ui/config';

export function AppProviders({children}: {children: React.ReactNode}) {
  return <TamaguiProvider config={buddyUIConfig}>{children}</TamaguiProvider>;
}
```

To use a different product identity while retaining the same system, create a
config with brand overrides. Semantic success, warning, error, and info colors
remain separate from the brand accent.

```ts
import {createBuddyUIConfig} from '@ravitamil/buddy-ui/config';

export default createBuddyUIConfig({
  brand: {
    primary: '#4338ca',
    primaryHover: '#3730a3',
    primaryPress: '#312e81',
    primaryMuted: '#e0e7ff',
    onPrimary: '#ffffff',
  },
});
```

Use the composed field contract instead of rebuilding label, error, hint, and
character-count behavior on every screen:

```tsx
import {Button, FormField} from '@ravitamil/buddy-ui';

<FormField
  label="Display name"
  value={name}
  onChangeText={setName}
  helpText="Shown to people you share with"
  maxLength={40}
/>;
<Button onPress={save}>Save</Button>;
```

Long-running actions can preserve context with `loading` and `loadingLabel`
instead of replacing meaningful copy with a generic spinner label.

## Enforce component usage

The package ships a flat-config ESLint plugin so consuming applications do not
silently bypass the design system:

```js
// eslint.config.js
const buddyUi = require('@ravitamil/buddy-ui/eslint');

module.exports = [buddyUi.configs.recommended];
```

The recommended config rejects raw Tamagui/React Native/third-party overlay
infrastructure and direct Tamagui imports of branded controls such as `Button`,
`Card`, `Input`, `Spinner`, `Switch`, and `Text`. Tamagui layout primitives,
styling helpers, and theme hooks remain valid implementation tools.

## Design contract

- Interactive controls provide at least a 48-point touch target, satisfying the
  larger Android minimum while remaining comfortable on iOS.
- Surfaces use neutral theme roles. Brand color communicates identity; semantic
  colors communicate status and are not interchangeable.
- All colors come from the theme and every primitive supports light and dark mode.
- Typography may grow with accessibility settings; consuming screens must avoid
  fixed-height text containers.
- Motion is brief, transform-based, and supplementary. State must never depend on
  animation alone.
- Fonts are app-owned. A consuming project can supply its own Tamagui font tokens
  without changing the component API.

## Release and verification

`@ravitamil/buddy-ui` is a restricted GitHub Packages package. Versioned releases
use Changesets and the `Release Buddy UI` workflow. Before publishing, the package
must pass its type check, Builder Bob build, `publint`, Are the Types Wrong, archive
dry run, the Expo consumer smoke fixture, the repository gates, Android assembly,
and the macOS iOS-simulator workflow.
