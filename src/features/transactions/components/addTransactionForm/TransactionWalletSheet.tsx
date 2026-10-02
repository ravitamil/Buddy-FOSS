import {BottomSheet, BottomSheetOption} from '@ravitamil/buddy-ui/overlays';
import {useBuddyColors} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import React from 'react';
import {View, YStack} from 'tamagui';

import type {Wallet} from '@/features/wallets';

interface TransactionWalletSheetProps {
  formatCurrency: (amount: number) => string;
  isOpen: boolean;
  selectedWalletId: string | null;
  wallets: Wallet[];
  onClose: () => void;
  onSelectWallet: (walletId: string | null) => void;
}

export function TransactionWalletSheet({
  formatCurrency,
  isOpen,
  selectedWalletId,
  wallets,
  onClose,
  onSelectWallet,
}: TransactionWalletSheetProps) {
  const colors = useBuddyColors();

  return (
    <BottomSheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      snapPoints={[55]}
      scrollable
      zIndex={100000}
      title="Select Account"
      description="Choose the account whose balance reflects this transaction">
      <YStack gap="$1">
        {/* Unlinked Option */}
        <BottomSheetOption
          label="Unlinked"
          description="Saves transaction without altering an account balance"
          selected={selectedWalletId === null}
          leading={
            <View
              width={44}
              height={44}
              borderRadius={12}
              backgroundColor="$surfacePress"
              borderWidth={1}
              borderColor="$borderColor"
              alignItems="center"
              justifyContent="center">
              <Ionicons name="unlink-outline" size={20} color={colors.textSecondary} />
            </View>
          }
          onPress={() => {
            onSelectWallet(null);
            onClose();
          }}
        />

        {/* Registered Wallets */}
        {wallets.map((wallet) => {
          const isSelected = selectedWalletId === wallet.id;
          return (
            <BottomSheetOption
              key={`wallet-opt-${wallet.id}`}
              label={wallet.name}
              description={`Current Balance: ${formatCurrency(wallet.balance ?? 0)}`}
              selected={isSelected}
              leading={
                <View
                  width={44}
                  height={44}
                  borderRadius={12}
                  backgroundColor="$surfacePress"
                  borderWidth={1}
                  borderColor="$borderColor"
                  alignItems="center"
                  justifyContent="center">
                  <Ionicons name="wallet-outline" size={20} color={colors.primary} />
                </View>
              }
              onPress={() => {
                onSelectWallet(wallet.id);
                onClose();
              }}
            />
          );
        })}
      </YStack>
    </BottomSheet>
  );
}
