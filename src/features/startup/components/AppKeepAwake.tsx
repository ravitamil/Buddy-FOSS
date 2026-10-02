import {useKeepAwake} from 'expo-keep-awake';

export const APP_KEEP_AWAKE_TAG = 'buddyio-foreground';

/** Keeps the display awake for the lifetime of the foreground app shell. */
export function AppKeepAwake() {
  useKeepAwake(APP_KEEP_AWAKE_TAG);

  return null;
}
