import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import {AddEditSubscriptionCard} from '../AddEditSubscriptionCard';
import {ChevronDown} from './AddEditSubscriptionControls';
import type {
  AddEditSubscriptionSectionsProps,
  IoniconName,
} from './addEditSubscriptionSectionsTypes';

export function CategoryIconSection({screen, isDarkMode}: AddEditSubscriptionSectionsProps) {
  return (
    <AddEditSubscriptionCard
      title="Category & Icon"
      subtitle="Personalize your subscription"
      isDarkMode={isDarkMode}
      accentColor="#f97316"
      icon="color-palette">
      <VStack gap="$4">
        <VStack gap="$3">
          <Text variant="caption" color="$textSecondary" weight="medium">
            Choose Category
          </Text>
          <VStack
            accessibilityRole="button"
            accessibilityLabel="Choose subscription category"
            onPress={() => screen.setShowCategoryDropdown(true)}
            pressStyle={{opacity: 0.8}}
            padding="$3"
            borderRadius="$2"
            borderWidth={1}
            borderColor={isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}
            backgroundColor="transparent">
            <HStack alignItems="center" justifyContent="space-between">
              <HStack alignItems="center" gap="$2">
                <HStack
                  width={28}
                  height={28}
                  borderRadius="$7"
                  backgroundColor={`${screen.currentCategory.color}40`}
                  justifyContent="center"
                  alignItems="center">
                  <Ionicons
                    name={screen.currentCategory.icons[0] as IoniconName}
                    size={16}
                    color={screen.currentCategory.color}
                  />
                </HStack>
                <Text color="$text" weight="medium">
                  {screen.selectedCategory}
                </Text>
              </HStack>
              <ChevronDown isDarkMode={isDarkMode} />
            </HStack>
          </VStack>
        </VStack>

        <VStack gap="$3">
          <Text variant="caption" color="$textSecondary" weight="medium">
            Choose Icon
          </Text>
          <HStack gap="$3" flexWrap="wrap">
            {screen.currentCategory.icons.map((icon) => (
              <HStack
                key={icon}
                accessibilityRole="button"
                accessibilityState={{selected: screen.selectedIcon === icon}}
                onPress={() => screen.handleIconSelect(icon)}
                pressStyle={{opacity: 0.8}}
                width={56}
                height={56}
                borderRadius="$4"
                borderWidth={2.5}
                borderColor={
                  screen.selectedIcon === icon
                    ? screen.formData.color
                    : isDarkMode
                      ? 'rgba(255, 255, 255, 0.15)'
                      : 'rgba(0, 0, 0, 0.08)'
                }
                backgroundColor={
                  screen.selectedIcon === icon
                    ? screen.formData.color
                    : isDarkMode
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.04)'
                }
                justifyContent="center"
                alignItems="center"
                shadowColor={screen.selectedIcon === icon ? screen.formData.color : 'transparent'}
                shadowOffset={{width: 0, height: 0}}
                shadowOpacity={screen.selectedIcon === icon ? 0.5 : 0}
                shadowRadius={screen.selectedIcon === icon ? 10 : 0}>
                <Ionicons
                  name={icon as IoniconName}
                  size={28}
                  color={
                    screen.selectedIcon === icon ? '#FFFFFF' : isDarkMode ? '#ffffff' : '#374151'
                  }
                />
              </HStack>
            ))}
          </HStack>
        </VStack>
      </VStack>
    </AddEditSubscriptionCard>
  );
}
