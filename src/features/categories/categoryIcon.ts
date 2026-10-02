const FALLBACK_CATEGORY_ICON = 'C';

type GraphemeSegmenter = {
  segment: (value: string) => Iterable<{segment: string}>;
};

type IntlWithSegmenter = typeof Intl & {
  Segmenter?: new (
    locales?: string | string[],
    options?: {granularity?: 'grapheme'},
  ) => GraphemeSegmenter;
};

/** Returns one user-perceived character, preserving multi-code-point emoji when supported. */
export function toSingleCategoryIcon(value: string): string {
  const normalizedValue = value.trim();
  if (!normalizedValue) return '';

  const Segmenter = (Intl as IntlWithSegmenter).Segmenter;
  if (Segmenter) {
    const iterator = new Segmenter(undefined, {granularity: 'grapheme'})
      .segment(normalizedValue)
      [Symbol.iterator]();
    return iterator.next().value?.segment ?? '';
  }

  return Array.from(normalizedValue)[0] ?? '';
}

export function getDefaultCategoryIcon(categoryName: string): string {
  return toSingleCategoryIcon(categoryName).toLocaleUpperCase() || FALLBACK_CATEGORY_ICON;
}

/** Resolves a display icon at persistence time without interrupting text replacement. */
export function getPersistedCategoryIcon(icon: string, categoryName: string): string {
  return toSingleCategoryIcon(icon) || getDefaultCategoryIcon(categoryName);
}
