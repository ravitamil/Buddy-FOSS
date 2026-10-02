import {User} from '../../types/context-foundation';

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  isAccountDeletionInProgress: boolean;
}

export type AuthAction =
  | {type: 'SET_LOADING'; payload: boolean}
  | {type: 'SET_ERROR'; payload: string | null}
  | {type: 'SET_USER'; payload: User | null}
  | {type: 'SET_INITIALIZED'; payload: boolean}
  | {type: 'SET_DELETION_IN_PROGRESS'; payload: boolean}
  | {type: 'RESET_STATE'};

export const LOCAL_COMMUNITY_USER: User = {
  uid: 'local_user',
  email: null,
  phoneNumber: null,
  displayName: 'Buddy User',
  photoURL: null,
  isAnonymous: true,
  emailVerified: false,
  createdAt: new Date(0),
  lastSignInAt: new Date(0),
};

export const initialAuthState: AuthState = {
  user: LOCAL_COMMUNITY_USER,
  isLoading: false,
  error: null,
  isInitialized: true,
  isAccountDeletionInProgress: false,
};

export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {...state, isLoading: action.payload};

    case 'SET_ERROR':
      return {...state, error: action.payload, isLoading: false};

    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isLoading: false,
        error: null,
      };

    case 'SET_INITIALIZED':
      return {...state, isInitialized: action.payload};

    case 'SET_DELETION_IN_PROGRESS':
      return {...state, isAccountDeletionInProgress: action.payload};

    case 'RESET_STATE':
      return {
        ...initialAuthState,
        isLoading: false,
        isInitialized: true,
        isAccountDeletionInProgress: false,
      };

    default:
      return state;
  }
};
