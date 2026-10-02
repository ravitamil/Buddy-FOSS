import {Badge, Button, HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {BottomSheet, BottomSheetOption} from '@ravitamil/buddy-ui/overlays';
import {FormField} from '@ravitamil/buddy-ui/FormField';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import React, {useState} from 'react';
import {View, XStack, YStack} from 'tamagui';

import type {Category, CategoryBudgetAllocation} from '@/types';
import {useCategoryBudgetSetup} from '../hooks/useCategoryBudgetSetup';

interface CategoryBudgetSetupProps {
  totalBudget: number;
  categories: Category[];
  allocations: CategoryBudgetAllocation[];
  onAllocationsChange: (allocations: CategoryBudgetAllocation[]) => void;
  currencySymbol?: string;
}

export function CategoryBudgetSetup({
  totalBudget,
  categories,
  allocations,
  onAllocationsChange,
  currencySymbol = '',
}: CategoryBudgetSetupProps) {
  const model = useCategoryBudgetSetup({
    allocations,
    categories,
    currencySymbol,
    onAllocationsChange,
    totalBudget,
  });

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<Category | null>(null);
  const [allocationInput, setAllocationInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const isOverallocated = model.remainingBudget < 0;
  const progressPercent = Math.min(100, Math.max(0, model.allocationPercentage));

  const filteredUnallocated = model.unallocatedCategories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  const handleOpenSheet = () => {
    setPendingCategory(null);
    setAllocationInput('');
    setSearchQuery('');
    setIsSheetOpen(true);
  };

  const handleSelectCategory = (category: Category) => {
    setPendingCategory(category);
    // Suggest remaining available budget if positive, or default empty
    const suggested = model.remainingBudget > 0 ? String(Math.round(model.remainingBudget)) : '';
    setAllocationInput(suggested);
  };

  const handleSaveCategoryAllocation = () => {
    if (!pendingCategory) return;
    const amount = Number.parseFloat(allocationInput) || 0;
    model.handleSetAllocation(pendingCategory.id, amount);
    setIsSheetOpen(false);
    setPendingCategory(null);
    setAllocationInput('');
  };

  return (
    <VStack gap="$4">
      {/* Allocation Progress Bar */}
      <VStack gap="$2" paddingBottom="$1">
        <HStack justifyContent="space-between" alignItems="center">
          <Text variant="caption" color="$textSecondary" weight="medium">
            Category Allocations
          </Text>
          <Text variant="body2" color="$text" weight="bold">
            {model.formatCurrency(model.totalAllocated)} of {model.formatCurrency(totalBudget)}
          </Text>
        </HStack>

        <YStack
          height={6}
          width="100%"
          borderRadius="$10"
          backgroundColor="$borderColor"
          overflow="hidden">
          <YStack
            height="100%"
            width={`${progressPercent}%`}
            borderRadius="$10"
            backgroundColor={isOverallocated ? '$danger' : '$primary'}
          />
        </YStack>

        <HStack justifyContent="space-between" alignItems="center">
          <Text
            variant="caption"
            color={isOverallocated ? '$danger' : '$textSecondary'}
            weight="medium">
            {isOverallocated
              ? `${model.formatCurrency(Math.abs(model.remainingBudget))} over flexible limit`
              : model.remainingBudget === 0
                ? 'All flexible spending allocated'
                : `${model.formatCurrency(model.remainingBudget)} unallocated`}
          </Text>
          <Badge
            label={`${Math.round(model.allocationPercentage)}% Allocated`}
            tone={isOverallocated ? 'error' : 'neutral'}
          />
        </HStack>
      </VStack>

      {/* Allocated Categories List */}
      {allocations.length > 0 ? (
        <VStack gap="$2.5">
          {allocations.map((allocation) => {
            const matchedCategory = categories.find((c) => c.id === allocation.categoryId);
            const categoryColor = matchedCategory?.color || allocation.color || '#F59E0B';
            const categoryIcon = matchedCategory?.icon || allocation.icon || 'pricetag';
            const percentOfTotal =
              totalBudget > 0 ? Math.round((allocation.amount / totalBudget) * 100) : 0;

            return (
              <HStack
                key={allocation.categoryId}
                alignItems="center"
                justifyContent="space-between"
                paddingVertical="$2"
                paddingHorizontal="$3"
                borderRadius="$4"
                backgroundColor="$backgroundHover"
                gap="$2.5">
                <View
                  width={36}
                  height={36}
                  borderRadius={10}
                  backgroundColor={`${categoryColor}20`}
                  alignItems="center"
                  justifyContent="center">
                  <Ionicons
                    name={
                      categoryIcon in Ionicons.glyphMap
                        ? (categoryIcon as keyof typeof Ionicons.glyphMap)
                        : 'pricetag'
                    }
                    size={18}
                    color={categoryColor}
                  />
                </View>

                <VStack flex={1} gap="$0.5">
                  <Text variant="body2" color="$text" weight="semibold" numberOfLines={1}>
                    {allocation.categoryName}
                  </Text>
                  <Text variant="caption" color="$textSecondary">
                    {percentOfTotal}% of flexible budget
                  </Text>
                </VStack>

                <VStack width={96}>
                  <FormField
                    value={String(allocation.amount)}
                    keyboardType="decimal-pad"
                    textAlign="right"
                    accessibilityLabel={`Budget for ${allocation.categoryName}`}
                    leftIcon={
                      <Text color="$textSecondary" fontSize="$2">
                        {currencySymbol}
                      </Text>
                    }
                    onChangeText={(value) =>
                      model.handleSetAllocation(
                        allocation.categoryId,
                        Number.parseFloat(value) || 0,
                      )
                    }
                  />
                </VStack>

                <Button
                  variant="ghost"
                  size="small"
                  circular
                  onPress={() => model.handleRemoveAllocation(allocation.categoryId)}
                  accessibilityLabel={`Remove ${allocation.categoryName} budget`}
                  leftIcon={<Ionicons name="trash-outline" size={16} color="$textSecondary" />}
                />
              </HStack>
            );
          })}
        </VStack>
      ) : (
        /* Zero State */
        <VStack
          alignItems="center"
          justifyContent="center"
          paddingVertical="$4"
          paddingHorizontal="$3"
          borderRadius="$4"
          backgroundColor="$backgroundHover"
          gap="$2">
          <Ionicons name="pie-chart-outline" size={32} color="$textSecondary" />
          <Text variant="body2" color="$text" weight="semibold" textAlign="center">
            No category budgets allocated yet
          </Text>
          <Text variant="caption" color="$textSecondary" textAlign="center">
            Assign planned limits to specific expense categories like Groceries, Dining, and
            Transport.
          </Text>
        </VStack>
      )}

      {/* Add Category Button */}
      {model.unallocatedCategories.length > 0 && (
        <Button
          variant="outline"
          size="medium"
          onPress={handleOpenSheet}
          accessibilityLabel="Add category budget"
          leftIcon={<Ionicons name="add" size={18} color="$primary" />}>
          Add Category Budget
        </Button>
      )}

      {/* Bottom Sheet for Category Selection and Allocation */}
      <BottomSheet
        open={isSheetOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsSheetOpen(false);
            setPendingCategory(null);
            setAllocationInput('');
          }
        }}
        snapPoints={[75]}
        scrollable
        zIndex={100000}
        title={pendingCategory ? `Allocate: ${pendingCategory.name}` : 'Select Category'}
        description={
          pendingCategory
            ? 'Set a monthly spending limit for this category'
            : 'Choose an expense category to add to your plan'
        }>
        {pendingCategory ? (
          /* Step 2 in sheet: Enter amount */
          <VStack gap="$4" paddingTop="$2">
            <HStack alignItems="center" gap="$3" paddingHorizontal="$2">
              <View
                width={44}
                height={44}
                borderRadius={12}
                backgroundColor={`${pendingCategory.color || '#F59E0B'}20`}
                alignItems="center"
                justifyContent="center">
                <Ionicons
                  name={
                    pendingCategory.icon && pendingCategory.icon in Ionicons.glyphMap
                      ? (pendingCategory.icon as keyof typeof Ionicons.glyphMap)
                      : 'pricetag'
                  }
                  size={22}
                  color={pendingCategory.color || '#F59E0B'}
                />
              </View>
              <VStack flex={1}>
                <Text variant="h5" color="$text" weight="bold">
                  {pendingCategory.name}
                </Text>
                <Text variant="caption" color="$textSecondary">
                  Available in flexible budget:{' '}
                  {model.formatCurrency(Math.max(0, model.remainingBudget))}
                </Text>
              </VStack>
            </HStack>

            <FormField
              accessibilityLabel={`Budget amount for ${pendingCategory.name}`}
              label="Planned Monthly Budget"
              placeholder="0.00"
              value={allocationInput}
              onChangeText={setAllocationInput}
              keyboardType="decimal-pad"
              leftIcon={
                <Text color="$textSecondary" weight="bold" fontSize="$4">
                  {currencySymbol}
                </Text>
              }
            />

            {/* Quick helper percentage buttons */}
            <VStack gap="$1.5">
              <Text variant="caption" color="$textSecondary">
                Quick Shortcuts
              </Text>
              <XStack gap="$2" flexWrap="wrap">
                {[
                  {label: '10%', amount: Math.round(totalBudget * 0.1)},
                  {label: '25%', amount: Math.round(totalBudget * 0.25)},
                  {label: '50%', amount: Math.round(totalBudget * 0.5)},
                  ...(model.remainingBudget > 0
                    ? [{label: 'All Remaining', amount: Math.round(model.remainingBudget)}]
                    : []),
                ].map((preset) => (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    size="small"
                    onPress={() => setAllocationInput(String(preset.amount))}>
                    {preset.label} ({model.formatCurrency(preset.amount)})
                  </Button>
                ))}
              </XStack>
            </VStack>

            <XStack gap="$2.5" paddingTop="$2">
              <Button
                variant="outline"
                size="large"
                flex={0.4}
                onPress={() => setPendingCategory(null)}>
                Back
              </Button>
              <Button
                variant="primary"
                size="large"
                flex={0.6}
                onPress={handleSaveCategoryAllocation}
                disabled={!allocationInput || Number.parseFloat(allocationInput) <= 0}
                accessibilityLabel="Save category budget">
                Save Allocation
              </Button>
            </XStack>
          </VStack>
        ) : (
          /* Step 1 in sheet: Search and select category */
          <VStack gap="$3">
            <FormField
              accessibilityLabel="Search categories"
              placeholder="Search expense categories..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftIcon={<Ionicons name="search" size={18} color="$textSecondary" />}
            />

            <YStack gap="$1">
              {filteredUnallocated.length > 0 ? (
                filteredUnallocated.map((category) => {
                  const categoryColor = category.color?.trim() || '#10B981';

                  return (
                    <BottomSheetOption
                      key={`cat-opt-${category.id}`}
                      label={category.name}
                      description="Tap to allocate"
                      leading={
                        <View
                          width={40}
                          height={40}
                          borderRadius={10}
                          backgroundColor={`${categoryColor}20`}
                          alignItems="center"
                          justifyContent="center">
                          <Ionicons
                            name={
                              category.icon && category.icon in Ionicons.glyphMap
                                ? (category.icon as keyof typeof Ionicons.glyphMap)
                                : 'pricetag'
                            }
                            size={18}
                            color={categoryColor}
                          />
                        </View>
                      }
                      onPress={() => handleSelectCategory(category)}
                    />
                  );
                })
              ) : (
                <VStack padding="$4" alignItems="center">
                  <Text variant="body2" color="$textSecondary" textAlign="center">
                    {searchQuery.trim()
                      ? 'No matching expense categories found.'
                      : 'All available expense categories have already been allocated.'}
                  </Text>
                </VStack>
              )}
            </YStack>
          </VStack>
        )}
      </BottomSheet>
    </VStack>
  );
}
