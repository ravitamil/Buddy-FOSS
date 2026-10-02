import {Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';

import {getFontFamilyForWeight} from '@/utils/fonts';

interface FindGroupTitleProps {
  isDarkMode: boolean;
}

export const FindGroupTitle = ({isDarkMode}: FindGroupTitleProps) => (
  <VStack>
    <Text
      fontSize={28}
      fontWeight="700"
      color={isDarkMode ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)'}
      marginTop={0}
      letterSpacing={-0.5}
      paddingLeft={2}
      fontFamily={getFontFamilyForWeight('bold')}>
      Find & Add Transaction
    </Text>
    <Text
      fontSize={11}
      fontWeight="600"
      color={isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'}
      paddingTop={2}
      paddingLeft={4}
      textTransform="uppercase"
      letterSpacing={0.5}
      fontFamily={getFontFamilyForWeight('semibold')}>
      SEARCH FOR A GROUP TO ADD EXPENSE OR PAYMENT
    </Text>
  </VStack>
);
