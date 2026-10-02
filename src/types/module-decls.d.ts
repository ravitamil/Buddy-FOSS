// Ambient module declarations to satisfy TypeScript for dynamic and platform-aware imports.
// These declarations ensure the editor and type checker resolve modules used via extensionless paths.

declare module '../config/firebase.config' {
  export type FirebaseServices = {
    app: any;
    auth: any;
    db: any;
    firestore: any;
    storage: any;
  };

  export function initializeFirebase(): Promise<FirebaseServices>;
  export function getFirebaseServices(): FirebaseServices;
  export function onAuthStateChanged(auth: any, callback: (user: any) => void): () => void;
  const _default: any;
  export default _default;
}

declare module '../services/SecureStore' {
  export function getItemAsync(key: string): Promise<string | null>;
  export function setItemAsync(key: string, value: string): Promise<void>;
  export function deleteItemAsync(key: string): Promise<void>;
  export function isAvailableAsync(): Promise<boolean>;
}
