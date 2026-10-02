export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

export interface ContextState<T> {
  items: T[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isDirty: boolean;
}

export interface CRUDOperations<T> {
  items: T[];
  getById: (id: string) => T | null;
  add: (item: Omit<T, 'id'>) => Promise<T>;
  update: (id: string, updates: Partial<T>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  addMany: (items: Omit<T, 'id'>[]) => Promise<T[]>;
  deleteMany: (ids: string[]) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export type ContextAction<T> =
  | {type: 'SET_LOADING'; payload: boolean}
  | {type: 'SET_ERROR'; payload: string | null}
  | {type: 'SET_ITEMS'; payload: T[]}
  | {type: 'ADD_ITEM'; payload: T}
  | {type: 'UPDATE_ITEM'; payload: {id: string; updates: Partial<T>}}
  | {type: 'DELETE_ITEM'; payload: string}
  | {type: 'ADD_MANY_ITEMS'; payload: T[]}
  | {type: 'DELETE_MANY_ITEMS'; payload: string[]}
  | {type: 'SET_DIRTY'; payload: boolean}
  | {type: 'RESET_STATE'};
