import {Skeleton} from '@ravitamil/buddy-ui';
import {HStack, VStack} from '@ravitamil/buddy-ui';
import React from 'react';

import type {HomeScreenModel} from '../types';
import {HomeStatCard} from './HomeStatCard';
import {QuickActionsCard} from './QuickActionsCard';

interface HomeFinancialOverviewProps {
  isLoading: boolean;
  statCards: HomeScreenModel['statCards'];
  onAnalysePress: () => void;
  onAddTransactionPress: () => void;
  onNetWorthPress: () => void;
}

export const HomeFinancialOverview = ({
  isLoading,
  statCards,
  onAnalysePress,
  onAddTransactionPress,
  onNetWorthPress,
}: HomeFinancialOverviewProps) => (
  <VStack gap="$4" width="100%">
    <HStack gap="$2" width="100%">
      {statCards.map((card) => (
        <VStack key={`stat-card-${card.title}`} flex={1} minWidth={0}>
          <Skeleton visible={isLoading} width="100%" height={120} borderRadius={16}>
            <HomeStatCard
              title={card.title}
              value={card.value}
              icon={card.icon}
              percentage={card.percentage}
              percentageColor={card.percentageColor}
              percentageIcon={card.percentageIcon}
              trend={card.trend}
              type={card.type}
              onPress={card.onPress}
              onDoublePress={card.onDoublePress}
            />
          </Skeleton>
        </VStack>
      ))}
    </HStack>

    <Skeleton visible={isLoading} height={120} borderRadius={20}>
      <QuickActionsCard
        onAnalysePress={onAnalysePress}
        onAddTransactionPress={onAddTransactionPress}
        onNetWorthPress={onNetWorthPress}
      />
    </Skeleton>
  </VStack>
);
