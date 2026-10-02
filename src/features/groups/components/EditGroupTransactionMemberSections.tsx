import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {Image} from 'expo-image';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import {colorToken} from '@/utils/themeColors';
import type {UseEditGroupTransactionScreenResult} from '../hooks/useEditGroupTransactionScreen';
import {GroupTransactionMemberSectionsLayout} from './GroupTransactionMemberSectionsLayout';

interface MemberSectionsProps {
  screen: UseEditGroupTransactionScreenResult;
}

export const EditGroupTransactionMemberSections = ({screen}: MemberSectionsProps) => {
  if (!screen.group) {
    return null;
  }

  return (
    <GroupTransactionMemberSectionsLayout
      screen={screen}
      paidByVariant="initials"
      splitSectionFooter={<ReceiptSection screen={screen} />}
    />
  );
};

const ReceiptSection = ({screen}: MemberSectionsProps) => (
  <VStack marginTop={16} gap="$2">
    <Text variant="caption" color="$textSecondary" weight="semibold" marginLeft={4}>
      RECEIPT
    </Text>
    <HStack
      accessibilityRole="button"
      accessibilityLabel={screen.receiptUri ? 'Change receipt photo' : 'Attach receipt photo'}
      onPress={screen.handlePickReceipt}
      pressStyle={{opacity: 0.8}}
      alignItems="center"
      padding="$3"
      borderRadius="$3"
      backgroundColor={screen.isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'}
      borderWidth={1}
      borderColor={screen.isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
      borderStyle="dashed"
      justifyContent={screen.receiptUri ? 'space-between' : 'center'}>
      {screen.receiptUri ? (
        <HStack alignItems="center" gap="$3">
          <Image
            source={{uri: screen.receiptUri}}
            style={{width: 40, height: 40, borderRadius: 8}}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
          <VStack flex={1}>
            <Text color="$text" weight="medium">
              Receipt attached
            </Text>
            <Text color="$textSecondary" fontSize={12}>
              Tap to change
            </Text>
          </VStack>
          <HStack
            accessibilityRole="button"
            accessibilityLabel="Remove receipt photo"
            onPress={(event) => {
              event.stopPropagation();
              screen.setReceiptUri(null);
            }}
            pressStyle={{opacity: 0.7}}
            padding="$2">
            <Ionicons name="close-circle" size={20} color={colorToken('danger')} />
          </HStack>
        </HStack>
      ) : (
        <HStack alignItems="center" gap="$2">
          <Ionicons name="camera-outline" size={20} color={colorToken('textSecondary')} />
          <Text color="$textSecondary" weight="medium">
            Attach Photo
          </Text>
        </HStack>
      )}
    </HStack>
  </VStack>
);
