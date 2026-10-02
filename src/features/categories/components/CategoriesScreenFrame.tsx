import {HStack, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import Animated from 'react-native-reanimated';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import {CustomNavigationHeader, ScreenContainer} from '@/components/ui';
import type {UseCategoriesScreenResult} from '../hooks/useCategoriesScreen';
import {CategorySection} from './CategoriesScreenSections';

export const CategoriesScreenFrame: React.FC<{screen: UseCategoriesScreenResult}> = ({screen}) => (
  <ScreenContainer dotSize={2} dotSpacing={18} edges={['bottom']}>
    <Animated.ScrollView
      onScroll={screen.onScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{paddingTop: 118, paddingBottom: 100}}>
      <VStack flex={1} padding="$4" gap="$4">
        <CustomNavigationHeader
          title="Categories"
          subtitle="Manage your income and expense categories"
          onBackPress={screen.handleBack}
          mode="collapsing"
          {...screen.headerProps}
          rightElement={
            <HStack
              accessibilityRole="button"
              accessibilityLabel="Add category"
              onPress={screen.handleAddCategory}
              pressStyle={{opacity: 0.7}}
              backgroundColor={
                screen.isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'
              }
              borderRadius="$10"
              width={40}
              height={40}
              alignItems="center"
              justifyContent="center"
              borderWidth={1}
              borderColor={
                screen.isDarkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'
              }>
              <Ionicons
                name="add"
                size={20}
                color={screen.isDarkMode ? 'rgba(59, 130, 246, 0.9)' : 'rgba(59, 130, 246, 0.8)'}
              />
            </HStack>
          }
        />
        <CategorySection
          title="Expense Categories"
          categories={screen.categoryGroups.expense}
          accentColor="#EF4444"
          isDarkMode={screen.isDarkMode}
          onEdit={screen.handleEditCategory}
          onDelete={screen.handleDeleteCategory}
          isMandatoryCategory={screen.isMandatoryCategory}
        />
        <CategorySection
          title="Income Categories"
          categories={screen.categoryGroups.income}
          accentColor="#22C55E"
          isDarkMode={screen.isDarkMode}
          onEdit={screen.handleEditCategory}
          onDelete={screen.handleDeleteCategory}
          isMandatoryCategory={screen.isMandatoryCategory}
        />
      </VStack>
    </Animated.ScrollView>
  </ScreenContainer>
);
