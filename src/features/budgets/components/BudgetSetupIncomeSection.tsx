import {Button, createAlphaColor, HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {BottomSheet, BottomSheetOption} from '@ravitamil/buddy-ui/overlays';
import {FormField} from '@ravitamil/buddy-ui/FormField';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import React, {useState} from 'react';
import {View, XStack, YStack} from 'tamagui';

import type {IncomeSource} from '@/types';
import type {UseBudgetSetupScreenResult} from '../hooks/useBudgetSetupScreen';
import {INCOME_CATEGORIES, type IncomeTypeConfig} from '../model/incomeSourcePresets';
import {AddEditBudgetCard} from './AddEditBudgetCard';
import {BudgetToggle} from './BudgetSetupControls';

export function BudgetSetupIncomeSection({screen}: {screen: UseBudgetSetupScreenResult}) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<IncomeSource['type']>('salary');
  const [streamName, setStreamName] = useState('');
  const [streamAmount, setStreamAmount] = useState('');

  const isDarkMode = screen.isDarkMode;
  const totalItemizedIncome = screen.incomeSources.reduce((sum, s) => sum + s.amount, 0);

  const handleOpenAddSheet = () => {
    setEditingSourceId(null);
    setSelectedType('salary');
    setStreamName('');
    setStreamAmount('');
    setIsSheetOpen(true);
  };

  const handleEditStream = (source: IncomeSource) => {
    setEditingSourceId(source.id);
    setSelectedType(source.type);
    setStreamName(source.name);
    setStreamAmount(String(source.amount));
    setIsSheetOpen(true);
  };

  const handleSelectType = (config: IncomeTypeConfig) => {
    setSelectedType(config.type);
    if (!streamName.trim()) {
      setStreamName(config.label.split(' / ')[0]);
    }
  };

  const isFormValid = Boolean(
    streamName.trim() &&
    streamAmount.trim() &&
    !Number.isNaN(Number.parseFloat(streamAmount)) &&
    Number.parseFloat(streamAmount) > 0,
  );

  const handleSaveStream = () => {
    const trimmedName = streamName.trim();
    const trimmedAmount = streamAmount.trim();
    const parsedAmount = Number.parseFloat(trimmedAmount);

    if (!trimmedName || !trimmedAmount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    if (editingSourceId) {
      screen.updateIncomeSource(editingSourceId, {
        name: trimmedName,
        amount: parsedAmount,
        type: selectedType,
      });
    } else {
      screen.addIncomeSource({
        name: trimmedName,
        amount: trimmedAmount,
        type: selectedType,
      });
    }

    setIsSheetOpen(false);
    setEditingSourceId(null);
    setStreamName('');
    setStreamAmount('');
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setEditingSourceId(null);
    setStreamName('');
    setStreamAmount('');
    screen.cancelIncomeSourceDraft();
  };

  const getTypeConfig = (type: IncomeSource['type']) => {
    return INCOME_CATEGORIES.find((c) => c.type === type) ?? INCOME_CATEGORIES[5];
  };

  return (
    <AddEditBudgetCard
      title="Income Breakdown"
      subtitle="Optional detail to itemize multiple income streams."
      icon="cash-outline"
      accentColor="#06B6D4"
      rightElement={
        <BudgetToggle
          enabled={screen.trackIncomeSources}
          onChange={screen.setTrackIncomeSources}
          accessibilityLabel="Income breakdown"
        />
      }>
      <VStack gap="$3">
        {screen.trackIncomeSources ? (
          <VStack gap="$3">
            {/* Header total if streams exist */}
            {screen.incomeSources.length > 0 && (
              <HStack justifyContent="space-between" alignItems="center" paddingBottom="$1">
                <Text variant="caption" color="$textSecondary" weight="medium">
                  Total Planned Income
                </Text>
                <Text variant="body2" color="$text" weight="bold">
                  {screen.formatCurrency(totalItemizedIncome)}
                </Text>
              </HStack>
            )}

            {/* Income Streams List */}
            {screen.incomeSources.length > 0 ? (
              <VStack gap="$2.5">
                {screen.incomeSources.map((source) => {
                  const config = getTypeConfig(source.type);

                  return (
                    <XStack
                      key={source.id}
                      alignItems="center"
                      justifyContent="space-between"
                      paddingVertical="$3"
                      paddingHorizontal="$3.5"
                      borderRadius="$4"
                      borderWidth={1}
                      borderColor={isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '$borderColor'}
                      backgroundColor={isDarkMode ? 'rgba(255, 255, 255, 0.03)' : '$surface'}
                      pressStyle={{
                        backgroundColor: isDarkMode
                          ? 'rgba(255, 255, 255, 0.07)'
                          : '$backgroundHover',
                      }}
                      onPress={() => handleEditStream(source)}
                      gap="$3">
                      <View
                        width={40}
                        height={40}
                        borderRadius={12}
                        backgroundColor={createAlphaColor(config.color, isDarkMode ? 0.2 : 0.12)}
                        borderWidth={1}
                        borderColor={createAlphaColor(config.color, isDarkMode ? 0.35 : 0.2)}
                        alignItems="center"
                        justifyContent="center">
                        <Ionicons name={config.icon} size={20} color={config.color} />
                      </View>

                      <VStack flex={1} gap="$0.5" justifyContent="center">
                        <Text variant="body2" color="$text" weight="bold" numberOfLines={1}>
                          {source.name}
                        </Text>
                        <Text variant="caption" color="$textSecondary" numberOfLines={1}>
                          {config.label.split(' / ')[0]} ·{' '}
                          {source.frequency.charAt(0).toUpperCase() + source.frequency.slice(1)}
                        </Text>
                      </VStack>

                      <HStack alignItems="center" gap="$2">
                        <Text
                          variant="body1"
                          color={isDarkMode ? '#34D399' : '#059669'}
                          weight="bold">
                          +{screen.formatCurrency(source.amount)}
                        </Text>

                        <Button
                          variant="ghost"
                          size="small"
                          circular
                          onPress={(e) => {
                            e?.stopPropagation?.();
                            screen.removeIncomeSource(source.id);
                          }}
                          accessibilityLabel={`Remove ${source.name} income source`}
                          leftIcon={
                            <Ionicons
                              name="trash-outline"
                              size={18}
                              color={isDarkMode ? 'rgba(255, 255, 255, 0.45)' : '$textSecondary'}
                            />
                          }
                        />
                      </HStack>
                    </XStack>
                  );
                })}
              </VStack>
            ) : (
              /* Enhanced Empty State for Dark & Light Themes */
              <VStack
                alignItems="center"
                justifyContent="center"
                paddingVertical="$5"
                paddingHorizontal="$4"
                borderRadius="$4"
                borderWidth={1}
                borderStyle="dashed"
                borderColor={isDarkMode ? 'rgba(255, 255, 255, 0.14)' : '$borderColor'}
                backgroundColor={isDarkMode ? 'rgba(255, 255, 255, 0.025)' : 'rgba(0, 0, 0, 0.02)'}
                gap="$2.5">
                <View
                  width={48}
                  height={48}
                  borderRadius={24}
                  backgroundColor={
                    isDarkMode ? 'rgba(6, 182, 212, 0.16)' : 'rgba(6, 182, 212, 0.1)'
                  }
                  borderWidth={1}
                  borderColor={isDarkMode ? 'rgba(6, 182, 212, 0.35)' : 'rgba(6, 182, 212, 0.2)'}
                  alignItems="center"
                  justifyContent="center">
                  <Ionicons name="wallet-outline" size={24} color="#06B6D4" />
                </View>
                <VStack gap="$1" alignItems="center">
                  <Text variant="body1" color="$text" weight="semibold" textAlign="center">
                    No income streams added
                  </Text>
                  <Text variant="caption" color="$textSecondary" textAlign="center" maxWidth={280}>
                    Itemize multiple income sources like salary, freelance, or investments to
                    auto-calculate your total income.
                  </Text>
                </VStack>
              </VStack>
            )}

            {/* Add Income Stream Button */}
            <Button
              variant="outline"
              size="medium"
              onPress={handleOpenAddSheet}
              accessibilityLabel="Add income stream"
              borderColor={isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '$borderColor'}
              backgroundColor={isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'transparent'}
              leftIcon={
                <Ionicons name="add" size={18} color={isDarkMode ? '#F59E0B' : '#D97706'} />
              }>
              Add Income Stream
            </Button>
          </VStack>
        ) : (
          <Text variant="body2" color="$textSecondary">
            Enable to itemize your income by stream (e.g. salary, freelance, rental) and
            auto-calculate your total income.
          </Text>
        )}
      </VStack>

      {/* Bottom Sheet for Adding & Editing Income Stream */}
      <BottomSheet
        open={isSheetOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseSheet();
          }
        }}
        snapPoints={[85]}
        scrollable
        zIndex={100000}
        title={editingSourceId ? 'Edit Income Stream' : 'Add Income Stream'}
        description={
          editingSourceId
            ? 'Update stream name, monthly planned amount, or category'
            : 'Enter stream name, monthly planned amount, and category'
        }>
        <VStack gap="$4" paddingTop="$2">
          {/* 1. Stream Name */}
          <FormField
            accessibilityLabel="Income stream name"
            label="Stream Name"
            placeholder="e.g. Primary Job, Consulting, Side Gig"
            value={streamName}
            onChangeText={setStreamName}
            autoCapitalize="words"
          />

          {/* 2. Monthly Planned Amount */}
          <FormField
            accessibilityLabel="Monthly planned amount"
            label="Monthly Planned Amount"
            placeholder="0.00"
            value={streamAmount}
            onChangeText={setStreamAmount}
            keyboardType="decimal-pad"
            leftIcon={
              <Text color="$textSecondary" weight="bold" fontSize="$4">
                {screen.currencySymbol}
              </Text>
            }
          />

          {/* 3. Categories with rich glowing icons */}
          <VStack gap="$2">
            <Text variant="caption" color="$textSecondary" weight="medium">
              Category
            </Text>
            <YStack gap="$1.5">
              {INCOME_CATEGORIES.map((config) => {
                const isSelected = selectedType === config.type;

                return (
                  <BottomSheetOption
                    key={config.type}
                    label={config.label}
                    description={config.description}
                    selected={isSelected}
                    leading={
                      <View
                        width={40}
                        height={40}
                        borderRadius={12}
                        backgroundColor={createAlphaColor(config.color, isDarkMode ? 0.22 : 0.12)}
                        borderWidth={1}
                        borderColor={createAlphaColor(config.color, isDarkMode ? 0.4 : 0.25)}
                        alignItems="center"
                        justifyContent="center">
                        <Ionicons name={config.icon} size={20} color={config.color} />
                      </View>
                    }
                    onPress={() => handleSelectType(config)}
                  />
                );
              })}
            </YStack>
          </VStack>

          {/* Action Buttons */}
          <XStack gap="$2.5" paddingTop="$2">
            {editingSourceId ? (
              <>
                <Button
                  variant="outline"
                  size="large"
                  flex={0.3}
                  onPress={() => {
                    screen.removeIncomeSource(editingSourceId);
                    handleCloseSheet();
                  }}
                  borderColor={isDarkMode ? 'rgba(239, 68, 68, 0.4)' : '#FCA5A5'}
                  color="#EF4444">
                  Delete
                </Button>
                <Button variant="outline" size="large" flex={0.3} onPress={handleCloseSheet}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="large"
                  flex={0.4}
                  onPress={handleSaveStream}
                  disabled={!isFormValid}
                  accessibilityLabel="Save income stream changes">
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="large" flex={0.4} onPress={handleCloseSheet}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="large"
                  flex={0.6}
                  onPress={handleSaveStream}
                  disabled={!isFormValid}
                  accessibilityLabel="Add income stream">
                  Add Stream
                </Button>
              </>
            )}
          </XStack>
        </VStack>
      </BottomSheet>
    </AddEditBudgetCard>
  );
}
