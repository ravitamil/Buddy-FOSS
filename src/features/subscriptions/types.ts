export type {
  SubscriptionData,
  SubscriptionStats,
  TrackerData,
  TrackerStats,
} from '@/types/finance.types';

export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface SubscriptionCategory {
  name: string;
  color: string;
  icons: string[];
}

export interface BillingCycleOption {
  label: string;
  value: BillingCycle;
}

export interface AddEditSubscriptionFormData {
  name: string;
  amount: string;
  billingCycle: BillingCycle;
  nextBilling: Date;
  category: string;
  icon: string;
  color: string;
  description: string;
  website: string;
  autoPayEnabled: boolean;
  reminderEnabled: boolean;
  reminderDaysBefore: number;
}

export const SUBSCRIPTION_CATEGORIES: SubscriptionCategory[] = [
  {
    name: 'Entertainment',
    color: '#E50914',
    icons: ['tv', 'musical-notes', 'game-controller', 'film'],
  },
  {name: 'Software', color: '#0066CC', icons: ['laptop', 'cloud', 'code-slash', 'desktop']},
  {name: 'Music', color: '#1DB954', icons: ['musical-notes', 'radio', 'headset', 'mic']},
  {name: 'Fitness', color: '#FF6B35', icons: ['fitness', 'bicycle', 'walk', 'barbell']},
  {name: 'News', color: '#FF4444', icons: ['newspaper', 'globe', 'library', 'document-text']},
  {name: 'Productivity', color: '#FF9500', icons: ['briefcase', 'calendar', 'create', 'folder']},
  {name: 'Social', color: '#1DA1F2', icons: ['people', 'chatbubbles', 'camera', 'heart']},
  {name: 'Education', color: '#4CAF50', icons: ['school', 'book', 'library', 'bulb']},
  {name: 'Food', color: '#FF5722', icons: ['restaurant', 'pizza', 'cafe', 'wine']},
  {name: 'Shopping', color: '#9C27B0', icons: ['bag', 'shirt', 'storefront', 'card']},
  {name: 'Transportation', color: '#607D8B', icons: ['car', 'train', 'airplane', 'boat']},
  {name: 'Utilities', color: '#795548', icons: ['home', 'flash', 'water', 'wifi']},
];

export const BILLING_CYCLES: BillingCycleOption[] = [
  {label: 'Weekly', value: 'weekly'},
  {label: 'Monthly', value: 'monthly'},
  {label: 'Quarterly', value: 'quarterly'},
  {label: 'Yearly', value: 'yearly'},
];
