import React from 'react';
import {Button, createAlphaColor, Text, useBuddyColors} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {View, XStack, YStack} from 'tamagui';

import type {Wallet} from '@/features/wallets';
import {AddTransactionCard} from './AddTransactionCard';

interface WalletSectionProps {
  formatCurrency?: (amount: number) => string;
  selectedWalletId: string | null;
  wallets: Wallet[];
  onOpenWalletSheet?: () => void;
  onSelectWallet?: (walletId: string | null) => void;
}

export function WalletSection({
  formatCurrency,
  selectedWalletId,
  wallets,
  onOpenWalletSheet,
}: WalletSectionProps) {
  const colors = useBuddyColors();

  const selectedWallet = wallets.find((w) => w.id === selectedWalletId);
  const isUnlinked = selectedWalletId === null;

  return (
    <AddTransactionCard>
      <YStack gap="$3">
        <XStack alignItems="center" justifyContent="space-between" gap="$3">
          <Text variant="h5" weight="semibold" color="$color">
            Account / Wallet
          </Text>
          {onOpenWalletSheet && wallets.length > 0 && (
            <Button
              variant="outline"
              size="small"
              onPress={onOpenWalletSheet}
              leftIcon={<Ionicons name="swap-horizontal" size={15} color={colors.primary} />}
              accessibilityLabel="Change account">
              <Text variant="body2" weight="bold" color="$primary">
                Change
              </Text>
            </Button>
          )}
        </XStack>

        {/* Prominent Active Wallet Tile */}
        <View
          accessibilityRole="button"
          accessibilityLabel={
            isUnlinked
              ? 'Unlinked transaction. Tap to change account'
              : `Linked account: ${selectedWallet?.name}. Tap to change`
          }
          onPress={onOpenWalletSheet}
          pressStyle={{opacity: 0.85, scale: 0.99}}>
          <XStack
            alignItems="center"
            gap="$3"
            padding="$3"
            borderRadius="$4"
            backgroundColor="$surface"
            borderWidth={1}
            borderColor="$borderColor">
            <View
              width={44}
              height={44}
              borderRadius={12}
              backgroundColor={
                isUnlinked ? '$surfacePress' : createAlphaColor(colors.primary, 0.15)
              }
              borderWidth={1}
              borderColor={isUnlinked ? '$borderColor' : createAlphaColor(colors.primary, 0.35)}
              alignItems="center"
              justifyContent="center">
              <Ionicons
                name={isUnlinked ? 'unlink-outline' : 'wallet-outline'}
                size={20}
                color={isUnlinked ? colors.textSecondary : colors.primary}
              />
            </View>

            <YStack flex={1} gap="$0.5">
              <Text variant="body1" weight="semibold" color="$color">
                {isUnlinked
                  ? 'Unlinked (General / Cash)'
                  : (selectedWallet?.name ?? 'Select account')}
              </Text>
              <Text variant="caption" color="$textSecondary">
                {isUnlinked
                  ? 'Does not affect any account balance'
                  : formatCurrency && selectedWallet?.balance !== undefined
                    ? `Balance: ${formatCurrency(selectedWallet.balance)}`
                    : 'Transaction balance will update this account'}
              </Text>
            </YStack>

            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </XStack>
        </View>
      </YStack>
    </AddTransactionCard>
  );
}
