import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import {type GlassSurfaceProps} from '@ravitamil/buddy-ui';
import React, {useCallback} from 'react';
import {FlashList} from '@shopify/flash-list';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {LinearGradient} from 'expo-linear-gradient';
import {GlassBackdrop} from '@ravitamil/buddy-ui/mobile';
import {View, useTheme} from 'tamagui';

import {resolveThemeColor} from '@ravitamil/buddy-ui';

import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import type {Category} from '@/types';

interface GlassmorphismCardProps {
  children: React.ReactNode;
  style?: GlassSurfaceProps['style'];
}

interface CategoryCardProps {
  category: Category;
  isMandatory: boolean;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

function CategorySurface({children, style}: GlassmorphismCardProps) {
  return (
    <GlassSurface padding={16} style={[{marginBottom: 12}, style]}>
      {children}
    </GlassSurface>
  );
}

function CategoryActionButton({
  icon,
  colors,
  onPress,
}: {
  icon: 'create' | 'trash';
  colors: [string, string];
  onPress: () => void;
}) {
  const {isDarkMode} = useTamaguiTheme();
  const theme = useTheme();

  return (
    <View
      accessibilityRole="button"
      accessibilityLabel={icon === 'create' ? 'Edit category' : 'Delete category'}
      onPress={onPress}
      pressStyle={{opacity: 0.7}}>
      <GlassBackdrop
        intensity={40}
        tint={isDarkMode ? 'dark' : 'light'}
        style={{borderRadius: 8, overflow: 'hidden'}}>
        <LinearGradient
          colors={colors}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: resolveThemeColor(theme, 'glassBorder', 'rgba(255, 255, 255, 0.22)'),
          }}>
          <Ionicons name={icon} size={16} color="white" />
        </LinearGradient>
      </GlassBackdrop>
    </View>
  );
}

function CategoryCard({category, isMandatory, onEdit, onDelete}: CategoryCardProps) {
  const {isDarkMode} = useTamaguiTheme();
  const theme = useTheme();
  const handleEdit = useCallback(() => onEdit(category), [category, onEdit]);
  const handleDelete = useCallback(() => onDelete(category.id), [category.id, onDelete]);
  const safeColor = category.color && category.color.startsWith('#') ? category.color : '#4CAF50';

  return (
    <CategorySurface>
      <HStack alignItems="center" gap="$4">
        <GlassBackdrop
          intensity={60}
          tint={isDarkMode ? 'dark' : 'light'}
          style={{borderRadius: 12, overflow: 'hidden'}}>
          <LinearGradient
            colors={[safeColor, safeColor]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: resolveThemeColor(theme, 'glassBorder', 'rgba(255, 255, 255, 0.22)'),
            }}>
            {category.icon ? (
              <Text fontSize={24}>{category.icon}</Text>
            ) : (
              <Ionicons name="pricetag" size={24} color="white" />
            )}
          </LinearGradient>
        </GlassBackdrop>
        <VStack flex={1}>
          <HStack alignItems="center" gap="$2">
            <Text
              variant="body1"
              color={isDarkMode ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)'}
              weight="semibold">
              {category.name}
            </Text>
            {isMandatory ? (
              <VStack
                width={20}
                height={20}
                borderRadius={10}
                backgroundColor="rgba(245, 158, 11, 0.2)"
                borderWidth={1.5}
                borderColor="rgba(245, 158, 11, 0.6)"
                justifyContent="center"
                alignItems="center">
                <Ionicons name="lock-closed" size={10} color="rgba(245, 158, 11, 0.9)" />
              </VStack>
            ) : null}
          </HStack>
          <Text
            variant="body2"
            color={isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'}
            textTransform="capitalize">
            {category.type}
            {isMandatory ? ' â€¢ Protected' : ''}
          </Text>
        </VStack>
        {!isMandatory ? (
          <HStack gap="$2">
            <CategoryActionButton
              icon="create"
              colors={['rgba(59, 130, 246, 0.9)', 'rgba(37, 99, 235, 0.9)']}
              onPress={handleEdit}
            />
            <CategoryActionButton
              icon="trash"
              colors={['rgba(239, 68, 68, 0.9)', 'rgba(220, 38, 38, 0.9)']}
              onPress={handleDelete}
            />
          </HStack>
        ) : null}
      </HStack>
    </CategorySurface>
  );
}

function SectionHeader({
  title,
  count,
  accentColor,
  isDarkMode,
}: {
  title: string;
  count: number;
  accentColor: string;
  isDarkMode: boolean;
}) {
  return (
    <HStack alignItems="center" justifyContent="space-between">
      <Text
        variant="h4"
        color={isDarkMode ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)'}
        weight="bold">
        {title}
      </Text>
      <VStack
        backgroundColor={`${accentColor}1A`}
        paddingHorizontal="$3"
        paddingVertical="$1"
        borderRadius="$4"
        borderWidth={1}
        borderColor={`${accentColor}33`}>
        <Text variant="caption" color={`${accentColor}CC`} weight="medium">
          {count} categories
        </Text>
      </VStack>
    </HStack>
  );
}

export function CategorySection({
  title,
  categories,
  accentColor,
  isDarkMode,
  onEdit,
  onDelete,
  isMandatoryCategory,
}: {
  title: string;
  categories: Category[];
  accentColor: string;
  isDarkMode: boolean;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  isMandatoryCategory: (category: Category) => boolean;
}) {
  const renderCategory = useCallback(
    ({item}: {item: Category}) => (
      <CategoryCard
        category={item}
        isMandatory={isMandatoryCategory(item)}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
    [isMandatoryCategory, onDelete, onEdit],
  );

  return (
    <VStack gap="$3" marginTop={title.startsWith('Income') ? '$6' : '$2'}>
      <SectionHeader
        title={title}
        count={categories.length}
        accentColor={accentColor}
        isDarkMode={isDarkMode}
      />
      <View height={Math.max(categories.length * 85, 100)}>
        <FlashList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </VStack>
  );
}
