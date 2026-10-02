/* eslint-disable development-quality/enforce-tamagui-usage */
import type {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import type {IncomeSource} from '@/types';

export interface IncomeTypeConfig {
  type: IncomeSource['type'];
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export const INCOME_CATEGORIES: IncomeTypeConfig[] = [
  {
    type: 'salary',
    label: 'Salary / Paycheck',
    description: 'Primary job, wages, or fixed employment',
    icon: 'briefcase-outline',
    color: '#3B82F6',
  },
  {
    type: 'freelance',
    label: 'Freelance / Consulting',
    description: 'Contracts, side projects, and gig work',
    icon: 'laptop-outline',
    color: '#10B981',
  },
  {
    type: 'business',
    label: 'Business / Venture',
    description: 'Business profits and company distributions',
    icon: 'business-outline',
    color: '#6366F1',
  },
  {
    type: 'investment',
    label: 'Investments / Dividends',
    description: 'Stock dividends, interest, and capital yields',
    icon: 'trending-up-outline',
    color: '#8B5CF6',
  },
  {
    type: 'rental',
    label: 'Rental Income',
    description: 'Property leases, tenant rent, or sublets',
    icon: 'home-outline',
    color: '#F59E0B',
  },
  {
    type: 'other',
    label: 'Other Inflow',
    description: 'Gifts, refunds, bonus, or miscellaneous',
    icon: 'cash-outline',
    color: '#06B6D4',
  },
];
