import type {SyncAuthService} from './context-sync';

export interface CRUDServices<T> {
  storageService: {
    save: (items: T[]) => Promise<void>;
    load: () => Promise<T[]>;
  };
  remoteService?: {
    sync: (items: T[]) => Promise<void>;
    delete?: (id: string) => Promise<void>;
  };
  authService?: SyncAuthService;
}

export type EntityValidator<T> = (item: Partial<T>) => string[] | null;
