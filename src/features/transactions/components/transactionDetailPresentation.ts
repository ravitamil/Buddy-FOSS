import type {Transaction} from '@/types';

const emojiRegex =
  /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Presentation}\u200D\p{Emoji_Presentation}+|\p{Emoji}\u200D\p{Emoji}+|\p{Extended_Pictographic})+$/u;

export const isEmojiCategoryIcon = (icon: string): boolean =>
  icon.length > 0 && emojiRegex.test(icon);

export const getTransactionTypeLabel = (type: Transaction['type']): string =>
  type.charAt(0).toUpperCase() + type.slice(1);

export const getTransactionAmountColor = (amount: number): '$green5' | '$red5' =>
  amount > 0 ? '$green5' : '$red5';
