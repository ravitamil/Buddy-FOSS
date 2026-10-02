import {VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import Animated from 'react-native-reanimated';

import type {UseFindGroupAndAddTransactionScreenResult} from '../hooks/useFindGroupAndAddTransactionScreen';
import {FindGroupSearchSection} from './findGroupAndAddTransaction/FindGroupSearchSection';
import {FindGroupTitle} from './findGroupAndAddTransaction/FindGroupTitle';
import {FindGroupTransactionFormSections} from './findGroupAndAddTransaction/FindGroupTransactionFormSections';
import {SettlementPreviewCard} from './findGroupAndAddTransaction/SettlementPreviewCard';

interface FindGroupAndAddTransactionContentProps {
  screen: UseFindGroupAndAddTransactionScreenResult;
}

export const FindGroupAndAddTransactionContent = ({
  screen,
}: FindGroupAndAddTransactionContentProps) => (
  <>
    <Animated.ScrollView
      removeClippedSubviews={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{paddingBottom: 100}}
      scrollEventThrottle={16}
      onScroll={screen.onScroll}>
      <VStack flex={1} padding="$4" gap="$3" paddingTop="$0">
        <Animated.View style={screen.largeTitleStyle}>
          <FindGroupTitle isDarkMode={screen.isDarkMode} />
        </Animated.View>

        <FindGroupSearchSection screen={screen} />
        {screen.selectedGroup ? <FindGroupTransactionFormSections screen={screen} /> : null}
      </VStack>
    </Animated.ScrollView>

    <SettlementPreviewCard
      preview={screen.settlementPreview}
      isDarkMode={screen.isDarkMode}
      formatCurrency={screen.settingsFormatCurrencyExact}
    />
  </>
);
