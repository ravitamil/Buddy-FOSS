import {Text} from '@ravitamil/buddy-ui';
import React from 'react';
import {View} from 'tamagui';

import {colorToken} from '@/utils/themeColors';
import type {SettlementPreview} from '../../hooks/useFindGroupAndAddTransactionScreen';

interface SettlementPreviewCardProps {
  preview: SettlementPreview | null;
  isDarkMode: boolean;
  formatCurrency: (amount: number) => string;
}

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
};

export const SettlementPreviewCard = ({
  preview,
  isDarkMode,
  formatCurrency,
}: SettlementPreviewCardProps) => {
  if (!preview) return null;

  return (
    <View
      style={{
        backgroundColor: isDarkMode ? colorToken('blue3') : colorToken('blue2'),
        borderRadius: 12,
        padding: 16,
        marginVertical: 16,
        borderWidth: 1,
        borderColor: isDarkMode ? colorToken('blue5') : colorToken('blue4'),
      }}>
      <Text fontSize="$6" fontWeight="bold" marginBottom="$3">
        Settlement Preview
      </Text>

      <Text
        style={{color: isDarkMode ? colorToken('gray6') : colorToken('gray7'), marginBottom: 8}}>
        <Text style={{fontWeight: '500'}}>{preview.payingMember}</Text> will pay{' '}
        <Text style={{fontWeight: '500'}}>{preview.recipients.join(', ')}</Text>
      </Text>

      {preview.debts.length > 0 ? (
        <View style={{marginVertical: 12}}>
          <Text
            style={{
              fontWeight: '500',
              marginBottom: 8,
              color: isDarkMode ? colorToken('gray7') : colorToken('gray8'),
            }}>
            Settling these debts:
          </Text>
          {preview.debts.map((debt) => (
            <View
              key={debt.id}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 4,
                paddingHorizontal: 8,
                backgroundColor: isDarkMode ? colorToken('gray3') : colorToken('gray2'),
                borderRadius: 6,
                marginBottom: 4,
              }}>
              <View style={{flex: 1}}>
                <Text
                  style={{
                    fontSize: 14,
                    color: isDarkMode ? colorToken('gray8') : colorToken('gray9'),
                  }}>
                  {debt.description}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: isDarkMode ? colorToken('gray6') : colorToken('gray7'),
                  }}>
                  to {debt.creditor} - {formatDate(debt.date)}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: isDarkMode ? colorToken('blue6') : colorToken('blue7'),
                }}>
                {formatCurrency(debt.outstandingAmount)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: isDarkMode ? colorToken('blue4') : colorToken('blue3'),
          paddingTop: 12,
          marginTop: 8,
        }}>
        <PreviewAmountRow
          label="Total Outstanding:"
          amount={preview.totalOutstanding}
          isDarkMode={isDarkMode}
          formatCurrency={formatCurrency}
        />
        <PreviewAmountRow
          label="Settlement Amount:"
          amount={preview.settlementAmount}
          isDarkMode={isDarkMode}
          formatCurrency={formatCurrency}
        />
        {Math.abs(preview.difference) > 0.01 ? (
          <PreviewDifferenceRow
            difference={preview.difference}
            isDarkMode={isDarkMode}
            formatCurrency={formatCurrency}
          />
        ) : null}
      </View>
    </View>
  );
};

const PreviewAmountRow = ({
  label,
  amount,
  isDarkMode,
  formatCurrency,
}: {
  label: string;
  amount: number;
  isDarkMode: boolean;
  formatCurrency: (amount: number) => string;
}) => (
  <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4}}>
    <Text style={{color: isDarkMode ? colorToken('gray6') : colorToken('gray7')}}>{label}</Text>
    <Text style={{fontWeight: '500'}}>{formatCurrency(amount)}</Text>
  </View>
);

const PreviewDifferenceRow = ({
  difference,
  isDarkMode,
  formatCurrency,
}: {
  difference: number;
  isDarkMode: boolean;
  formatCurrency: (amount: number) => string;
}) => {
  const tone =
    difference > 0
      ? isDarkMode
        ? colorToken('orange6')
        : colorToken('orange7')
      : isDarkMode
        ? colorToken('red6')
        : colorToken('red7');

  return (
    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
      <Text style={{color: tone, fontWeight: '500'}}>
        {difference > 0 ? 'Overpayment:' : 'Underpayment:'}
      </Text>
      <Text style={{fontWeight: '500', color: tone}}>{formatCurrency(Math.abs(difference))}</Text>
    </View>
  );
};
