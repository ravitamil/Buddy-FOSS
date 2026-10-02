# Expo SDK 56 Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete BuddyIO's Expo SDK 56 migration, adopt SDK 56 platform capabilities, replace eligible community-native controls with Expo UI adapters, and produce verified Android and iOS preview builds.

**Architecture:** Preserve Tamagui as the design/layout system while introducing Buddy-owned adapters around Expo UI and modern Expo APIs. Complete work in isolated commits: stabilization, platform baseline, native regeneration, stable API migrations, experimental pilots, native-control replacement, dependency cleanup, and release validation. The live worktree already contains an uncommitted partial SDK 56 migration; preserve it and finish it as the first bounded batch.

**Tech Stack:** Expo SDK 56.0.12, React Native 0.85.3, React 19.2.3, TypeScript 6.0.3, Expo Router 56, Expo UI 56, Tamagui 1.x, TanStack Query 5, Jest 29, pnpm 11, EAS Build/Update.

---

## File Map

- `app.config.ts`: typed Expo configuration, permissions, React Compiler, Hermes/build experiments, runtime version, and update URL.
- `eas.json`: development/preview/production channels and Android/iOS build profiles.
- `package.json`, `pnpm-lock.yaml`, `.npmrc`, `pnpm-workspace.yaml`: SDK 56 dependency matrix and package-manager contract.
- `src/context/UserContext.tsx`: single query-backed user-profile provider and public `useUser()` hook.
- `src/context/AppProviders.tsx`: provider order and remaining global native providers.
- `src/components/native/`: Buddy-owned Expo UI and platform adapters.
- `src/lib/http/`: shared `expo/fetch` request boundary.
- `src/services/filesystem/`: modern Expo File/Directory compatibility boundary.
- `src/utils/permissions.ts`, `src/features/groups/hooks/useGroupMemberEditor.ts`: least-privilege media/contact permission flows.
- `app/groups/[id]/_layout.tsx`: bounded Expo Router `ExperimentalStack` pilot.
- `scripts/sdk56/`: repeatable dependency, native-output, and performance verification scripts.
- `docs/quality/sdk56-baseline.md`: before/after measurements, retained experiments, and release evidence.

## Task 1: Finish and Commit the Existing Stabilization Batch

**Files:**

- Modify: `src/context/UserContext.tsx`
- Modify: `src/context/AppProviders.tsx`
- Modify: `src/components/auth/AuthenticationScreen.tsx`
- Modify: `src/components/ui/OfflineNotice.tsx`
- Modify: `src/features/groups/components/GroupsScreenModals.tsx`
- Delete: `src/context/UserContext.query.tsx`
- Test: `src/context/sdk56Architecture.test.ts`
- Create: `src/context/UserContext.test.tsx`

- [ ] **Step 1: Preserve the live worktree and record the exact stabilization diff**

Run:

```powershell
git status --short
git diff -- src/context/UserContext.tsx src/context/AppProviders.tsx src/components/auth/AuthenticationScreen.tsx src/components/ui/OfflineNotice.tsx src/features/groups/components/GroupsScreenModals.tsx src/context/UserContext.query.tsx src/context/sdk56Architecture.test.ts
```

Expected: only inspect; do not revert, normalize, or stage unrelated Phase 7/8 changes.

- [ ] **Step 2: Add behavior tests for fallback, cache cleanup, and optimistic rollback**

Add focused tests in `src/context/UserContext.test.tsx` using a real `QueryClientProvider` and mocked auth/storage/database boundaries:

```tsx
const createWrapper = (authValue: AuthContextType) => {
  const queryClient = new QueryClient({
    defaultOptions: {queries: {retry: false}, mutations: {retry: false}},
  });

  return ({children}: {children: React.ReactNode}) => (
    <QueryClientProvider client={queryClient}>
      <AuthContextTestProvider value={authValue}>
        <UserProvider>{children}</UserProvider>
      </AuthContextTestProvider>
    </QueryClientProvider>
  );
};

it('returns a default profile when remote and cache loading both fail', async () => {
  mockedStorage.getCachedProfile.mockRejectedValueOnce(new Error('cache unavailable'));
  mockedProfileService.getUserProfile.mockRejectedValueOnce(new Error('offline'));

  const {result} = renderHook(() => useUser(), {wrapper: createWrapper(authenticatedAuth)});

  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.profile?.id).toBe(authenticatedAuth.user?.uid);
  expect(result.current.error).toBeNull();
});

it('clears cached profile after authentication ends', async () => {
  const wrapper = createRerenderableWrapper(authenticatedAuth);
  renderHook(() => useUser(), {wrapper});

  wrapper.setAuthValue(unauthenticatedAuth);
  await waitFor(() => expect(mockedStorage.clearCachedProfile).toHaveBeenCalledTimes(1));
});

it('restores the previous cached query value when save fails', async () => {
  mockedProfileService.saveUserProfile.mockRejectedValueOnce(new Error('write failed'));
  const {result} = renderHook(() => useUser(), {wrapper: createWrapper(authenticatedAuth)});

  await waitFor(() => expect(result.current.profile).not.toBeNull());
  const previous = result.current.profile;

  await expect(result.current.updateProfile({displayName: 'Changed'})).rejects.toThrow(
    'write failed',
  );
  expect(result.current.profile).toEqual(previous);
});
```

- [ ] **Step 3: Run the new tests and verify the missing behavior fails**

Run:

```powershell
cmd /c pnpm exec jest src/context/UserContext.test.tsx --runInBand
```

Expected: fallback and logout-cache tests fail against the current partial implementation.

- [ ] **Step 4: Complete the canonical provider**

Update `UserContext.tsx` so remote/cache failures fall back to a default profile and logout clears persisted profile data:

```tsx
const loadProfile = async (user: User): Promise<UserProfile> => {
  let cachedProfile: UserProfile | null = null;

  try {
    cachedProfile = await restoreCachedProfile();
  } catch {
    cachedProfile = null;
  }

  try {
    const remoteProfile = await userProfileDatabaseService.getUserProfile(user.uid);
    const profile = remoteProfile
      ? mapRemoteProfile(user, remoteProfile)
      : (cachedProfile ?? createDefaultProfile(user));
    await cacheProfile(profile);
    return profile;
  } catch {
    const fallback = cachedProfile ?? createDefaultProfile(user);
    await cacheProfile(fallback);
    return fallback;
  }
};

useEffect(() => {
  if (!isAuthenticated) {
    queryClient.removeQueries({queryKey: queryKeys.users.all});
    void StorageService.clearCachedProfile();
  }
}, [isAuthenticated, queryClient]);
```

Keep one exported `UserProvider` and one exported `useUser()`. Do not recreate a compatibility provider.

- [ ] **Step 5: Verify stabilization**

Run:

```powershell
cmd /c pnpm exec jest src/context/UserContext.test.tsx src/context/sdk56Architecture.test.ts --runInBand
cmd /c pnpm exec tsc --noEmit
cmd /c npx expo export --platform android --output-dir artifacts\sdk56-stabilization
```

Expected: tests pass, TypeScript exits 0, and Metro bundles the static logo asset.

- [ ] **Step 6: Remove the temporary export and commit only stabilization files**

```powershell
$target = (Resolve-Path -LiteralPath 'artifacts\sdk56-stabilization').Path
$root = (Resolve-Path -LiteralPath 'artifacts').Path
if (-not $target.StartsWith($root + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw "Unexpected path: $target" }
Remove-Item -LiteralPath $target -Recurse -Force
git add -- src/context/UserContext.tsx src/context/AppProviders.tsx src/context/UserContext.query.tsx src/context/UserContext.test.tsx src/context/sdk56Architecture.test.ts src/components/auth/AuthenticationScreen.tsx src/components/ui/OfflineNotice.tsx src/features/groups/components/GroupsScreenModals.tsx
git commit -m "fix(context): stabilize sdk 56 startup"
```

## Task 2: Finalize the SDK 56 Package and Typed Configuration Baseline

**Files:**

- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `.npmrc`
- Modify: `pnpm-workspace.yaml`
- Delete: `yarn.lock`
- Delete: `app.config.js`
- Modify: `app.config.ts`
- Modify: `tsconfig.json`
- Modify: `babel.config.js`
- Modify: `metro.config.js`
- Test: `src/context/sdk56Architecture.test.ts`

- [ ] **Step 1: Add configuration contract assertions**

Extend `sdk56Architecture.test.ts`:

```ts
it('uses the SDK 56 typed config and package matrix', () => {
  const packageJson = JSON.parse(readProjectFile('package.json')) as {
    packageManager: string;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };
  const config = readProjectFile('app.config.ts');

  expect(packageJson.packageManager).toBe('pnpm@11.8.0');
  expect(packageJson.dependencies.expo).toBe('56.0.12');
  expect(packageJson.dependencies['react-native']).toBe('0.85.3');
  expect(packageJson.devDependencies.typescript).toBe('~6.0.3');
  expect(config).toContain('reactCompiler: true');
  expect(config).toContain("policy: 'appVersion'");
  expect(fs.existsSync(path.join(process.cwd(), 'app.config.js'))).toBe(false);
  expect(fs.existsSync(path.join(process.cwd(), 'yarn.lock'))).toBe(false);
});
```

- [ ] **Step 2: Run the contract test**

```powershell
cmd /c pnpm exec jest src/context/sdk56Architecture.test.ts --runInBand
```

Expected: pass only when the current package-manager/config migration is complete.

- [ ] **Step 3: Block permissions that plugins re-add**

Add `blockedPermissions` to `app.config.ts`:

```ts
android: {
  blockedPermissions: [
    'android.permission.READ_EXTERNAL_STORAGE',
    'android.permission.WRITE_EXTERNAL_STORAGE',
    'android.permission.WRITE_CONTACTS',
    'android.permission.RECORD_AUDIO',
  ],
  permissions: [
    'android.permission.POST_NOTIFICATIONS',
    'android.permission.VIBRATE',
    'android.permission.WAKE_LOCK',
    'android.permission.CAMERA',
    'android.permission.READ_MEDIA_IMAGES',
    'android.permission.READ_CONTACTS',
  ],
  // existing package, Google services, icon, and keyboard settings
},
```

The generated public config must not contain the four blocked permissions.

- [ ] **Step 4: Remove redundant default settings**

Keep `reactCompiler`, `typedRoutes`, and `autolinkingModuleResolution`. Remove explicit `useHermesV1` and `ios.usePrecompiledModules` because SDK 56 defaults them to true; retain only non-default experiment settings:

```ts
[
  'expo-build-properties',
  {
    android: {usePrecompiledHeaders: true},
    ios: {
      deploymentTarget: '16.4',
      ccacheEnabled: true,
    },
  },
],
```

Keep Metro limited to Expo defaults, Tamagui wrapping, CSS support, and the `.lottie` asset extension. Keep Babel limited to `babel-preset-expo` and the Tamagui plugin.

- [ ] **Step 5: Verify package/config alignment**

Run:

```powershell
cmd /c pnpm install --frozen-lockfile
cmd /c pnpm dlx expo-doctor
cmd /c pnpm exec expo config --type public
cmd /c pnpm exec tsc --noEmit
```

Expected: Expo Doctor 21/21, public config resolves SDK 56, and blocked permissions are absent.

- [ ] **Step 6: Commit the platform baseline**

```powershell
git add -- package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc yarn.lock app.config.js app.config.ts tsconfig.json babel.config.js metro.config.js src/context/sdk56Architecture.test.ts
git commit -m "build(expo): align sdk 56 toolchain"
```

## Task 3: Regenerate Native Projects and Revalidate Native Workarounds

**Files:**

- Modify: `plugins/withMainActivitySavedInstanceStateFix.js`
- Modify: `eas.json`
- Create: `scripts/sdk56/verify-native-output.ps1`
- Generated/ignored: `android/`, `ios/`

- [ ] **Step 1: Create a native-output verification script**

Create `scripts/sdk56/verify-native-output.ps1`:

```powershell
$manifest = Get-Content -Raw -LiteralPath 'android\app\src\main\AndroidManifest.xml'
$activity = Get-Content -Raw -LiteralPath 'android\app\src\main\java\com\ravitamil\budgetbuddy\MainActivity.kt'

$forbiddenPermissions = @(
  'android.permission.READ_EXTERNAL_STORAGE',
  'android.permission.WRITE_EXTERNAL_STORAGE',
  'android.permission.WRITE_CONTACTS',
  'android.permission.RECORD_AUDIO'
)

foreach ($permission in $forbiddenPermissions) {
  if ($manifest.Contains($permission)) {
    throw "Forbidden permission generated: $permission"
  }
}

if (-not $activity.Contains('super.onCreate(null)')) {
  throw 'react-native-screens restoration guard is missing'
}
```

- [ ] **Step 2: Regenerate native projects**

Run:

```powershell
cmd /c pnpm exec expo prebuild --clean
powershell -ExecutionPolicy Bypass -File scripts\sdk56\verify-native-output.ps1
```

Expected: Android and iOS projects regenerate from SDK 56 config and the permission check passes.

- [ ] **Step 3: Test whether the screens workaround is still required**

Temporarily remove `./plugins/withMainActivitySavedInstanceStateFix.js` from the local generated test configuration, regenerate, and run a development build through the known navigation stress path:

1. Open/close group detail repeatedly.
2. Switch tabs during list scrolling.
3. Background and resume the app.
4. Rotate only where supported.
5. Verify no fragment-restoration or `addViewAt` crash.

If the crash is absent in three consecutive runs, delete the plugin. If it reproduces, retain the plugin and add an idempotence test:

```js
expect(applyPlugin(mainActivityFixture)).toContain('super.onCreate(null)');
expect(applyPlugin(applyPlugin(mainActivityFixture))).toBe(applyPlugin(mainActivityFixture));
```

- [ ] **Step 4: Add EAS channels and iOS build image**

Update `eas.json`:

```json
{
  "cli": {"version": ">= 15.0.0", "appVersionSource": "remote"},
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "channel": "development"
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview",
      "android": {"buildType": "apk"},
      "ios": {"image": "latest"}
    },
    "production": {
      "autoIncrement": true,
      "channel": "production",
      "android": {"buildType": "app-bundle"},
      "ios": {"image": "latest"}
    }
  },
  "submit": {"production": {}}
}
```

- [ ] **Step 5: Build Android locally**

```powershell
cmd /c pnpm exec expo run:android --variant release
```

Expected: Gradle completes with React Native 0.85.3, Hermes v1, and precompiled headers enabled.

- [ ] **Step 6: Commit native-generation source changes**

Do not stage ignored generated native directories.

```powershell
git add -- app.config.ts eas.json plugins/withMainActivitySavedInstanceStateFix.js scripts/sdk56/verify-native-output.ps1
git commit -m "build(native): regenerate sdk 56 projects"
```

## Task 4: Make the Test Harness SDK 56-Native

**Files:**

- Modify: `jest.config.js`
- Modify: `src/test-setup.ts`
- Modify: `src/types/assets.d.ts`
- Test: `src/context/sdk56Architecture.test.ts`

- [ ] **Step 1: Add a clean-runtime assertion**

Add:

```ts
it('defines the Expo platform during Jest startup', () => {
  expect(process.env.EXPO_OS).toBe('android');
});
```

- [ ] **Step 2: Verify the assertion fails without setup**

```powershell
cmd /c pnpm exec jest src/context/sdk56Architecture.test.ts --runInBand
```

Expected: fail if `EXPO_OS` is not initialized.

- [ ] **Step 3: Set the Expo test platform before Expo modules load**

At the first executable line of `src/test-setup.ts`:

```ts
process.env.EXPO_OS ??= 'android';
```

Ensure `src/types/assets.d.ts` includes static image declarations:

```ts
declare module '*.png' {
  const source: import('react-native').ImageSourcePropType;
  export default source;
}
```

- [ ] **Step 4: Run the complete test matrix**

```powershell
cmd /c pnpm test:unit -- --watchAll=false --runInBand
cmd /c pnpm test:integration -- --watchAll=false --runInBand
cmd /c pnpm test:production -- --watchAll=false --runInBand
cmd /c pnpm exec react-compiler-healthcheck@latest
```

Expected: no Expo platform warning, all suites pass, and all components remain compiler-compatible.

- [ ] **Step 5: Commit**

```powershell
git add -- jest.config.js src/test-setup.ts src/types/assets.d.ts src/context/sdk56Architecture.test.ts
git commit -m "test(expo): align sdk 56 harness"
```

## Task 5: Introduce the `expo/fetch` Network Boundary

**Files:**

- Create: `src/lib/http/httpClient.ts`
- Create: `src/lib/http/httpClient.test.ts`
- Modify: `src/services/CurrencyConversionService.ts`
- Modify: `src/services/FinancialDataService.ts`
- Modify: `src/services/MarketNewsService.ts`
- Modify: `src/services/SupabaseAuthService.ts`

- [ ] **Step 1: Write request-boundary tests**

```ts
it('throws a typed HTTP error for non-success responses', async () => {
  mockedFetch.mockResolvedValueOnce(new Response('rate limited', {status: 429}));
  await expect(httpRequest('https://example.test')).rejects.toMatchObject({
    status: 429,
    body: 'rate limited',
  });
});

it('aborts after the configured timeout', async () => {
  jest.useFakeTimers();
  mockedFetch.mockImplementationOnce((_url, init) => {
    return new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () =>
        reject(new DOMException('Aborted', 'AbortError')),
      );
    });
  });

  const request = httpRequest('https://example.test', {timeoutMs: 1000});
  await jest.advanceTimersByTimeAsync(1000);
  await expect(request).rejects.toThrow('Request timed out');
});
```

- [ ] **Step 2: Verify tests fail**

```powershell
cmd /c pnpm exec jest src/lib/http/httpClient.test.ts --runInBand
```

- [ ] **Step 3: Implement the adapter**

```ts
import {fetch as expoFetch} from 'expo/fetch';

export class HttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: string,
  ) {
    super(message);
  }
}

export async function httpRequest(
  input: string | URL,
  options: RequestInit & {timeoutMs?: number} = {},
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 15_000);

  try {
    const response = await expoFetch(input, {...options, signal: controller.signal});
    if (!response.ok) {
      const body = await response.text();
      throw new HttpError(`HTTP ${response.status}`, response.status, body);
    }
    return response;
  } catch (error) {
    if (controller.signal.aborted) throw new Error('Request timed out');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
```

- [ ] **Step 4: Migrate the four direct fetch consumers**

Replace global `fetch(...)` with `httpRequest(...)`. Preserve each service's current JSON validation and domain error mapping; do not move business parsing into the adapter.

- [ ] **Step 5: Verify**

```powershell
cmd /c pnpm exec jest src/lib/http/httpClient.test.ts --runInBand
cmd /c pnpm exec tsc --noEmit
rg -n "\bfetch\(" src\services
```

Expected: no direct service-layer `fetch()` calls remain.

- [ ] **Step 6: Commit**

```powershell
git add -- src/lib/http src/services/CurrencyConversionService.ts src/services/FinancialDataService.ts src/services/MarketNewsService.ts src/services/SupabaseAuthService.ts
git commit -m "refactor(network): adopt expo fetch"
```

## Task 6: Migrate the Filesystem Adapter off the Legacy API

**Files:**

- Modify: `src/services/filesystem/fileSystemAdapter.ts`
- Create: `src/services/filesystem/fileSystemAdapter.test.ts`
- Modify: `src/services/ImageCacheService.ts`
- Modify: `src/services/LocalProfileService.ts`

- [ ] **Step 1: Define and test the compatibility surface**

Test the exact operations currently consumed: info, create directory, list, copy, delete, and download.

```ts
it('returns legacy-compatible file info from File and Directory objects', async () => {
  mockedPathInfo.mockReturnValue({exists: true, isDirectory: false});
  mockedFileSize.mockReturnValue(128);

  await expect(fileSystem.getInfoAsync('file:///cache/a.png')).resolves.toEqual({
    exists: true,
    isDirectory: false,
    size: 128,
    uri: 'file:///cache/a.png',
  });
});
```

- [ ] **Step 2: Run and verify failure**

```powershell
cmd /c pnpm exec jest src/services/filesystem/fileSystemAdapter.test.ts --runInBand
```

- [ ] **Step 3: Implement the modern adapter**

```ts
import {Directory, File, Paths, EncodingType} from 'expo-file-system';

export const documentDirectory = Paths.document.uri;
export const cacheDirectory = Paths.cache.uri;
export {EncodingType};

export const fileSystem = {
  async getInfoAsync(uri: string) {
    const info = Paths.info(uri);
    const node = info.isDirectory ? new Directory(uri) : new File(uri);
    return {
      exists: info.exists,
      isDirectory: info.isDirectory,
      size: info.exists ? (node.size ?? 0) : 0,
      uri,
    };
  },
  async makeDirectoryAsync(uri: string, options?: {intermediates?: boolean}) {
    new Directory(uri).create({intermediates: options?.intermediates, idempotent: true});
  },
  async readDirectoryAsync(uri: string) {
    return new Directory(uri).list().map((entry) => entry.name);
  },
  async copyAsync({from, to}: {from: string; to: string}) {
    await new File(from).copy(new File(to), {overwrite: true});
  },
  async deleteAsync(uri: string, options?: {idempotent?: boolean}) {
    const info = Paths.info(uri);
    if (!info.exists && options?.idempotent) return;
    (info.isDirectory ? new Directory(uri) : new File(uri)).delete();
  },
  async downloadAsync(url: string, destination: string) {
    const file = await File.downloadFileAsync(url, new File(destination), {idempotent: true});
    return {uri: file.uri, status: 200};
  },
};
```

Use the installed SDK 56 type signatures as the source of truth if a relocation option name differs.

- [ ] **Step 4: Verify service compatibility**

```powershell
cmd /c pnpm exec jest src/services/filesystem/fileSystemAdapter.test.ts --runInBand
cmd /c pnpm exec tsc --noEmit
rg -n "expo-file-system/legacy" src
```

Expected: no legacy import remains.

- [ ] **Step 5: Commit**

```powershell
git add -- src/services/filesystem/fileSystemAdapter.ts src/services/filesystem/fileSystemAdapter.test.ts src/services/ImageCacheService.ts src/services/LocalProfileService.ts
git commit -m "refactor(storage): adopt modern expo filesystem"
```

## Task 7: Modernize Permissions, Contacts, and Media Access

**Files:**

- Modify: `src/utils/permissions.ts`
- Modify: `src/features/groups/hooks/useGroupMemberEditor.ts`
- Create: `src/utils/permissions.test.ts`
- Modify: `app.config.ts`

- [ ] **Step 1: Write permission-result tests**

```ts
it('preserves canAskAgain from the native permission response', async () => {
  mockedNotifications.requestPermissionsAsync.mockResolvedValueOnce({
    status: 'denied',
    granted: false,
    canAskAgain: true,
    expires: 'never',
  });

  await expect(requestNotificationPermissions()).resolves.toMatchObject({
    granted: false,
    canAskAgain: true,
    status: 'denied',
  });
});

it('does not request broad media permission when image picker owns the flow', async () => {
  expect(usesMediaLibraryPermission()).toBe(false);
});
```

- [ ] **Step 2: Replace inferred `canAskAgain`**

Return the SDK response field instead of calculating it from `status`:

```ts
const response = await Notifications.requestPermissionsAsync();
return {
  granted: response.granted,
  canAskAgain: response.canAskAgain,
  status: response.status,
};
```

Delete `requestMediaLibraryPermissions` and `requestAllPermissions`; the live source scan confirms they have no consumer. Keep profile-image permission requests in `ProfilePicture.tsx` through `expo-image-picker` at the action boundary.

- [ ] **Step 3: Keep contact permission and selection inside the contact action**

In `useGroupMemberEditor`, use `granted`/`canAskAgain` from `getPermissionsAsync()` and only open settings when `canAskAgain` is false. Keep `presentContactPickerAsync()` as the least-privilege single-contact flow.

- [ ] **Step 4: Verify**

```powershell
cmd /c pnpm exec jest src/utils/permissions.test.ts --runInBand
cmd /c pnpm exec tsc --noEmit
cmd /c pnpm exec expo config --type public
```

Expected: no broad storage/write-contact/record-audio permissions in public config.

- [ ] **Step 5: Commit**

```powershell
git add -- app.config.ts src/utils/permissions.ts src/utils/permissions.test.ts src/features/groups/hooks/useGroupMemberEditor.ts
git commit -m "refactor(permissions): enforce least privilege"
```

## Task 8: Replace Bottom-Sheet and Date-Time Community Dependencies

**Files:**

- Create: `src/components/native/BuddyBottomSheet.ts`
- Create: `src/components/native/BuddyDateTimePicker.tsx`
- Create: `src/components/native/BuddyDateTimePicker.test.tsx`
- Modify: `src/context/AppProviders.tsx`
- Modify: date-picker consumers under `src/components/` and `src/features/`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: Add Expo UI adapters**

`BuddyBottomSheet.ts`:

```ts
export {
  BottomSheet,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
  BottomSheetScrollView,
} from '@expo/ui/community/bottom-sheet';
export type {BottomSheetMethods, BottomSheetProps} from '@expo/ui/community/bottom-sheet';
```

`BuddyDateTimePicker.tsx`:

```tsx
import ExpoDateTimePicker, {type DateTimePickerProps} from '@expo/ui/community/datetime-picker';

export type BuddyDateTimePickerProps = Omit<DateTimePickerProps, 'onChange'>;

export function BuddyDateTimePicker(props: BuddyDateTimePickerProps) {
  return <ExpoDateTimePicker {...props} />;
}
```

- [ ] **Step 2: Write picker behavior tests**

```tsx
it('forwards confirmation and dismissal separately', () => {
  const onValueChange = jest.fn();
  const onDismiss = jest.fn();
  render(
    <BuddyDateTimePicker
      value={new Date(2026, 0, 1)}
      onValueChange={onValueChange}
      onDismiss={onDismiss}
    />,
  );
  expect(mockedNativePicker).toHaveBeenCalledWith(
    expect.objectContaining({onValueChange, onDismiss}),
    undefined,
  );
});
```

- [ ] **Step 3: Replace the global providers**

In `AppProviders.tsx`, import `BottomSheetModalProvider` from the Buddy adapter. Remove `ActionSheetProvider`; the repository has no `useActionSheet()` consumer.

- [ ] **Step 4: Migrate date-picker consumers to modern callbacks**

Replace `DateTimePickerEvent` callbacks with:

```ts
const handleDateChange = useCallback((_event: DateTimePickerChangeEvent, date: Date) => {
  setSelectedDate(date);
}, []);
```

For Android dialog presentation, use:

```tsx
<BuddyDateTimePicker
  value={selectedDate}
  mode="date"
  presentation="dialog"
  onValueChange={(_event, date) => handleConfirm(date)}
  onDismiss={onClose}
/>
```

Update all current imports listed by:

```powershell
rg -l "@react-native-community/datetimepicker" src app
```

- [ ] **Step 5: Remove replaced dependencies**

```powershell
cmd /c pnpm remove @gorhom/bottom-sheet @expo/react-native-action-sheet @react-native-community/datetimepicker
```

- [ ] **Step 6: Verify**

```powershell
cmd /c pnpm exec jest src/components/native/BuddyDateTimePicker.test.tsx --runInBand
cmd /c pnpm exec tsc --noEmit
rg -n "@gorhom/bottom-sheet|@expo/react-native-action-sheet|@react-native-community/datetimepicker" src app package.json
```

Expected: no direct imports or package entries remain.

- [ ] **Step 7: Commit**

```powershell
git add -- package.json pnpm-lock.yaml src/components/native/BuddyBottomSheet.ts src/components/native/BuddyDateTimePicker.tsx src/components/native/BuddyDateTimePicker.test.tsx src/context/AppProviders.tsx src/components/ui/DatePickerModal.tsx src/features/transactions/hooks/useAddTransactionScreenModel.ts src/features/transactions/components/addTransactionForm/RecurrenceSection.tsx src/features/transactions/components/addTransactionForm/AmountDateSection.tsx src/features/subscriptions/hooks/useSubscriptionPaymentActions.ts src/features/subscriptions/hooks/useAddEditSubscriptionScreen.ts src/features/subscriptions/hooks/subscriptionDetailTypes.ts src/features/subscriptions/components/SubscriptionPaymentSheets.tsx src/features/subscriptions/components/addEditSubscriptionSections/ServiceInformationSection.tsx src/features/loans/components/AddEditLoanSheets.tsx src/features/investments/components/AddInvestmentFormSections.tsx src/features/savings/hooks/useAddSavingsGoalScreen.ts src/features/savings/components/addSavingsGoalForm/types.ts src/features/savings/components/addSavingsGoalForm/FinancialDetailsSection.tsx src/features/savings/components/addSavingsGoalForm/RecurringSavingsSection.tsx
git commit -m "refactor(ui): adopt expo native sheets and dates"
```

## Task 9: Replace Masked Views and Native Switches

**Files:**

- Create: `src/components/native/BuddyMaskedView.ts`
- Create: `src/components/native/BuddyNativeSwitch.tsx`
- Create: `src/components/native/BuddyNativeSwitch.test.tsx`
- Modify: `src/components/ui/ProgressiveBlurHeader.tsx`
- Modify: `src/components/ui/navigationHeader/ProgressiveHeaderBackground.tsx`
- Modify: `src/features/transactions/components/addTransactionForm/RecurrenceSection.tsx`
- Modify: `src/features/settings/components/NotificationSettingsRows.tsx`
- Modify: `src/features/settings/components/PrivacySecurityCards.tsx`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: Create adapters**

```ts
export {default} from '@expo/ui/community/masked-view';
export type {MaskedViewProps} from '@expo/ui/community/masked-view';
```

```tsx
import {Host, Switch} from '@expo/ui';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';

export interface BuddyNativeSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  label?: string;
  testID?: string;
}

export function BuddyNativeSwitch(props: BuddyNativeSwitchProps) {
  const {isDarkMode} = useTamaguiTheme();
  return (
    <Host matchContents colorScheme={isDarkMode ? 'dark' : 'light'}>
      <Switch {...props} />
    </Host>
  );
}
```

- [ ] **Step 2: Test controlled switch behavior**

```tsx
it('forwards controlled state and changes', () => {
  const onValueChange = jest.fn();
  render(<BuddyNativeSwitch value onValueChange={onValueChange} testID="notifications" />);
  expect(mockedExpoSwitch).toHaveBeenCalledWith(
    expect.objectContaining({value: true, onValueChange, testID: 'notifications'}),
    undefined,
  );
});
```

- [ ] **Step 3: Replace imports and remove obsolete packages**

Replace the two masked-view imports and three React Native `Switch` imports. Do not replace `ModernToggleSwitch`; it is a branded Tamagui control, not a raw native dependency.

```powershell
cmd /c pnpm remove @react-native-masked-view/masked-view @react-native-community/slider @react-native-picker/picker
```

The slider and picker packages are removed because the live source has no consumers.

- [ ] **Step 4: Verify**

```powershell
cmd /c pnpm exec jest src/components/native/BuddyNativeSwitch.test.tsx --runInBand
cmd /c pnpm exec tsc --noEmit
rg -n "@react-native-masked-view/masked-view|@react-native-community/slider|@react-native-picker/picker|from 'react-native'.*Switch" src app package.json
```

- [ ] **Step 5: Commit**

```powershell
git add -- package.json pnpm-lock.yaml src/components/native/BuddyMaskedView.ts src/components/native/BuddyNativeSwitch.tsx src/components/native/BuddyNativeSwitch.test.tsx src/components/ui/ProgressiveBlurHeader.tsx src/components/ui/navigationHeader/ProgressiveHeaderBackground.tsx src/features/transactions/components/addTransactionForm/RecurrenceSection.tsx src/features/settings/components/NotificationSettingsRows.tsx src/features/settings/components/PrivacySecurityCards.tsx
git commit -m "refactor(ui): adopt expo masks and switches"
```

## Task 10: Establish the Cross-Platform Expo Icon Adapter

**Files:**

- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `src/components/native/BuddyIcon.tsx`
- Create: `src/components/native/buddyIconRegistry.ts`
- Create: `src/components/native/BuddyIcon.test.tsx`
- Modify: `src/components/ui/navigationHeader/HeaderBackButton.tsx`
- Modify: `src/components/ui/CustomTabBar.tsx`
- Modify: `src/components/auth/AuthenticationScreen.tsx`

- [ ] **Step 1: Install Material Symbols through Expo**

```powershell
cmd /c npx expo install @expo/material-symbols
```

- [ ] **Step 2: Create a semantic registry**

```ts
import {Icon} from '@expo/ui';

export const buddyIcons = {
  back: Icon.select({
    ios: 'chevron.backward',
    android: import('@expo/material-symbols/arrow_back.xml'),
  }),
  home: Icon.select({
    ios: 'house.fill',
    android: import('@expo/material-symbols/home.xml'),
  }),
  moon: Icon.select({
    ios: 'moon.fill',
    android: import('@expo/material-symbols/dark_mode.xml'),
  }),
  sun: Icon.select({
    ios: 'sun.max.fill',
    android: import('@expo/material-symbols/light_mode.xml'),
  }),
} as const;
```

`BuddyIcon.tsx`:

```tsx
import {Host, Icon} from '@expo/ui';
import {buddyIcons} from './buddyIconRegistry';

export function BuddyIcon({
  name,
  size = 24,
  color,
  accessibilityLabel,
}: {
  name: keyof typeof buddyIcons;
  size?: number;
  color?: string;
  accessibilityLabel?: string;
}) {
  return (
    <Host matchContents>
      <Icon
        name={buddyIcons[name]}
        size={size}
        color={color}
        accessibilityLabel={accessibilityLabel}
      />
    </Host>
  );
}
```

- [ ] **Step 3: Pilot only shared, high-frequency icons**

Migrate the header back icon, tab-bar home icon, and authentication theme icon. Keep the remaining vector-icon imports until domain-sized migration batches are separately approved.

- [ ] **Step 4: Verify platform asset resolution**

```powershell
cmd /c pnpm exec jest src/components/native/BuddyIcon.test.tsx --runInBand
cmd /c npx expo export --platform android --output-dir artifacts\sdk56-icons-android
```

Run the iOS export in EAS or macOS CI. Confirm Android XML assets and iOS SF Symbols render with accessible labels.

- [ ] **Step 5: Clean artifacts and commit**

```powershell
Remove-Item -LiteralPath (Resolve-Path 'artifacts\sdk56-icons-android').Path -Recurse -Force
git add -- package.json pnpm-lock.yaml src/components/native/BuddyIcon.tsx src/components/native/buddyIconRegistry.ts src/components/native/BuddyIcon.test.tsx src/components/ui/navigationHeader/HeaderBackButton.tsx src/components/ui/CustomTabBar.tsx src/components/auth/AuthenticationScreen.tsx
git commit -m "feat(ui): add native icon adapter"
```

## Task 11: Pilot Expo Router Experimental Stack

**Files:**

- Create: `app/groups/[id]/_layout.tsx`
- Create: `src/navigation/experimentalStackConfig.ts`
- Create: `src/navigation/experimentalStackConfig.test.ts`
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Define a reversible pilot flag**

```ts
export const useExperimentalGroupStack =
  process.env.EXPO_PUBLIC_EXPERIMENTAL_GROUP_STACK !== 'false';
```

The default is enabled, matching the approved broad-experiment policy. Setting the environment variable to `false` is the rollback.

- [ ] **Step 2: Test the default and rollback**

```ts
it('enables the SDK 56 group stack pilot by default', () => {
  delete process.env.EXPO_PUBLIC_EXPERIMENTAL_GROUP_STACK;
  jest.resetModules();
  expect(require('./experimentalStackConfig').useExperimentalGroupStack).toBe(true);
});
```

- [ ] **Step 3: Add the nested group stack**

```tsx
import {ExperimentalStack, Stack} from 'expo-router';
import {useExperimentalGroupStack} from '@/navigation/experimentalStackConfig';

const GroupStack = useExperimentalGroupStack ? ExperimentalStack : Stack;

export default function GroupLayout() {
  return (
    <GroupStack screenOptions={{headerShown: false}}>
      <GroupStack.Screen name="index" />
      <GroupStack.Screen name="activity" />
      <GroupStack.Screen name="add-transaction" />
      <GroupStack.Screen name="all-transactions" />
      <GroupStack.Screen name="edit" />
      <GroupStack.Screen name="edit-transaction" />
      <GroupStack.Screen name="settlement-history" />
    </GroupStack>
  );
}
```

Remove duplicate root-stack declarations for these nested routes from `app/_layout.tsx`.

- [ ] **Step 4: Validate the navigation matrix**

Test:

1. Direct deep link to `/groups/:id`.
2. Push to activity, edit, add transaction, and settlement history.
3. Android predictive-back gesture from every nested route.
4. Hardware back.
5. App background/resume while nested.
6. Custom header remains the only visible header.

Run:

```powershell
cmd /c pnpm exec jest src/navigation/experimentalStackConfig.test.ts --runInBand
cmd /c pnpm exec expo export --platform android --output-dir artifacts\sdk56-router-pilot
```

- [ ] **Step 5: Retain or roll back based on explicit criteria**

Retain when all six scenarios pass three consecutive runs with no `react-native-screens`, gesture, or state-restoration error. Otherwise set `EXPO_PUBLIC_EXPERIMENTAL_GROUP_STACK=false`, retain the standard stack, and record the failing scenario in `docs/quality/sdk56-baseline.md`.

- [ ] **Step 6: Commit**

```powershell
git add -- app/_layout.tsx app/groups/[id]/_layout.tsx src/navigation/experimentalStackConfig.ts src/navigation/experimentalStackConfig.test.ts
git commit -m "feat(navigation): pilot experimental group stack"
```

## Task 12: Configure EAS Update and Measure SDK 56 Experiments

**Files:**

- Modify: `app.config.ts`
- Modify: `eas.json`
- Create: `scripts/sdk56/measure-android-build.ps1`
- Create: `docs/quality/sdk56-baseline.md`

- [ ] **Step 1: Configure the update URL**

Add:

```ts
updates: {
  url: 'https://u.expo.dev/c5df49ec-f32a-41c9-87c5-e6ce9333068a',
  checkAutomatically: 'ON_LOAD',
  fallbackToCacheTimeout: 0,
},
runtimeVersion: {policy: 'appVersion'},
```

SDK 56 enables bsdiff-based bundle patches by default; do not add a private compatibility flag.

- [ ] **Step 2: Add repeatable Android build timing**

Create `scripts/sdk56/measure-android-build.ps1`:

```powershell
param([ValidateSet('clean','incremental')] [string]$Mode)

Push-Location android
try {
  if ($Mode -eq 'clean') {
    .\gradlew.bat clean | Out-Host
  }
  $elapsed = Measure-Command { .\gradlew.bat assembleRelease | Out-Host }
  [pscustomobject]@{
    mode = $Mode
    seconds = [math]::Round($elapsed.TotalSeconds, 2)
    timestamp = (Get-Date).ToString('o')
  } | ConvertTo-Json
} finally {
  Pop-Location
}
```

- [ ] **Step 3: Record experiment thresholds**

Create `docs/quality/sdk56-baseline.md` with these fixed retention rules:

```md
| Experiment                  | Keep when                                                                          | Roll back when                                                                |
| --------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Android precompiled headers | Median clean or incremental build improves by at least 10% across 3 runs           | Improvement is under 10% or build reliability regresses                       |
| iOS ccache                  | Second EAS/macOS build improves by at least 10%                                    | Cache errors or no measurable improvement                                     |
| Experimental group stack    | All navigation scenarios pass 3 consecutive runs                                   | Any crash, lost state, broken deep link, duplicate header, or back regression |
| Update bundle patching      | Second update download is at least 20% smaller for a representative JS-only change | Rollback/reload fails or size improvement is under 20%                        |
```

- [ ] **Step 4: Measure**

```powershell
powershell -ExecutionPolicy Bypass -File scripts\sdk56\measure-android-build.ps1 clean
powershell -ExecutionPolicy Bypass -File scripts\sdk56\measure-android-build.ps1 incremental
cmd /c pnpm exec eas update --channel preview --message "sdk56 baseline"
```

Publish a second JS-only update after a harmless test label change, compare payloads, then revert that label before committing.

- [ ] **Step 5: Commit only retained settings and evidence**

```powershell
git add -- app.config.ts eas.json scripts/sdk56/measure-android-build.ps1 docs/quality/sdk56-baseline.md
git commit -m "perf(expo): retain measured sdk 56 experiments"
```

## Task 13: Remove Obsolete Dependencies, Patches, and Compatibility Code

**Files:**

- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Delete or retain with evidence: `patches/react-native-country-picker-modal+2.0.0.patch`
- Delete or retain with evidence: `patches/rn-emoji-keyboard+1.7.0.patch`
- Modify: `global.js`
- Modify: `docs/quality/sdk56-baseline.md`

- [ ] **Step 1: Generate an unused-package candidate list**

```powershell
cmd /c pnpm dlx depcheck --json > artifacts\sdk56-depcheck.json
rg -n "expo-av|expo-document-picker|expo-random|react-native-linear-gradient|react-native-modal" app src
```

Manually confirm every candidate because Metro assets, config plugins, and dynamic imports can produce false positives.

- [ ] **Step 2: Remove confirmed unused packages through Expo/pnpm**

Remove `expo-av`, `expo-random`, and `expo-document-picker`; the current source scan confirms all three have no consumer. Remove the `expo-document-picker` app-config plugin in the same change.

```powershell
cmd /c pnpm remove expo-av expo-random expo-document-picker
```

- [ ] **Step 3: Revalidate patches**

For each patch:

1. Temporarily move the patch outside `patches/`.
2. Run `pnpm install --frozen-lockfile`.
3. Exercise the country picker or emoji keyboard.
4. Delete the patch if behavior passes; restore it if the original failure returns.
5. Record retained-patch purpose and upstream issue in the baseline document.

- [ ] **Step 4: Remove stale bootstrap code**

If no source references the global logger stub or clipping guard after SDK 56 runtime validation, reduce `global.js` to only proven-required bootstrap behavior. Do not remove the Fabric clipping guard unless the navigation/list stress test passes three consecutive runs without it.

- [ ] **Step 5: Verify**

```powershell
cmd /c pnpm install --frozen-lockfile
cmd /c pnpm dlx expo-doctor
cmd /c pnpm exec tsc --noEmit
cmd /c pnpm test:unit -- --watchAll=false --runInBand
```

- [ ] **Step 6: Commit**

```powershell
git add -- package.json pnpm-lock.yaml app.config.ts patches/react-native-country-picker-modal+2.0.0.patch patches/rn-emoji-keyboard+1.7.0.patch global.js docs/quality/sdk56-baseline.md
git commit -m "chore(expo): remove sdk 54 leftovers"
```

## Task 14: Full Android and iOS Release Validation

**Files:**

- Modify: `docs/quality/sdk56-baseline.md`
- Modify: `.planning/phases/08-clean-structure-hardening/08-PROGRESS.md`
- Modify: `.planning/phases/08-clean-structure-hardening/08-STRUCTURE-SNAPSHOT.md`

- [ ] **Step 1: Run local static and test gates**

```powershell
cmd /c pnpm dlx expo-doctor
cmd /c pnpm exec tsc --noEmit
cmd /c pnpm run format:check
cmd /c pnpm exec eslint src --quiet
cmd /c pnpm test:unit -- --watchAll=false --runInBand
cmd /c pnpm test:integration -- --watchAll=false --runInBand
cmd /c pnpm test:production -- --watchAll=false --runInBand
cmd /c pnpm test:performance -- --watchAll=false --runInBand
cmd /c pnpm exec react-compiler-healthcheck@latest
```

Expected: zero failures. Do not waive TypeScript, Expo Doctor, or bundle failures.

- [ ] **Step 2: Run production exports**

```powershell
cmd /c npx expo export --platform android --output-dir artifacts\sdk56-release-android
cmd /c npx expo export --platform ios --output-dir artifacts\sdk56-release-ios
```

Expected: both bundles complete and include the static logo and Expo UI native-control modules.

- [ ] **Step 3: Build preview binaries**

```powershell
cmd /c pnpm exec eas build --profile preview --platform android
cmd /c pnpm exec eas build --profile preview --platform ios
```

Expected: installable Android APK and iOS internal-distribution build.

- [ ] **Step 4: Execute the device smoke matrix**

On physical Android and iOS devices verify:

1. Fresh install, splash, fonts, logo, dark/light themes.
2. Google, phone, and anonymous authentication.
3. Profile cache restore, remote refresh, update rollback, and membership access.
4. Tabs, group nested routes, deep links, hardware/predictive back.
5. Notifications and settings redirection.
6. Contact picker and profile image picker.
7. Image cache and local profile file persistence across restart.
8. Background task registration.
9. RevenueCat paywall, purchase cancellation, and restore.
10. Every migrated date picker, sheet, switch, mask, and pilot icon.
11. Offline startup and reconnection.
12. Update download, reload, and rollback.

- [ ] **Step 5: Record final evidence**

Update `docs/quality/sdk56-baseline.md` with:

- Exact package versions.
- Gate command results and dates.
- Android/iOS build URLs or IDs.
- Device/OS versions.
- Retained and rolled-back experiments with measurements.
- Remaining community-native dependencies and explicit reasons.

Update Phase 8 progress and structure snapshot with the validated SDK 56 batch and current dependency counts.

- [ ] **Step 6: Remove generated verification artifacts**

Verify each path resolves under `artifacts/` before recursively deleting:

```powershell
Remove-Item -LiteralPath (Resolve-Path 'artifacts\sdk56-release-android').Path -Recurse -Force
Remove-Item -LiteralPath (Resolve-Path 'artifacts\sdk56-release-ios').Path -Recurse -Force
Remove-Item -LiteralPath (Resolve-Path 'artifacts\sdk56-depcheck.json').Path -Force
```

- [ ] **Step 7: Commit final evidence**

```powershell
git add -- docs/quality/sdk56-baseline.md .planning/phases/08-clean-structure-hardening/08-PROGRESS.md .planning/phases/08-clean-structure-hardening/08-STRUCTURE-SNAPSHOT.md
git commit -m "docs(expo): verify sdk 56 release"
```

## Final Acceptance Gate

The migration is complete only when all statements are true:

- Expo Doctor reports all checks passing.
- Expo, React Native, React, TypeScript, Expo Router, Jest Expo, Reanimated, Worklets, and React Native Screens match the SDK 56 matrix.
- The app has one user-profile provider and one `useUser()` hook.
- Android and iOS preview builds install and pass the smoke matrix.
- No source imports `expo-file-system/legacy`.
- No source imports the replaced bottom-sheet, date-time-picker, masked-view, slider, picker, or action-sheet packages.
- Tamagui remains the design/layout/theme layer.
- Expo UI adapters own migrated native controls.
- Experimental features have measured evidence and independent rollback switches.
- No temporary export, debug harness, or generated verification artifact remains.
- Unrelated dirty files were not staged, reverted, normalized, or committed.
