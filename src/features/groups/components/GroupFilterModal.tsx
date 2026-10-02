import {BottomSheet, BottomSheetOption} from '@ravitamil/buddy-ui/overlays';
import {Button, Text} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import {YStack, styled} from 'tamagui';
import {EnhancedGroup} from '@/features/groups/types';

const closeCircleIcon: keyof typeof Ionicons.glyphMap = 'close-circle';

interface GroupFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: EnhancedGroup[];
  selectedGroups: string[];
  onGroupSelect: (groupIds: string[]) => void;
}

const ThemedIonicon = styled(Ionicons, {}, {accept: {color: 'color'} as const});

const OptionIconFrame = styled(YStack, {
  name: 'GroupFilterOptionIcon',
  borderRadius: '$2',
  padding: '$2',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 40,
  minHeight: 40,

  variants: {
    tone: {
      neutral: {
        backgroundColor: '$surfacePress',
      },
      primary: {
        backgroundColor: '$accentBlueMuted',
      },
      purple: {
        backgroundColor: '$purple2',
      },
    },
  } as const,

  defaultVariants: {
    tone: 'neutral',
  },
});

export function GroupFilterModal({
  isOpen,
  onClose,
  groups,
  selectedGroups,
  onGroupSelect,
}: GroupFilterModalProps) {
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const handleGroupSelection = (groupId: string) => {
    let newSelectedGroups: string[];

    if (groupId === 'none') {
      newSelectedGroups = [];
    } else if (groupId === 'all') {
      newSelectedGroups = groups.map((group) => group.id);
    } else if (selectedGroups.includes(groupId)) {
      newSelectedGroups = selectedGroups.filter((id) => id !== groupId);
    } else {
      newSelectedGroups = [...selectedGroups, groupId];
    }

    onGroupSelect(newSelectedGroups);
  };

  const isNoneSelected = selectedGroups.length === 0;
  const isAllSelected = selectedGroups.length === groups.length && groups.length > 0;

  return (
    <BottomSheet
      open={isOpen}
      onOpenChange={handleOpenChange}
      snapPoints={[72, 95]}
      scrollable
      title="Filter by Group"
      description="Choose which groups appear in the transaction list"
      footer={
        <Button variant="outline" onPress={onClose}>
          Done
        </Button>
      }>
      <GroupFilterOption
        selected={isNoneSelected}
        icon={<ThemedIonicon name={closeCircleIcon} size={24} color="$color" />}
        title="None"
        onPress={() => handleGroupSelection('none')}
      />

      <GroupFilterOption
        selected={isAllSelected}
        icon={<ThemedIonicon name="people" size={24} color="$accentBlue" />}
        iconTone="primary"
        title={`All Groups (${groups.length})`}
        onPress={() => handleGroupSelection('all')}
      />

      {groups.map((group) => {
        const selected = selectedGroups.includes(group.id);

        return (
          <GroupFilterOption
            key={group.id}
            selected={selected}
            icon={
              <Text fontSize="$4" fontWeight="600">
                {group.emoji || 'G'}
              </Text>
            }
            iconTone="purple"
            title={group.name}
            subtitle={`${group.members?.length || 0} members`}
            onPress={() => handleGroupSelection(group.id)}
          />
        );
      })}
    </BottomSheet>
  );
}

interface GroupFilterOptionProps {
  selected: boolean;
  icon: React.ReactNode;
  iconTone?: 'neutral' | 'primary' | 'purple';
  title: string;
  subtitle?: string;
  onPress: () => void;
}

function GroupFilterOption({
  selected,
  icon,
  iconTone = 'neutral',
  title,
  subtitle,
  onPress,
}: GroupFilterOptionProps) {
  return (
    <BottomSheetOption
      label={title}
      description={subtitle}
      selected={selected}
      selectionMode="multiple"
      leading={<OptionIconFrame tone={iconTone}>{icon}</OptionIconFrame>}
      onPress={onPress}
    />
  );
}
