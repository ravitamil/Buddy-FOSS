import type {AuthResult} from './auth.types';

export enum AuthMethod {
  EMAIL = 'email',
  PHONE = 'phone',
  GOOGLE = 'google',
  ANONYMOUS = 'anonymous',
}

export interface UserProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  dateOfBirth: Date | null;
  profilePictureUri: string | null;
  cinId?: string;
  mobileNumber: string | null;
  emailAddress: string | null;
  authMethod: AuthMethod | null;
  isOnboardingComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  uid: string;
  email: string | null;
  phoneNumber: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  emailVerified: boolean;
  authProvider?: string | null;
  createdAt: Date;
  lastSignInAt: Date;
  dateOfBirth?: Date | null;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAnonymous: boolean;
  signInWithEmail: (email: string) => Promise<{verificationId: string}>;
  verifyEmailOTP: (email: string, otp: string) => Promise<User>;
  resendEmailOTP: (email: string) => Promise<void>;
  handleAuthUrl: (url: string) => Promise<User | null>;
  signInWithPhone: (phoneNumber: string) => Promise<{verificationId: string}>;
  verifyOTP: (phoneNumber: string, otp: string) => Promise<User>;
  resendOTP: (phoneNumber: string) => Promise<void>;
  signInWithGoogle: () => Promise<AuthResult>;
  signInAnonymously: (captchaToken?: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  clearError: () => void;
  isAccountDeletionInProgress: boolean;
  setAccountDeletionInProgress: (inProgress: boolean) => void;
}
