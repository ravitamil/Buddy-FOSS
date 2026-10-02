import {Text, VStack} from '@ravitamil/buddy-ui';
import React, {useCallback, useState} from 'react';
import {XStack, styled, useTheme} from 'tamagui';
import {resolveThemeColor} from '@ravitamil/buddy-ui';

import {GlassSurface} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

const PREDEFINED_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E9',
  '#F8C471',
  '#82E0AA',
  '#F1948A',
  '#FF7675',
  '#D7BDE2',
  '#A3E4D7',
  '#F9E79F',
  '#FADBD8',
  '#D5DBDB',
  '#AED6F1',
  '#A9DFBF',
  '#F4D03F',
  '#E8DAEF',
  '#D6EAF8',
  '#ABEBC6',
];

interface CategoryColorPickerProps {
  onSelectColor: (color: string) => void;
  selectedColor: string;
}

const ColorSwatch = styled(XStack, {
  name: 'CategoryColorSwatch',
  width: 48,
  height: 48,
  minWidth: 48,
  minHeight: 48,
  padding: 0,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: '$borderColor',
  alignItems: 'center',
  justifyContent: 'center',
  pressStyle: {
    scale: 0.94,
  },

  variants: {
    selected: {
      true: {
        borderWidth: 3,
        borderColor: '$text',
      },
      false: {
        borderWidth: 1,
        borderColor: '$borderColor',
      },
    },
  } as const,

  defaultVariants: {
    selected: false,
  },
});

export const CategoryColorPicker = React.memo(function CategoryColorPicker({
  onSelectColor,
  selectedColor,
}: CategoryColorPickerProps) {
  const [showPalette, setShowPalette] = useState(false);
  const handleTogglePalette = useCallback(() => setShowPalette((current) => !current), []);
  const handleSelectColor = useCallback(
    (color: string) => {
      onSelectColor(color);
      setShowPalette(false);
    },
    [onSelectColor],
  );

  return (
    <GlassSurface padding={10} borderRadius={20}>
      <VStack gap="$2">
        <Text color="$text" fontSize="$5" fontWeight="700">
          Accent color
        </Text>
        <PaletteTrigger
          selectedColor={selectedColor}
          showPalette={showPalette}
          onPress={handleTogglePalette}
        />
        {showPalette ? (
          <XStack flexWrap="wrap" gap="$2.5" justifyContent="space-between">
            {PREDEFINED_COLORS.map((color) => (
              <ColorSwatch
                key={color}
                accessibilityLabel={`Select category color ${color}`}
                accessibilityState={{selected: selectedColor === color}}
                backgroundColor={color}
                selected={selectedColor === color}
                onPress={() => handleSelectColor(color)}
              />
            ))}
          </XStack>
        ) : null}
      </VStack>
    </GlassSurface>
  );
});

function PaletteTrigger({
  onPress,
  selectedColor,
  showPalette,
}: {
  onPress: () => void;
  selectedColor: string;
  showPalette: boolean;
}) {
  const theme = useTheme();
  const mutedIconColor = resolveThemeColor(theme, 'textSecondary', '#9ca3af');

  return (
    <XStack
      minHeight={52}
      paddingHorizontal="$3"
      borderRadius={16}
      backgroundColor="$surface"
      alignItems="center"
      gap="$3"
      accessibilityRole="button"
      accessibilityLabel="Choose accent color"
      accessibilityHint={
        showPalette ? 'Hides the accent color palette' : 'Shows the accent color palette'
      }
      accessibilityState={{expanded: showPalette}}
      onPress={onPress}
      pressStyle={{opacity: 0.88}}>
      <XStack
        width={28}
        height={28}
        borderRadius={10}
        backgroundColor={selectedColor}
        borderWidth={1}
        borderColor="$glassSurfaceBorder"
      />
      <VStack flex={1} gap="$0.5">
        <Text color="$text" fontSize="$3" fontWeight="600">
          Choose a color
        </Text>
        <Text color="$textSecondary" fontSize="$2">
          Used for the category icon
        </Text>
      </VStack>
      <Ionicons
        name={showPalette ? 'chevron-up' : 'chevron-down'}
        size={20}
        color={mutedIconColor}
      />
    </XStack>
  );
}
