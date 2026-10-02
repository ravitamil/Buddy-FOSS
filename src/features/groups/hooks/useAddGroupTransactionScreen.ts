import {useCallback, useEffect, useMemo, useState} from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import {useRouter} from 'expo-router';
import {useAuth, useCategory, useGroups, useSettings, useUser} from '@/context';
import {useMembership} from '@/context/MembershipContext';
import {useAlert} from '@/hooks/useAlert';
import {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';
import {logger as appLogger} from '@/services/LoggerService';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import type {MemberDebt} from '@/types';
import {formatUserDisplayName} from '@/utils/userUtils';
import type {
  AddGroupTransactionCategory,
  GroupSplitType,
  GroupTransactionType,
  GroupWithAvatarMembers,
} from '../types/addGroupTransaction';
import {calculateGroupSplitAmounts, isDecimalInput} from '../utils/groupTransactionFormUtils';
import {
  buildGroupBalanceViewModel,
  getAvatarColor,
  getDefaultCategoryId,
  isGroupTransactionFormValid,
} from './addGroupTransactionModels';
import {useAddGroupTransactionSubmit} from './useAddGroupTransactionSubmit';
import {useGroupTransactionFormContext} from './useGroupTransactionFormContext';
import {validateReceiptFile} from './addGroupTransactionReceiptValidation';

const logger = appLogger.contextLogger('AddGroupTransactionScreen');

export interface UseAddGroupTransactionScreenResult {
  group: GroupWithAvatarMembers | null;
  expenseCategories: AddGroupTransactionCategory[];
  description: string;
  selectedCategoryId: string;
  amount: string;
  transactionType: GroupTransactionType;
  paidBy: string;
  receivedBy: string[];
  splitType: GroupSplitType;
  customAmounts: Record<string, string>;
  percentageAmounts: Record<string, string>;
  sharesAmounts: Record<string, string>;
  selectedDebts: Record<string, boolean>;
  loading: boolean;
  receiptUri: string | null;
  receiptName?: string;
  receiptMimeType?: string;
  receiptFileSize?: number;
  isReceiptExpanded: boolean;
  isReceiptSheetOpen: boolean;
  isPro: boolean;
  isCategorySheetOpen: boolean;
  isFormValid: boolean;
  currencySymbol: string;
  currencyCode: string;
  isDarkMode: boolean;
  userFirstName?: string;
  headerProps: ReturnType<typeof useProgressiveBlurHeader>['headerProps'];
  onScroll: ReturnType<typeof useProgressiveBlurHeader>['onScroll'];
  settingsFormatCurrencyExact: (amount: number) => string;
  getUserDisplayName: () => string;
  getAvatarColor: (name: string) => string;
  getMemberDebts: () => MemberDebt[];
  setDescription: (value: string) => void;
  setSelectedCategoryId: (value: string) => void;
  setTransactionType: (value: GroupTransactionType) => void;
  setPaidBy: (value: string) => void;
  setSplitType: (value: GroupSplitType) => void;
  setCustomAmounts: (value: Record<string, string>) => void;
  setPercentageAmounts: (value: Record<string, string>) => void;
  setSharesAmounts: (value: Record<string, string>) => void;
  setIsReceiptExpanded: (value: boolean) => void;
  setIsReceiptSheetOpen: (value: boolean) => void;
  setIsCategorySheetOpen: (value: boolean) => void;
  handleBack: () => void;
  handleAmountChange: (text: string) => void;
  handleRecipientSelection: (memberId: string) => void;
  handlePickReceipt: () => void;
  handlePickDocument: () => void;
  handlePickImage: () => void;
  handleTakePhoto: () => void;
  handleRemoveReceipt: () => void;
  handleUpgradePro: () => void;
  handleSubmit: () => void;
}

interface UseAddGroupTransactionScreenOptions {
  groupId: string;
  initialPaidBy?: string;
  initialReceivedBy?: string;
  initialAmount?: string;
  initialType?: string;
}

export const useAddGroupTransactionScreen = ({
  groupId,
  initialPaidBy,
  initialReceivedBy,
  initialAmount,
  initialType: initialTypeParam,
}: UseAddGroupTransactionScreenOptions): UseAddGroupTransactionScreenResult => {
  const router = useRouter();
  const initialType =
    initialTypeParam === 'payment' || initialTypeParam === 'expense' ? initialTypeParam : undefined;
  const enhancedGroups = useGroups();
  const {groups} = enhancedGroups;
  const {user} = useAuth();
  const {profile} = useUser();
  const {formatCurrencyExact: settingsFormatCurrencyExact, currency, groupCurrency} = useSettings();
  const {categories} = useCategory();
  const {showAlert} = useAlert();
  const {onScroll, headerProps} = useProgressiveBlurHeader();
  const {isDarkMode} = useTamaguiTheme();
  const {isPro} = useMembership();

  const {
    group,
    userFirstName,
    currencySymbol,
    getUserDisplayName,
    currentUserMember,
    expenseCategories,
  } = useGroupTransactionFormContext({
    groups: groups.items as GroupWithAvatarMembers[],
    groupId,
    profile,
    user,
    currency,
    categories,
  });

  const effectiveCurrency = group?.currency || groupCurrency || currency || 'USD';

  const [description, setDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [amount, setAmount] = useState(initialAmount || '');
  const [transactionType, setTransactionType] = useState<GroupTransactionType>(
    initialType || 'expense',
  );
  const [paidBy, setPaidBy] = useState(initialPaidBy || currentUserMember?.id || '');
  const [receivedBy, setReceivedBy] = useState<string[]>(
    initialReceivedBy ? [initialReceivedBy] : [],
  );
  const [splitType, setSplitType] = useState<GroupSplitType>('equal');
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [percentageAmounts, setPercentageAmounts] = useState<Record<string, string>>({});
  const [sharesAmounts, setSharesAmounts] = useState<Record<string, string>>({});
  const [selectedDebts, setSelectedDebts] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [receiptUri, setReceiptUri] = useState<string | null>(null);
  const [receiptName, setReceiptName] = useState<string | undefined>(undefined);
  const [receiptMimeType, setReceiptMimeType] = useState<string | undefined>(undefined);
  const [receiptFileSize, setReceiptFileSize] = useState<number | undefined>(undefined);
  const [isReceiptExpanded, setIsReceiptExpanded] = useState(false);
  const [isReceiptSheetOpen, setIsReceiptSheetOpen] = useState(false);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);

  useEffect(() => {
    if (!selectedCategoryId && expenseCategories.length > 0) {
      setSelectedCategoryId(getDefaultCategoryId(expenseCategories));
    }
  }, [expenseCategories, selectedCategoryId]);

  useEffect(() => {
    if (transactionType !== 'expense' && isCategorySheetOpen) {
      setIsCategorySheetOpen(false);
    }
  }, [isCategorySheetOpen, transactionType]);

  useEffect(() => {
    if (transactionType === 'payment' && paidBy && receivedBy.length > 0) {
      const payer = group?.members.find((member) => member.id === paidBy);
      const receiver = group?.members.find((member) => member.id === receivedBy[0]);

      if (payer && receiver) {
        setDescription(
          `Repayment from ${formatUserDisplayName(payer.name, userFirstName, undefined, getUserDisplayName)} to ${formatUserDisplayName(receiver.name, userFirstName, undefined, getUserDisplayName)}`,
        );
      }
    }
  }, [getUserDisplayName, group?.members, paidBy, receivedBy, transactionType, userFirstName]);

  const groupBalance = useMemo(
    () => buildGroupBalanceViewModel(group, group ? enhancedGroups.getMemberDebts(group.id) : []),
    [enhancedGroups, group],
  );

  const getMemberDebts = useCallback(() => {
    if (!groupBalance || !paidBy) {
      return [];
    }

    return (
      groupBalance.memberBalances.find((member) => member.memberId === paidBy)?.outstandingDebts ??
      []
    );
  }, [groupBalance, paidBy]);

  const handleSplitTypeChange = useCallback(
    (newSplitType: GroupSplitType) => {
      setSplitType(newSplitType);
      if (!group) return;

      if (newSplitType === 'equal') {
        setCustomAmounts({});
        setPercentageAmounts({});
        setSharesAmounts({});
      } else if (newSplitType === 'shares') {
        const nextShares: Record<string, string> = {};
        group.members.forEach((member) => {
          nextShares[member.id] = sharesAmounts[member.id] || '1';
        });
        setSharesAmounts(nextShares);
      } else if (newSplitType === 'percentage') {
        const count = group.members.length || 1;
        const equalPct = (100 / count).toFixed(1);
        const nextPct: Record<string, string> = {};
        group.members.forEach((member) => {
          nextPct[member.id] = percentageAmounts[member.id] || equalPct;
        });
        setPercentageAmounts(nextPct);
      } else if (newSplitType === 'custom') {
        const count = group.members.length || 1;
        const parsed = Number.parseFloat(amount) || 0;
        const equalAmt = (parsed / count).toFixed(2);
        const nextCustom: Record<string, string> = {};
        group.members.forEach((member) => {
          nextCustom[member.id] = customAmounts[member.id] || equalAmt;
        });
        setCustomAmounts(nextCustom);
      }
    },
    [amount, customAmounts, group, percentageAmounts, sharesAmounts],
  );

  const calculateSplitAmounts = useCallback(() => {
    return calculateGroupSplitAmounts({
      group,
      amount,
      splitType,
      customAmounts,
      percentageAmounts,
      sharesAmounts,
    });
  }, [amount, customAmounts, group, percentageAmounts, sharesAmounts, splitType]);

  const isFormValid = useMemo(
    () =>
      isGroupTransactionFormValid({
        amount,
        description,
        paidBy,
        receivedBy,
        transactionType,
        splitType,
        customAmounts,
        percentageAmounts,
        sharesAmounts,
      }),
    [
      amount,
      customAmounts,
      description,
      paidBy,
      percentageAmounts,
      receivedBy,
      sharesAmounts,
      splitType,
      transactionType,
    ],
  );

  const handleUpgradePro = useCallback(() => {
    router.push('/paywall');
  }, [router]);

  const validateAndSetReceipt = useCallback(
    async (uri: string, name?: string, mimeType?: string, initialSize?: number) => {
      const validation = await validateReceiptFile({
        uri,
        name,
        mimeType,
        size: initialSize,
      });

      if (!validation.valid) {
        showAlert({
          title: 'Invalid File',
          message: validation.error || 'The selected file is not supported or exceeds 1 MB.',
          actions: [{text: 'OK'}],
        });
        return;
      }

      setReceiptUri(uri);
      setReceiptName(name || `receipt.${validation.extension}`);
      setReceiptMimeType(validation.mimeType);
      setReceiptFileSize(validation.fileSize);
      setIsReceiptExpanded(true);
      logger.debug('Selected validated receipt', {
        uri,
        name,
        mimeType: validation.mimeType,
        fileSize: validation.fileSize,
      });
    },
    [showAlert],
  );

  const handlePickImage = useCallback(() => {
    if (!isPro) {
      handleUpgradePro();
      return;
    }

    void (async () => {
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsMultipleSelection: false,
          quality: 0.8,
        });

        if (!result.canceled && result.assets.length > 0) {
          const asset = result.assets[0];
          await validateAndSetReceipt(
            asset.uri,
            asset.fileName || 'receipt.jpg',
            asset.mimeType || 'image/jpeg',
            asset.fileSize,
          );
        }
      } catch (error) {
        logger.error('Error picking image receipt', error);
        showAlert({title: 'Error', message: 'Failed to pick image', actions: [{text: 'OK'}]});
      }
    })();
  }, [handleUpgradePro, isPro, showAlert, validateAndSetReceipt]);

  const handleTakePhoto = useCallback(() => {
    if (!isPro) {
      handleUpgradePro();
      return;
    }

    void (async () => {
      try {
        const {status} = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== ImagePicker.PermissionStatus.GRANTED) {
          showAlert({
            title: 'Permission Denied',
            message: 'Camera permission is required to take a photo of the receipt.',
            actions: [{text: 'OK'}],
          });
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsMultipleSelection: false,
          quality: 0.8,
        });

        if (!result.canceled && result.assets.length > 0) {
          const asset = result.assets[0];
          await validateAndSetReceipt(
            asset.uri,
            asset.fileName || 'camera_receipt.jpg',
            asset.mimeType || 'image/jpeg',
            asset.fileSize,
          );
        }
      } catch (error) {
        logger.error('Error taking receipt photo', error);
        showAlert({title: 'Error', message: 'Failed to take photo', actions: [{text: 'OK'}]});
      }
    })();
  }, [handleUpgradePro, isPro, showAlert, validateAndSetReceipt]);

  const handlePickDocument = useCallback(() => {
    if (!isPro) {
      handleUpgradePro();
      return;
    }

    void (async () => {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: [
            'image/*',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
          ],
          copyToCacheDirectory: true,
          multiple: false,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          await validateAndSetReceipt(
            asset.uri,
            asset.name,
            asset.mimeType || 'application/pdf',
            asset.size,
          );
        }
      } catch (error) {
        logger.error('Error picking document receipt', error);
        showAlert({title: 'Error', message: 'Failed to pick document', actions: [{text: 'OK'}]});
      }
    })();
  }, [handleUpgradePro, isPro, showAlert, validateAndSetReceipt]);

  const handlePickReceipt = useCallback(() => {
    if (!isPro) {
      handleUpgradePro();
      return;
    }

    setIsReceiptSheetOpen(true);
  }, [handleUpgradePro, isPro]);

  const handleRemoveReceipt = useCallback(() => {
    setReceiptUri(null);
    setReceiptName(undefined);
    setReceiptMimeType(undefined);
    setReceiptFileSize(undefined);
  }, []);

  const handleSubmit = useAddGroupTransactionSubmit({
    group,
    amount,
    description,
    transactionType,
    paidBy,
    receivedBy,
    splitType,
    customAmounts,
    percentageAmounts,
    sharesAmounts,
    selectedCategoryId,
    receiptUri,
    receiptName,
    receiptMimeType,
    expenseCategories,
    currency,
    groupCurrency,
    userFirstName,
    router,
    enhancedGroups,
    settingsFormatCurrencyExact,
    getUserDisplayName,
    getMemberDebts,
    calculateSplitAmounts,
    setLoading,
    showAlert,
  });

  return {
    group,
    expenseCategories,
    description,
    selectedCategoryId,
    amount,
    transactionType,
    paidBy,
    receivedBy,
    splitType,
    customAmounts,
    percentageAmounts,
    sharesAmounts,
    selectedDebts,
    loading,
    receiptUri,
    receiptName,
    receiptMimeType,
    receiptFileSize,
    isReceiptExpanded,
    isReceiptSheetOpen,
    isPro,
    isCategorySheetOpen,
    isFormValid,
    currencySymbol,
    currencyCode: effectiveCurrency,
    isDarkMode,
    userFirstName,
    headerProps,
    onScroll,
    settingsFormatCurrencyExact,
    getUserDisplayName,
    getAvatarColor,
    getMemberDebts,
    setDescription,
    setSelectedCategoryId,
    setTransactionType,
    setPaidBy,
    setSplitType: handleSplitTypeChange,
    setCustomAmounts,
    setPercentageAmounts,
    setSharesAmounts,
    setIsReceiptExpanded,
    setIsReceiptSheetOpen,
    setIsCategorySheetOpen,
    handleBack: () => router.back(),
    handleAmountChange: (text) => {
      if (isDecimalInput(text)) {
        setAmount(text);
      }
    },
    handleRecipientSelection: (memberId) => {
      setReceivedBy((prev) => {
        const next = prev.length === 1 && prev[0] === memberId ? [] : [memberId];
        setSelectedDebts(next.length === 0 ? {} : {[next[0]]: true});
        return next;
      });
    },
    handlePickReceipt,
    handlePickDocument,
    handlePickImage,
    handleTakePhoto,
    handleRemoveReceipt,
    handleUpgradePro,
    handleSubmit,
  };
};
