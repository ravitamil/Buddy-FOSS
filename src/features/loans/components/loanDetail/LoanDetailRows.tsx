import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import type {ComponentProps, ReactNode} from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {useTheme} from 'tamagui';

import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export interface LoanDetailRow {
  icon: IoniconName;
  iconColor?: string;
  label: string;
  value: ReactNode;
}

function Separator() {
  const {isDarkMode} = useTamaguiTheme();
  return (
    <VStack
      height={1}
      backgroundColor={isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}
    />
  );
}

function DetailRow({icon, iconColor, label, value}: LoanDetailRow) {
  const theme = useTheme();
  const defaultIconColor = typeof theme.blue9?.val === 'string' ? theme.blue9.val : '#3B82F6';

  return (
    <HStack justifyContent="space-between" alignItems="center" paddingVertical="$2">
      <HStack alignItems="center" gap="$2" flex={1}>
        <Ionicons name={icon} size={16} color={iconColor ?? defaultIconColor} />
        <Text variant="body1" color="$textSecondary" weight="medium">
          {label}
        </Text>
      </HStack>
      {typeof value === 'string' || typeof value === 'number' ? (
        <Text variant="body1" color="$text" weight="bold" textAlign="right">
          {value}
        </Text>
      ) : (
        value
      )}
    </HStack>
  );
}

export function LoanDetailRows({rows}: {rows: Array<LoanDetailRow | null>}) {
  return rows
    .filter((row): row is LoanDetailRow => row !== null)
    .map((row, index) => (
      <React.Fragment key={`${row.label}-${index}`}>
        {index > 0 && <Separator />}
        <DetailRow {...row} />
      </React.Fragment>
    ));
}
