/**
 * Type definitions for Google Web APIs
 * These types are needed for web platform Google Sign-In functionality
 */

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          disableAutoSelect: () => void;
          cancel: () => void;
          onGoogleLibraryLoad: () => void;
          revoke: (email: string, callback: (response: any) => void) => void;
        };
      };
      gapi?: {
        load: (api: string, callback: () => void) => void;
        auth2: {
          getAuthInstance: () => any;
          init: (config: any) => Promise<any>;
        };
      };
    };
  }
}

export {};
