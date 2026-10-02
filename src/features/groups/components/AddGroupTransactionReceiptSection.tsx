import {Badge, GlassSurface, HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {Image} from 'expo-image';
import React from 'react';
import {View} from 'tamagui';

import type {UseAddGroupTransactionScreenResult} from '../hooks/useAddGroupTransactionScreen';

interface ReceiptSectionProps {
  screen: UseAddGroupTransactionScreenResult;
}

const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return 'File attached';
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const isImageFile = (mimeType?: string, uri?: string | null, name?: string): boolean => {
  if (mimeType && mimeType.startsWith('image/')) return true;
  if (name && /\.(jpe?g|png|webp|heic|gif)$/i.test(name)) return true;
  if (uri && /\.(jpe?g|png|webp|heic|gif)/i.test(uri)) return true;
  return false;
};

export const AddGroupTransactionReceiptSection: React.FC<ReceiptSectionProps> = ({screen}) => {
  const {
    isPro,
    isDarkMode,
    receiptUri,
    receiptName,
    receiptMimeType,
    receiptFileSize,
    handlePickReceipt,
    handleRemoveReceipt,
    handleUpgradePro,
  } = screen;

  const hasAttachedReceipt = Boolean(receiptUri);
  const isImage = isImageFile(receiptMimeType, receiptUri, receiptName);

  if (hasAttachedReceipt) {
    return (
      <GlassSurface padding={14}>
        <HStack alignItems="center" justifyContent="space-between" gap="$3">
          <HStack alignItems="center" gap="$3" flex={1}>
            <View
              width={50}
              height={50}
              borderRadius={12}
              overflow="hidden"
              borderWidth={1}
              borderColor={isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}
              alignItems="center"
              justifyContent="center"
              backgroundColor={isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}>
              {isImage ? (
                <Image
                  source={{uri: receiptUri ?? undefined}}
                  style={{width: '100%', height: '100%'}}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <Ionicons
                  name="document-text-outline"
                  size={26}
                  color={isDarkMode ? '#60A5FA' : '#2563EB'}
                />
              )}
            </View>

            <VStack flex={1} gap="$0.5">
              <Text weight="bold" color="$text" fontSize={14} numberOfLines={1}>
                {receiptName || (isImage ? 'Photo attached' : 'Document attached')}
              </Text>
              <Text color="$textSecondary" fontSize={12}>
                {formatFileSize(receiptFileSize)}
              </Text>
              <HStack
                accessibilityRole="button"
                accessibilityLabel="Change attachment"
                onPress={handlePickReceipt}
                pressStyle={{opacity: 0.7}}>
                <Text fontSize={12} color="$iconBrand" weight="semibold">
                  Change file
                </Text>
              </HStack>
            </VStack>
          </HStack>

          <View
            accessibilityRole="button"
            accessibilityLabel="Remove attachment"
            onPress={handleRemoveReceipt}
            pressStyle={{opacity: 0.75, scale: 0.94}}
            width={38}
            height={38}
            borderRadius={19}
            backgroundColor={isDarkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)'}
            borderWidth={1}
            borderColor={isDarkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'}
            alignItems="center"
            justifyContent="center">
            <Ionicons name="trash-outline" size={18} color={isDarkMode ? '#F87171' : '#EF4444'} />
          </View>
        </HStack>
      </GlassSurface>
    );
  }

  return (
    <GlassSurface padding={14}>
      <HStack
        accessibilityRole="button"
        accessibilityLabel="Attach receipt or document"
        onPress={handlePickReceipt}
        pressStyle={{opacity: 0.85, scale: 0.99}}
        alignItems="center"
        justifyContent="space-between"
        gap="$3">
        <HStack alignItems="center" gap="$3" flex={1}>
          <View
            width={40}
            height={40}
            borderRadius={20}
            backgroundColor={isDarkMode ? 'rgba(78, 205, 196, 0.15)' : 'rgba(78, 205, 196, 0.1)'}
            alignItems="center"
            justifyContent="center">
            <Ionicons name="receipt-outline" size={20} color={isDarkMode ? '#4ECDC4' : '#2D8982'} />
          </View>
          <VStack flex={1} gap="$0.5">
            <HStack alignItems="center" gap="$2">
              <Text weight="bold" color="$text" fontSize={14}>
                Receipt & Documents
              </Text>
              {!isPro ? <Badge label="PRO" tone="warning" onPress={handleUpgradePro} /> : null}
            </HStack>
            <Text color="$textSecondary" fontSize={12} numberOfLines={1}>
              {!isPro
                ? 'Supports .jpg, .png, .pdf, .doc (Pro feature)'
                : 'Supports .jpg, .png, .pdf, .doc • Max 1 MB'}
            </Text>
          </VStack>
        </HStack>

        <View
          width={36}
          height={36}
          borderRadius={18}
          backgroundColor={isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'}
          borderWidth={1}
          borderColor={isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}
          alignItems="center"
          justifyContent="center">
          <Ionicons name="attach-outline" size={20} color={isDarkMode ? '#4ECDC4' : '#2D8982'} />
        </View>
      </HStack>
    </GlassSurface>
  );
};
