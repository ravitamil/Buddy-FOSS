import {HStack, Text} from '@ravitamil/buddy-ui';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';

interface AnalyticsPeriodSelectorProps<TPeriod extends string> {
  periods: readonly TPeriod[];
  selectedPeriod: TPeriod;
  onPeriodChange: (period: TPeriod) => void;
}

export const AnalyticsPeriodSelector = <TPeriod extends string>({
  periods,
  selectedPeriod,
  onPeriodChange,
}: AnalyticsPeriodSelectorProps<TPeriod>) => {
  const {isDarkMode} = useTamaguiTheme();

  return (
    <HStack gap="$2" marginBottom="$3">
      {periods.map((period) => {
        const isSelected = selectedPeriod === period;

        return (
          <HStack
            key={period}
            accessibilityRole="button"
            accessibilityState={{selected: isSelected}}
            onPress={() => onPeriodChange(period)}
            pressStyle={{opacity: 0.8}}
            backgroundColor={
              isSelected
                ? '$teal9'
                : isDarkMode
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(255, 255, 255, 0.6)'
            }
            paddingHorizontal="$3"
            paddingVertical="$1.5"
            borderRadius="$8"
            borderWidth={isSelected ? 0 : 1}
            borderColor={isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}>
            <Text color={isSelected ? 'white' : '$text'} fontSize="$1" fontWeight="600">
              {period}
            </Text>
          </HStack>
        );
      })}
    </HStack>
  );
};
