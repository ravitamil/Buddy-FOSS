import AsyncStorage from '@react-native-async-storage/async-storage';

import {getCurrencySymbol} from '../../constants/currencies';
import {logger as appLogger} from '../LoggerService';

const logger = appLogger.serviceLogger('NotificationCurrency');

export async function getPreferredCurrencySymbol(): Promise<string> {
  try {
    const currency = await AsyncStorage.getItem('@BuddyApp:currency');
    const currencyCode = currency || 'USD';
    return getCurrencySymbol(currencyCode);
  } catch (error) {
    logger.error('Error getting currency symbol', error);
    return '$';
  }
}

export async function formatCompactCurrency(amount: number): Promise<string> {
  const symbol = await getPreferredCurrencySymbol();
  const safeAmount = Number.isFinite(amount) ? amount : 0;

  if (safeAmount >= 10000000) {
    const crores = safeAmount / 10000000;
    return `${symbol}${crores >= 100 ? Math.round(crores) : crores.toFixed(crores >= 10 ? 1 : 2)}C`;
  }

  if (safeAmount >= 100000) {
    const lakhs = safeAmount / 100000;
    return `${symbol}${lakhs.toFixed(lakhs >= 10 ? 1 : 2)}L`;
  }

  if (safeAmount >= 1000) {
    const thousands = safeAmount / 1000;
    return `${symbol}${thousands.toFixed(thousands >= 10 ? 1 : 2)}K`;
  }

  return `${symbol}${safeAmount.toFixed(2)}`;
}
