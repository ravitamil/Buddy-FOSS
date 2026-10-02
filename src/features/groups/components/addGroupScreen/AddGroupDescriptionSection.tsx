import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {FormField} from '@ravitamil/buddy-ui/FormField';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import React from 'react';
import {styled} from 'tamagui';

interface AddGroupDescriptionSectionProps {
  groupDescription: string;
  isExpanded: boolean;
  onChangeDescription: (value: string) => void;
  onToggle: () => void;
}

export const AddGroupDescriptionSection: React.FC<AddGroupDescriptionSectionProps> = ({
  groupDescription,
  isExpanded,
  onChangeDescription,
  onToggle,
}) => (
  <VStack gap="$3">
    <HStack
      accessibilityRole="button"
      accessibilityLabel={isExpanded ? 'Hide group description' : 'Add group description'}
      accessibilityState={{expanded: isExpanded}}
      onPress={onToggle}
      pressStyle={{scale: 0.99}}
      minHeight={48}
      justifyContent="space-between"
      alignItems="center"
      gap="$3">
      <HStack alignItems="center" gap="$3" flex={1}>
        <HStack
          width={38}
          height={38}
          borderRadius="$4"
          backgroundColor="$surfacePress"
          justifyContent="center"
          alignItems="center">
          <ThemedIonicon name="document-text-outline" size={19} color="$iconBrand" />
        </HStack>
        <VStack gap="$0.5" flex={1}>
          <HStack alignItems="center" gap="$2">
            <Text variant="body1" color="$text" weight="semibold">
              Description
            </Text>
            <HStack
              backgroundColor="$surfacePress"
              paddingHorizontal="$2"
              paddingVertical="$0.5"
              borderRadius="$10">
              <Text variant="caption" color="$textSecondary" weight="medium">
                Optional
              </Text>
            </HStack>
          </HStack>
          <Text variant="caption" color="$textSecondary" numberOfLines={1}>
            {groupDescription.trim() ? groupDescription : 'Add context for your members'}
          </Text>
        </VStack>
      </HStack>
      <ThemedIonicon
        name={isExpanded ? 'chevron-up' : 'chevron-down'}
        size={18}
        color="$textSecondary"
      />
    </HStack>

    {isExpanded ? (
      <FormField
        placeholder="Enter group description"
        value={groupDescription}
        onChangeText={onChangeDescription}
        maxLength={100}
        multiline
        numberOfLines={3}
        autoCapitalize="sentences"
        autoCorrect={false}
        returnKeyType="done"
        helpText="A short note keeps everyone on the same page"
        showCharacterCount
        testID="group-description"
      />
    ) : null}
  </VStack>
);

const ThemedIonicon = styled(Ionicons, {}, {accept: {color: 'color'} as const});
