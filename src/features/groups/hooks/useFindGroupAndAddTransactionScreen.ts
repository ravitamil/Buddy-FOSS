import {useCallback, useMemo, useState} from 'react';
import {InteractionManager} from 'react-native';
import {useRouter} from 'expo-router';

import {getCurrencySymbol} from '@/constants/currencies';
import {useAuth, useGroups, useSettings} from '@/context';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {useAlert} from '@/hooks/useAlert';
import {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';
import {logger as appLogger} from '@/services/LoggerService';
import type {GroupMember, MemberDebt} from '@/types';
import type {EnhancedGroup} from '@/features/groups/types';
import {calculateGroupBalance} from '@/utils/groupBalanceUtils.optimized';
import {prepareTransactionsWithFx} from '@/utils/prepareFx';
import type {GroupSplitType, GroupTransactionType} from '../types/addGroupTransaction';
import type {
  SettlementPreview,
  UseFindGroupAndAddTransactionScreenResult,
} from './findGroupAndAddTransactionTypes';
import {
  buildSettlementPreview,
  calculateSplitAmounts,
  getCurrentUserMember,
  getSelectedDebtIds,
  isDecimalInput,
} from './findGroupAndAddTransactionUtils';
import {useFindGroupTransactionSubmit} from './useFindGroupTransactionSubmit';

export type {SettlementPreview, SettlementPreviewDebt} from './findGroupAndAddTransactionTypes';
export type {UseFindGroupAndAddTransactionScreenResult};

export const useFindGroupAndAddTransactionScreen =
  (): UseFindGroupAndAddTransactionScreenResult => {
    appLogger.debug('FindGroupAndAddTransactionScreen: component rendering started');

    const router = useRouter();
    const enhancedGroups = useGroups();
    const {groups} = enhancedGroups;
    const {
      formatCurrencyExact: settingsFormatCurrencyExact,
      currency,
      groupCurrency,
    } = useSettings();
    const {showAlert} = useAlert();
    const {user} = useAuth();
    const {isDarkMode} = useTamaguiTheme();
    const {onScroll, headerProps, largeTitleStyle} = useProgressiveBlurHeader();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGroup, setSelectedGroup] = useState<EnhancedGroup | null>(null);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [transactionType, setTransactionType] = useState<GroupTransactionType>('expense');
    const [paidBy, setPaidBy] = useState('');
    const [receivedBy, setReceivedBy] = useState<string[]>([]);
    const [splitType, setSplitType] = useState<GroupSplitType>('equal');
    const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
    const [percentageAmounts, setPercentageAmounts] = useState<Record<string, string>>({});
    const [sharesAmounts, setSharesAmounts] = useState<Record<string, string>>({});
    const [selectedDebts, setSelectedDebts] = useState<Record<string, boolean>>({});

    const currencySymbol = getCurrencySymbol(currency);

    const getUserDisplayName = useCallback(
      () => user?.displayName || user?.email || 'Current User',
      [user?.displayName, user?.email],
    );

    const navigateBackSafely = useCallback(() => {
      InteractionManager.runAfterInteractions(() => {
        try {
          if (router.canGoBack()) {
            router.back();
            return;
          }
          if (selectedGroup?.id) {
            router.replace(`/groups/${selectedGroup.id}`);
            return;
          }
          router.back();
        } catch {
          router.back();
        }
      });
    }, [router, selectedGroup?.id]);

    const groupBalance = useMemo(() => {
      if (!selectedGroup) return null;
      const effectiveCurrency = selectedGroup.currency || groupCurrency || currency || 'USD';
      const txWithFx = prepareTransactionsWithFx(
        selectedGroup.transactions || [],
        effectiveCurrency,
      );
      return calculateGroupBalance(
        txWithFx,
        (selectedGroup.members || []) as unknown as GroupMember[],
      );
    }, [currency, groupCurrency, selectedGroup]);

    const filteredGroups = useMemo(() => {
      if (!searchQuery.trim()) return [];
      const query = searchQuery.toLowerCase().trim();
      return (groups?.items || []).filter((group) => group.name.toLowerCase().includes(query));
    }, [groups?.items, searchQuery]);

    const getMemberDebts = useCallback((): MemberDebt[] => {
      if (!groupBalance || !paidBy) return [];
      return (
        groupBalance.memberBalances.find((memberBalance) => memberBalance.memberId === paidBy)
          ?.outstandingDebts ?? []
      );
    }, [groupBalance, paidBy]);

    const handleRecipientSelection = useCallback((memberId: string) => {
      setReceivedBy((prev) => {
        const next = prev.length === 1 && prev[0] === memberId ? [] : [memberId];
        setSelectedDebts(next.length === 0 ? {} : {[next[0]]: true});
        return next;
      });
    }, []);

    const handleSelectGroup = useCallback(
      (group: EnhancedGroup) => {
        appLogger.debug('FindGroupAndAddTransactionScreen: group selected', group.name);
        setSelectedGroup(group);
        setSearchQuery('');

        const currentUserDisplayName = getUserDisplayName();
        const currentUserMember = getCurrentUserMember(group, currentUserDisplayName);
        setPaidBy(currentUserMember?.id || '');
      },
      [getUserDisplayName],
    );

    const splitAmounts = useMemo(
      () => calculateSplitAmounts({amount, customAmounts, selectedGroup, splitType}),
      [amount, customAmounts, selectedGroup, splitType],
    );

    const settlementPreview = useMemo<SettlementPreview | null>(() => {
      return buildSettlementPreview({
        amount,
        paidBy,
        receivedBy,
        selectedDebtIds: getSelectedDebtIds({groupBalance, paidBy, selectedDebts}),
        selectedGroup,
        transactionType,
      });
    }, [amount, groupBalance, paidBy, receivedBy, selectedDebts, selectedGroup, transactionType]);

    const handleSubmit = useFindGroupTransactionSubmit({
      amount,
      customAmounts,
      description,
      enhancedGroups,
      getMemberDebts,
      groupBalance,
      navigateBackSafely,
      paidBy,
      receivedBy,
      selectedDebts,
      selectedGroup,
      settingsFormatCurrencyExact,
      showAlert,
      splitAmounts,
      splitType,
      transactionType,
    });

    return {
      searchQuery,
      selectedGroup,
      filteredGroups,
      description,
      amount,
      transactionType,
      paidBy,
      receivedBy,
      splitType,
      customAmounts,
      percentageAmounts,
      sharesAmounts,
      currencySymbol,
      isDarkMode,
      headerProps,
      onScroll,
      largeTitleStyle,
      settlementPreview,
      settingsFormatCurrencyExact,
      getMemberDebts,
      setSearchQuery,
      setSelectedGroup,
      setDescription,
      setTransactionType,
      setPaidBy,
      setSplitType,
      setCustomAmounts,
      setPercentageAmounts,
      setSharesAmounts,
      handleAmountChange: (text) => {
        if (isDecimalInput(text)) {
          setAmount(text);
        }
      },
      handleRecipientSelection,
      handleSelectGroup,
      handleSubmit,
      navigateBack: () => router.back(),
    };
  };
