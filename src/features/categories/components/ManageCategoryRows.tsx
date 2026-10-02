import React, {useCallback} from 'react';
import {YStack, styled} from 'tamagui';

import {HStack, VStack} from '@ravitamil/buddy-ui';
import {Text} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {logger as appLogger} from '@/services/LoggerService';
import type {Category, InvestmentCategory} from '@/types';
import {
  ManageCategoryGlassCard,
  ManageCategoryIcon,
  type ManageCategoryIconName,
} from './ManageCategoryPrimitives';

interface CategoryItemProps {
  category: Category;
  disabled?: boolean;
  isMandatory: boolean;
  onDelete: (id: string) => void;
  onEdit: (category: Category) => void;
}

interface InvestmentCategoryItemProps {
  category: InvestmentCategory;
  disabled?: boolean;
  isMandatory: boolean;
  onDelete: (id: string) => void;
  onEdit: (category: InvestmentCategory) => void;
}

export const CategoryItem = React.memo<CategoryItemProps>(
  ({category, disabled = false, isMandatory, onEdit, onDelete}) => {
    const handleEdit = useCallback(() => {
      appLogger.debug('Edit button pressed for category:', category.name);
      onEdit(category);
    }, [category, onEdit]);

    const handleDelete = useCallback(() => {
      appLogger.debug('Delete button pressed for category:', category.name);
      onDelete(category.id);
    }, [category.id, category.name, onDelete]);

    return (
      <CategoryRow
        name={category.name}
        subtitle={category.type}
        icon={category.icon}
        color={category.color}
        fallbackIcon="pricetag"
        disabled={disabled}
        isMandatory={isMandatory}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );
  },
);

export const InvestmentCategoryItem = React.memo<InvestmentCategoryItemProps>(
  ({category, disabled = false, isMandatory, onEdit, onDelete}) => {
    const handleEdit = useCallback(() => {
      appLogger.debug('Edit button pressed for investment category:', category.name);
      onEdit(category);
    }, [category, onEdit]);

    const handleDelete = useCallback(() => {
      appLogger.debug('Delete button pressed for investment category:', category.name);
      onDelete(category.id);
    }, [category.id, category.name, onDelete]);

    return (
      <CategoryRow
        name={category.name}
        subtitle="investment"
        icon={category.icon}
        color={category.color}
        fallbackIcon="bar-chart"
        disabled={disabled}
        isMandatory={isMandatory}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );
  },
);

interface CategoryRowProps {
  color?: string;
  disabled: boolean;
  fallbackIcon: ManageCategoryIconName;
  icon?: string;
  isMandatory: boolean;
  name: string;
  onDelete: () => void;
  onEdit: () => void;
  subtitle: string;
}

function CategoryRow({
  name,
  subtitle,
  icon,
  color,
  fallbackIcon,
  disabled,
  isMandatory,
  onEdit,
  onDelete,
}: CategoryRowProps) {
  const categoryType = `${subtitle.charAt(0).toUpperCase()}${subtitle.slice(1)} category`;

  return (
    <ManageCategoryGlassCard
      onPress={isMandatory || disabled ? undefined : onEdit}
      disabled={disabled}
      accessibilityLabel={
        isMandatory ? `${name}, ${categoryType}, built-in category` : `${name}, ${categoryType}`
      }
      style={{opacity: disabled ? 0.72 : 1}}>
      <HStack minHeight={64} alignItems="center" gap="$3">
        <ManageCategoryIcon icon={icon} color={color} fallback={fallbackIcon} />
        <VStack flex={1} minWidth={0} gap="$1">
          <Text variant="body1" color="$text" weight="bold" numberOfLines={1} lineHeight={20}>
            {name}
          </Text>
          <HStack alignItems="center" gap="$2" flexWrap="wrap">
            <Text variant="body2" color="$textSecondary" numberOfLines={1}>
              {categoryType}
              {isMandatory ? ' • Built-in' : ''}
            </Text>
          </HStack>
        </VStack>
        <CategoryActions
          name={name}
          disabled={disabled}
          isMandatory={isMandatory}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </HStack>
    </ManageCategoryGlassCard>
  );
}

function ProtectedBadge({name}: {name: string}) {
  return (
    <HStack
      accessibilityLabel={`${name} is protected`}
      width={48}
      height={48}
      alignItems="center"
      justifyContent="center"
      borderRadius={14}
      backgroundColor="$glassStrong"
      borderWidth={1}
      borderColor="$warning">
      <ThemedIonicon name="lock-closed" size={18} color="$warning" />
    </HStack>
  );
}

interface CategoryActionsProps {
  disabled: boolean;
  isMandatory: boolean;
  name: string;
  onDelete: () => void;
  onEdit: () => void;
}

function CategoryActions({name, disabled, isMandatory, onEdit, onDelete}: CategoryActionsProps) {
  if (isMandatory) {
    return <ProtectedBadge name={name} />;
  }

  return (
    <HStack gap="$2" alignItems="center">
      <CategoryActionButton
        accessibilityRole="button"
        accessibilityLabel={`Edit ${name} category`}
        accessibilityState={{disabled}}
        disabled={disabled}
        onPress={onEdit}
        minWidth={48}
        minHeight={48}
        actionTone="edit">
        <ThemedIonicon name="create-outline" size={20} color="$iconBrand" />
      </CategoryActionButton>
      <CategoryActionButton
        accessibilityRole="button"
        accessibilityLabel={`Delete ${name} category`}
        accessibilityState={{disabled}}
        disabled={disabled}
        onPress={onDelete}
        minWidth={48}
        minHeight={48}
        actionTone="delete">
        <ThemedIonicon name="trash-outline" size={20} color="$error" />
      </CategoryActionButton>
    </HStack>
  );
}

const CategoryActionButton = styled(YStack, {
  name: 'ManageCategoryActionButton',
  width: 48,
  height: 48,
  padding: 0,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 14,
  borderWidth: 1,
  backgroundColor: '$glassStrong',
  transition: 'quick',
  animateOnly: ['transform', 'opacity'],
  pressStyle: {scale: 0.96, opacity: 0.78},
  disabledStyle: {opacity: 0.5},
  variants: {
    actionTone: {
      edit: {borderColor: '$glassSurfaceBorder'},
      delete: {borderColor: '$error'},
    },
  } as const,
});

const ThemedIonicon = styled(Ionicons, {}, {accept: {color: 'color'} as const});
