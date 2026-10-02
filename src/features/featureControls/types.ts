export type FeatureStatus = 'enabled' | 'hidden' | 'read_only' | 'maintenance' | 'disabled';

export type FeaturePlatform = 'all' | 'android' | 'ios';

export type FeatureKey =
  | 'analytics'
  | 'auth'
  | 'backupSync'
  | 'budgets'
  | 'categories'
  | 'emailAuth'
  | 'groups'
  | 'home'
  | 'investments'
  | 'loans'
  | 'membership'
  | 'notifications'
  | 'onboarding'
  | 'privacy'
  | 'phoneAuth'
  | 'savings'
  | 'settings'
  | 'support'
  | 'subscriptions'
  | 'trackers'
  | 'transactions'
  | 'wallets';

export type FeatureActionKind = 'read' | 'write' | 'background' | 'navigation';

export type FeatureAction =
  | 'analytics.view'
  | 'auth.anonymousSignIn'
  | 'auth.emailSignIn'
  | 'auth.googleSignIn'
  | 'auth.phoneSignIn'
  | 'auth.resendEmailOtp'
  | 'auth.resendPhoneOtp'
  | 'auth.signOut'
  | 'auth.verifyEmailOtp'
  | 'auth.verifyPhoneOtp'
  | 'backupSync.run'
  | 'budgets.create'
  | 'budgets.delete'
  | 'budgets.update'
  | 'categories.create'
  | 'categories.delete'
  | 'categories.update'
  | 'groups.acceptInvite'
  | 'groups.addExpense'
  | 'groups.addMember'
  | 'groups.create'
  | 'groups.delete'
  | 'groups.deleteExpense'
  | 'groups.invite'
  | 'groups.recalculateDebt'
  | 'groups.removeMember'
  | 'groups.settle'
  | 'groups.update'
  | 'groups.updateExpense'
  | 'investments.create'
  | 'investments.delete'
  | 'investments.deleteCategory'
  | 'investments.research'
  | 'investments.saveCategory'
  | 'investments.savePortfolio'
  | 'investments.update'
  | 'loans.autoRecordPayment'
  | 'loans.create'
  | 'loans.delete'
  | 'loans.recordPayment'
  | 'loans.update'
  | 'membership.customerCenter'
  | 'membership.purchase'
  | 'membership.restore'
  | 'notifications.budgetAlerts'
  | 'notifications.groupAlerts'
  | 'notifications.initialize'
  | 'notifications.schedulePaymentReminders'
  | 'notifications.sendPaymentSuccess'
  | 'notifications.updatePreferences'
  | 'onboarding.createProfile'
  | 'privacy.update'
  | 'savings.create'
  | 'savings.createRetirementPlan'
  | 'savings.delete'
  | 'savings.update'
  | 'settings.update'
  | 'settings.updateCurrency'
  | 'subscriptions.autoGenerate'
  | 'subscriptions.create'
  | 'subscriptions.delete'
  | 'subscriptions.recordPayment'
  | 'subscriptions.update'
  | 'transactions.create'
  | 'transactions.delete'
  | 'transactions.update'
  | 'wallets.create'
  | 'wallets.delete'
  | 'wallets.update';

export interface FeatureDefinition {
  feature: FeatureKey;
  label: string;
  defaultStatus: FeatureStatus;
  allowedStatuses: readonly FeatureStatus[];
  coreShell?: boolean;
  readOnlyAsEnabled?: boolean;
  dependencies?: readonly FeatureKey[];
}

export interface FeatureActionDefinition {
  action: FeatureAction;
  feature: FeatureKey;
  kind: FeatureActionKind;
  label: string;
}

export interface FeatureRouteDefinition {
  routePattern: string;
  feature: FeatureKey;
  action?: FeatureAction;
  actions?: readonly FeatureAction[];
  label: string;
}

export interface FeatureControlRow {
  featureKey: FeatureKey;
  platform: FeaturePlatform;
  environment: string;
  status: FeatureStatus;
  message?: string;
  actionOverrides: Partial<Record<FeatureAction, FeatureStatus>>;
  updatedAt?: string;
}

export interface ResolvedFeatureControl {
  feature: FeatureKey;
  status: FeatureStatus;
  message?: string;
  isVisible: boolean;
  canRead: boolean;
  canWrite: boolean;
  canExecute: boolean;
}

export interface ResolvedFeatureAction {
  action: FeatureAction;
  feature: FeatureKey;
  status: FeatureStatus;
  message?: string;
  isAllowed: boolean;
  kind: FeatureActionKind;
}

export interface ResolvedFeatureConfig {
  features: Record<FeatureKey, ResolvedFeatureControl>;
  actions: Record<FeatureAction, ResolvedFeatureAction>;
  source: 'bundled' | 'cache' | 'remote';
  updatedAt?: string;
}

export class FeatureControlError extends Error {
  readonly feature: FeatureKey;
  readonly action?: FeatureAction;
  readonly status: FeatureStatus;

  constructor(params: {
    feature: FeatureKey;
    action?: FeatureAction;
    status: FeatureStatus;
    message?: string;
  }) {
    super(
      params.message ??
        `${params.action ?? params.feature} is currently ${params.status.replace('_', ' ')}`,
    );
    this.name = 'FeatureControlError';
    this.feature = params.feature;
    this.action = params.action;
    this.status = params.status;
  }
}
