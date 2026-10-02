import {colorToken} from '@/utils/themeColors';
import type {FindGroupOptionColor} from './findGroupTransactionOptions';

export const activeFindGroupOptionToken = (color: FindGroupOptionColor, isDarkMode: boolean) => {
  if (color === 'blue') return isDarkMode ? colorToken('blue5') : colorToken('blue7');
  return isDarkMode ? colorToken(`${color}6`) : colorToken(`${color}7`);
};
