import React from 'react';
import {Button, Input, Spinner, XStack, styled} from 'tamagui';

import {Ionicons} from './icons/AppIcon';

export interface SearchFieldProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  onClear?: () => void;
  autoFocus?: boolean;
  testID?: string;
}

export const SearchField = React.memo<SearchFieldProps>(
  ({
    value,
    onChangeText,
    placeholder = 'Search...',
    loading = false,
    onClear,
    autoFocus,
    testID,
  }) => {
    const clear = () => {
      onChangeText('');
      onClear?.();
    };

    return (
      <SearchFrame testID={testID}>
        <ThemedIonicon name="search" size={20} color="$textSecondary" />
        <SearchInput
          flex={1}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="$inputPlaceholder"
          autoFocus={autoFocus}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel={placeholder}
        />
        {loading ? (
          <Spinner size="small" color="$iconBrand" />
        ) : value.length ? (
          <ClearButton chromeless circular onPress={clear} accessibilityLabel="Clear search">
            <ThemedIonicon name="close-circle" size={20} color="$textSecondary" />
          </ClearButton>
        ) : null}
      </SearchFrame>
    );
  },
);

SearchField.displayName = 'SearchField';

const SearchFrame = styled(XStack, {
  name: 'BuddySearchField',
  alignItems: 'center',
  minHeight: 52,
  paddingHorizontal: '$4',
  borderRadius: '$4',
  borderWidth: 1,
  borderColor: '$inputBorder',
  backgroundColor: '$inputBackground',
  gap: '$2',
  focusWithinStyle: {borderColor: '$inputFocusBorder'},
});

const SearchInput = styled(Input, {
  name: 'BuddySearchInput',
  height: '100%',
  padding: 0,
  borderWidth: 0,
  backgroundColor: 'transparent',
  color: '$text',
  focusStyle: {borderWidth: 0, backgroundColor: 'transparent'},
});

const ClearButton = styled(Button, {
  minWidth: 40,
  minHeight: 40,
  padding: 0,
  backgroundColor: 'transparent',
});
const ThemedIonicon = styled(Ionicons, {}, {accept: {color: 'color'} as const});
