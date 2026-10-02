import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {FormField} from '@ravitamil/buddy-ui/FormField';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import React from 'react';
import {ScrollView, View, styled} from 'tamagui';

const groupTemplates = [
  {name: 'Trip', emoji: '✈️'},
  {name: 'Home', emoji: '🏠'},
  {name: 'Couple', emoji: '❤️'},
  {name: 'Event', emoji: '🎉'},
  {name: 'Project', emoji: '🚀'},
] as const;

interface AddGroupInformationSectionProps {
  groupEmoji: string;
  groupName: string;
  onApplyTemplate: (template: {name: string; emoji: string}) => void;
  onChangeName: (value: string) => void;
  onOpenEmojiPicker: () => void;
}

export const AddGroupInformationSection: React.FC<AddGroupInformationSectionProps> = ({
  groupEmoji,
  groupName,
  onApplyTemplate,
  onChangeName,
  onOpenEmojiPicker,
}) => (
  <VStack gap="$4">
    <HStack alignItems="flex-start" gap="$3">
      <View
        accessibilityRole="button"
        accessibilityLabel="Change group icon"
        onPress={onOpenEmojiPicker}
        pressStyle={{scale: 0.96}}
        width={68}
        height={68}
        borderRadius="$5"
        backgroundColor="$surfacePress"
        borderWidth={1}
        borderColor="$borderColor"
        alignItems="center"
        justifyContent="center">
        <Text fontSize={32} lineHeight={38}>
          {groupEmoji}
        </Text>
        <View
          position="absolute"
          right={-3}
          bottom={-3}
          width={24}
          height={24}
          borderRadius="$10"
          backgroundColor="$primary"
          borderWidth={2}
          borderColor="$background"
          alignItems="center"
          justifyContent="center">
          <ThemedIonicon name="pencil" size={11} color="$buttonPrimaryText" />
        </View>
      </View>

      <VStack flex={1}>
        <FormField
          label="Group name"
          required
          placeholder="Enter group name"
          value={groupName}
          onChangeText={onChangeName}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="next"
          maxLength={50}
          showCharacterCount
          testID="group-name"
        />
      </VStack>
    </HStack>

    <VStack gap="$2">
      <Text variant="caption" color="$textSecondary" weight="medium">
        Quick presets
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <HStack gap="$2" paddingBottom="$1">
          {groupTemplates.map((template) => {
            const isSelected = groupName === template.name && groupEmoji === template.emoji;

            return (
              <HStack
                key={template.name}
                accessibilityRole="button"
                accessibilityLabel={`Use ${template.name} group template`}
                accessibilityState={{selected: isSelected}}
                onPress={() => onApplyTemplate(template)}
                pressStyle={{scale: 0.97}}
                minHeight={40}
                alignItems="center"
                backgroundColor={isSelected ? '$surfacePress' : '$surface'}
                paddingHorizontal="$3"
                borderRadius="$10"
                borderWidth={1}
                borderColor={isSelected ? '$primary' : '$borderColor'}
                gap="$1.5">
                <Text fontSize={16}>{template.emoji}</Text>
                <Text
                  color={isSelected ? '$iconBrand' : '$text'}
                  weight={isSelected ? 'bold' : 'medium'}
                  variant="body2">
                  {template.name}
                </Text>
              </HStack>
            );
          })}
        </HStack>
      </ScrollView>
    </VStack>
  </VStack>
);

const ThemedIonicon = styled(Ionicons, {}, {accept: {color: 'color'} as const});
