# Expo SDK 56 Modernization Design

## Summary

Upgrade BuddyIO from Expo SDK 54 to Expo SDK 56 as a staged modernization, not a version-only dependency bump. The target platform baseline is Expo `56.0.12`, React Native `0.85.3`, React `19.2.3`, and TypeScript `6.0.3`, with Android and iOS release readiness.

The work will first repair the two current runtime failures, then align the Expo/native toolchain, then adopt SDK 56 capabilities in bounded waves. Tamagui remains the application design system for layout, typography, forms, cards, tokens, and themes. Expo UI becomes the preferred native-control layer where it can replace community-native controls without changing BuddyIO's product design.

The project has no production users and does not require backward-compatibility shims. Obsolete implementations and dependencies should be removed after their replacements are verified.

## Current-State Findings

- `AuthenticationScreen` wraps the logo path in a dynamic loader. Metro requires a static literal asset import, which causes the unknown `coins-logo.png` module error even though the file exists.
- `AppProviders` mounts `UserQueryProvider`, but `MembershipProvider` and the rest of the app consume the separate legacy `useUser()` context. This causes `useUser must be used within UserProvider`.
- The query-backed user provider is incomplete: its query currently returns `null` and its mutation only updates the query cache. The legacy provider still contains the real cache, Supabase load, fallback, and persistence behavior.
- Expo Doctor currently reports SDK 54 patch mismatches and a missing `react-native-web` peer required by `react-native-country-picker-modal`.
- The repository has an ignored generated Android project, no iOS project, custom Metro/Babel configuration, two package patches, and a custom `react-native-screens` config plugin. All require revalidation against the SDK 56 generated native template.
- Several dependencies are installed but unused, including `expo-av`, `expo-document-picker`, `expo-random`, `@react-native-community/slider`, and `@react-native-picker/picker`.
- BuddyIO uses `expo-file-system/legacy`, legacy media-library permission handling, extensive `@expo/vector-icons`, community date-time pickers, masked views, and Gorhom bottom sheets.
- React Compiler healthcheck successfully compiled all 836 components and found no incompatible libraries.
- The pre-upgrade baseline passes TypeScript and 39 unit suites with 200 tests.

## Architecture

### 1. Stabilization

- Replace dynamic runtime asset loading with static Metro imports and add a bundle-level regression check for required app assets.
- Create one canonical query-backed user-profile context. Move the legacy provider's real data flow into the query-backed implementation, preserve the existing public `useUser()` API, update the provider tree, and delete the duplicate context after all consumers use the canonical provider.
- Add provider contract tests covering provider order, unauthenticated state, cached profile restoration, remote profile loading, optimistic updates, rollback, and membership consumption.
- Remove React Native APIs deleted in 0.85, including all `StyleSheet.absoluteFillObject` usage, before changing the SDK baseline.

### 2. Platform Upgrade

- Upgrade Expo and run `expo install --fix` so Expo selects the compatible React Native, React, Expo Router, React Native Screens, Reanimated, Worklets, Jest Expo, and first-party module versions.
- Upgrade TypeScript and React types to the SDK 56 matrix, then resolve stricter compiler errors without weakening strict mode or adding broad suppressions.
- Add the SDK-required web peer because it is a transitive native-package requirement, while keeping web builds outside the release acceptance scope.
- Regenerate the ignored Android project and generate iOS through Expo prebuild. Reapply only intentional native settings through app config or config plugins.
- Compare the custom `react-native-screens` workaround with the SDK 56 generated template and current screens behavior. Remove it if upstream behavior is fixed; otherwise update and test the plugin against both platforms.
- Rebuild the development client. An SDK 54 development binary must not be used to validate SDK 56 JavaScript.

### 3. SDK 56 Adoption

- Enable React Compiler in app config. Treat its healthcheck as an ongoing gate and remove manual memoization only in separately tested, behavior-preserving cleanup slices.
- Enable Hermes v1 and SDK 56 experimental build/runtime capabilities requested for this initiative. Each experimental feature must have a named config switch, baseline metric, acceptance threshold, and immediate rollback path.
- Enable Android precompiled-header optimization and compare clean and incremental build times before retaining it.
- Pilot experimental Expo Router/native stack capabilities on a representative route subset first. Preserve BuddyIO's custom navigation headers, modal semantics, deep links, and Android predictive-back behavior before expanding.
- Enable update bytecode diffing only after confirming EAS Update runtime-version policy, rollback behavior, and update-size improvement.
- Adopt global `expo/fetch` through a shared network adapter, then migrate services incrementally with timeout, cancellation, retry, authentication, and error-shape tests.
- Migrate legacy Expo APIs where BuddyIO has real consumers:
  - `expo-file-system/legacy` to the modern File/Directory API behind the existing filesystem adapter.
  - Contacts and media-library permission handling to SDK 56 APIs.
  - Status/navigation bar behavior to SDK 56-compatible edge-to-edge handling.
- Remove unused first-party packages rather than migrating code that does not exist.

### 4. Expo UI Native-Control Layer

- Add Buddy-owned adapter components so feature code does not import Expo UI directly. Adapters expose BuddyIO props, apply Tamagui theme tokens, normalize platform behavior, and provide fallbacks where Expo UI lacks parity.
- Replace eligible community-native controls in controlled batches:
  - Date and time pickers.
  - Bottom sheets and native modal controls.
  - Sliders, pickers, switches, and similar platform controls.
  - Progressive masks where Expo UI provides equivalent behavior.
- Keep Tamagui for composition, layout, typography, branded cards, inputs, validation, and themes. Do not redesign screens as part of the SDK upgrade.
- Retain a community component when Expo UI cannot meet an existing accessibility, interaction, animation, or theming requirement. Record the reason and retry criteria rather than forcing a lower-quality replacement.
- Migrate icons incrementally through a Buddy-owned icon adapter. Prefer Expo Symbols on iOS where a semantic symbol exists and retain deterministic Android equivalents. Do not rewrite 240 icon-importing files in one unreviewable change.

## Dependency and Configuration Policy

- Use `npx expo install` for all Expo/native dependency changes.
- Remove stale Metro options already enabled by current Expo defaults, including manual `mjs` and package-exports configuration, after proving Tamagui and Firebase resolution still work.
- Keep custom Babel configuration only for Tamagui, the repository alias, and any SDK 56-required compiler transform. Remove stale aliasing and plugin configuration when Expo provides it by default.
- Review both package patches against upgraded dependencies. Delete patches that no longer apply or are no longer required.
- Move native permissions to least privilege. Remove obsolete Android storage permissions and request runtime permissions only at the feature boundary.
- Preserve the new architecture and edge-to-edge mode. Remove redundant config flags only when the SDK 56 template confirms they are defaults.

## Error Handling and Rollback

- No migration batch may combine an SDK baseline change, provider redesign, and UI-control replacement in the same commit.
- Stable app startup, authentication, profile loading, navigation, and data entry take priority over retaining experimental opt-ins.
- Every experimental capability must be independently reversible through config or a small isolated commit.
- If a third-party dependency does not support React Native 0.85/new architecture, first upgrade it, then replace it with Expo UI or a maintained alternative. Do not pin the whole app to SDK 54 for one dependency.
- Preserve cached profile and persisted query data formats unless a migration is explicitly added and tested.

## Validation

Each migration wave must pass the relevant subset; release readiness requires the full set:

- `npx expo-doctor` with no actionable failures.
- `npx tsc --noEmit`.
- ESLint and Prettier checks.
- Unit, integration, production, and targeted performance tests.
- Android and iOS production-mode exports.
- Android local development/release build and EAS Android preview build.
- EAS iOS preview build using the SDK 56-supported Xcode image.
- Fresh-install and upgrade-install smoke tests on physical Android and iOS devices.
- Runtime smoke coverage for startup, splash/fonts/assets, Google/phone/anonymous auth, profile load/update, membership, navigation/deep links/back gestures, notifications, contacts, image picking, file persistence, background tasks, purchases/paywall, and all migrated native controls.
- React Compiler healthcheck after dependency alignment.
- Before/after measurements for bundle size, startup time, Android clean/incremental build time, EAS Update payload size, and key screen interaction performance.

## Delivery Sequence

1. Repair the asset and provider failures and lock the green baseline.
2. Upgrade the SDK/toolchain and regenerate native projects.
3. Resolve compile, test, native build, and runtime compatibility issues.
4. Enable stable SDK 56 platform features.
5. Pilot and gate experimental features.
6. Introduce Expo UI adapters and replace native controls in domain-sized batches.
7. Remove obsolete packages, patches, compatibility code, and redundant configuration.
8. Run full Android/iOS release validation and record the final dependency and performance snapshot.

## Acceptance Criteria

- No unknown asset-module or missing user-provider runtime errors.
- One canonical user-profile context and one public `useUser()` hook.
- Expo Doctor is clean for the SDK 56 dependency matrix.
- Android and iOS preview builds install and complete the smoke suite.
- Existing product behavior and Tamagui visual identity are preserved.
- SDK 56 experimental features remain enabled only when their measured result meets the recorded threshold and no release-blocking regression exists.
- Community-native dependencies are removed only after their Expo UI adapters achieve behavioral and accessibility parity.
- The full quality gate is green, and no temporary compatibility shim or generated debug artifact remains.

## References

- [Expo SDK 56 release notes](https://expo.dev/changelog/sdk-56)
- [Expo SDK version metadata](https://exp.host/--/api/v2/versions)
- [Expo upgrade guide](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/)
- [Expo UI documentation](https://docs.expo.dev/versions/latest/sdk/ui/)
