# Expo SDK 57 Modernization Plan

## Current SDK 57 posture

- Expo SDK 57 is installed and `expo-doctor` passes.
- `app.config.ts` already enables `experiments.reactCompiler`.
- `app.config.ts` already enables `experiments.autolinkingModuleResolution`.
- No active config uses `sdkVersion`.
- No active config uses `newArchEnabled`; SDK 55+ always runs the New Architecture.
- No `expo-av`, `expo-permissions`, or `expo-app-loading` package usage was found in `app/`, `src/`, `scripts/`, or `plugins/`.

## Changes made in this pass

- Replaced the stale `global.js` bootstrap import from deleted `src/services/EnhancedLoggerService` with live `src/services/LoggerService`.
- Kept the legacy `EnhancedLoggerService` global binding as a startup compatibility alias to avoid widening this slice.
- Added `appLogger` as the canonical global logger binding for code that still expects a logger global.

## Keep for now

- `babel.config.js`: required because it has the Tamagui Babel plugin, not only `babel-preset-expo`.
- `metro.config.js`: required because it adds the Tamagui Metro plugin and the `lottie` asset extension, not only Expo defaults.
- `expo-linear-gradient`: still an SDK 57 package and heavily used across UI. Remove only after replacing the design pattern with Tamagui/theme-native alternatives in a dedicated visual QA slice.
- `@expo/vector-icons`: still heavily used. Consider moving repeated icon usage behind a local icon facade first; direct migration to native symbols is not cross-platform equivalent for all current Ionicons/AntDesign/Fontisto usage.
- `@react-native-async-storage/async-storage`: still supported by Expo SDK 57. Do not delete broadly until storage ownership is migrated by domain and data retention behavior is tested.

## Follow-up migration slices

1. Image modernization: replace React Native `Image` use with `expo-image` for remote/profile/cache-heavy image surfaces, starting with profile and card imagery.
2. Storage modernization: move sensitive values to `expo-secure-store`, cache-heavy values to MMKV or SQLite-backed storage where appropriate, and leave Supabase Auth storage on the supported AsyncStorage adapter until an auth-specific migration is proven.
3. Icon cleanup: add a local icon facade and migrate feature screens away from raw `@expo/vector-icons` imports incrementally.
4. Gradient cleanup: replace decorative `expo-linear-gradient` wrappers with Tamagui theme primitives where the UI does not require native gradient rendering.
5. Patch audit: revalidate `patches/react-native-country-picker-modal+2.0.0.patch` and `patches/rn-emoji-keyboard+1.7.0.patch` against SDK 57 native builds before accepting them as still required.
6. Native proof: run the real Android build path from a short physical worktree because previous Windows builds hit `prefab_command.bat` launch failures under long pnpm paths.

## Verification commands

- `cmd /c npx expo-doctor@latest`
- `cmd /c npx tsc --noEmit`
- Focused Jest for any touched runtime surfaces.

## Gradient cleanup evidence

- Decorative native gradients were removed from the budget zero-state tint, confirmation dialog surface, toast accent stripe, and analytics period chips.
- `expo-linear-gradient` is still intentionally retained for 83 native-gradient call sites where the gradient is part of the visual behavior, including credit-card previews, shimmer/skeleton effects, progressive header fades, glass/FAB treatments, and card/detail surfaces that need visual QA before flattening to a single themed primitive.

## Android local build evidence

- Patch audit on 2026-07-03:
  - `cmd /c npx patch-package` applied `react-native-country-picker-modal@2.0.0` and `rn-emoji-keyboard@1.7.0` cleanly in the main checkout.
  - A fresh pnpm short copy at `C:\b\m` also applied both patches during `pnpm install`.
  - A fresh npm flat short copy at `C:\b\n` applied both patches during `npm install --legacy-peer-deps`.
  - Both patches remain required until the underlying packages natively cover the safe-area-context modal behavior and emoji keyboard initial-render/delete-button behavior.
- Native proof on 2026-07-03:
  - `cmd /c npx expo prebuild --platform android --clean` passed in `C:\b\n` and applied `[withMainActivityFragmentFix] Applied fragment factory fix`.
  - Android Studio JBR 21 was used with `JAVA_HOME=C:\Program Files\Android\Android Studio\jbr`.
  - `.\gradlew.bat :app:assembleDebug` from `C:\b\n\android` produced `C:\b\n\android\app\build\outputs\apk\debug\app-debug.apk` (`321139118` bytes).
  - `adb install -r -d C:\b\n\android\app\build\outputs\apk\debug\app-debug.apk` succeeded on `LBAQ7XSSYHLFCYSK`.
  - `adb reverse tcp:8081 tcp:8081` returned `8081`.
  - `adb shell am start -W -a android.intent.action.VIEW -d "exp+budget-buddy://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081" com.ravitamil.budgetbuddy` returned `Status: ok`, `Activity: com.ravitamil.budgetbuddy/.MainActivity`.
  - `adb shell dumpsys window` reported `mCurrentFocus=Window{... com.ravitamil.budgetbuddy/com.ravitamil.budgetbuddy.MainActivity}` and `mFocusedApp=ActivityRecord{... com.ravitamil.budgetbuddy/.MainActivity ...}`.
- pnpm native-build caveat:
  - A fresh pnpm short copy at `C:\b\m` still failed in native CMake with `ninja: error: manifest 'build.ninja' still dirty after 100 tries` under `.pnpm` paths.
  - The successful local native proof used a flat npm install only in the disposable short build copy; the repo remains pnpm-managed.

- Windows `eas build --local` is not the practical local route here; the local route is Expo prebuild plus Gradle.
- `cmd /c npx expo prebuild --platform android --clean` passed in the main checkout and in the short-path build copy.
- `android/local.properties` was required after clean prebuild because the regenerated Android project did not contain `sdk.dir`.
- Gradle with the system Temurin JDK 25 failed native CMake configuration with `WARNING: A restricted method in java.lang.System has been called`.
- Gradle with Android Studio JBR 21 progressed past that Java restriction.
- Building from `F:\prj\BuddyIO` and from `C:\b\BuddyIO-sdk57-build` still hit Windows CMake/ninja path-length failures through pnpm virtual-store paths.
- Building from the npm-installed short copy at `C:\b\b` produced `C:\b\b\android\app\build\outputs\apk\debug\app-debug.apk`.
- `adb install -r -d C:\b\b\android\app\build\outputs\apk\debug\app-debug.apk` succeeded on `LBAQ7XSSYHLFCYSK` (`RMX3867` / `RE5C86L1`).
- `adb reverse tcp:8081 tcp:8081` succeeded, and Metro served the SDK 57 dev-client bundle after restarting with `npx expo start --dev-client --host lan --port 8081`.
- Launch evidence: `adb shell am start -W -a android.intent.action.VIEW -d "exp+budget-buddy://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081" com.ravitamil.budgetbuddy` reported `Activity: com.ravitamil.budgetbuddy/.MainActivity`.
- Runtime evidence: Metro logged app startup through `StorageService`, `MembershipContext`, `SettingsContext`, `AuthContext`, `NotificationService`, and `AuthGuard`, then rendered the unauthenticated auth flow.
- Current device blocker is DNS, not native build/install: Android private DNS is set to `hostname` with `p2.freedns.controld.com`, and `adb shell ping -c 1 hpegizfqwwloutgvdcsd.supabase.co` returned `unknown host`.
- Screenshot evidence is blocked by the device lockscreen/notification shade: `dumpsys window` showed `mFocusedApp=ActivityRecord{... com.ravitamil.budgetbuddy/.MainActivity ...}` while `mCurrentFocus=Window{... NotificationShade}` and `mDreamingLockscreen=true`.

## Source checks

- Expo SDK 57 changelog: `https://expo.dev/changelog/sdk-57`
- Expo upgrade guide: `https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/`
- Expo New Architecture guide: `https://docs.expo.dev/guides/new-architecture/`
- Expo SDK 57 package docs: `https://docs.expo.dev/versions/latest/`
