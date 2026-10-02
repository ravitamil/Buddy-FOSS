import React from 'react';
import {render} from '@testing-library/react-native';
import {Text, View} from 'react-native';

import {AddEditLoanCard} from './AddEditLoanCard';

function mockStack({children}: {children?: React.ReactNode}) {
  return <View>{children}</View>;
}

function mockText({children}: {children?: React.ReactNode}) {
  return <Text>{children}</Text>;
}

function mockIcon() {
  return <View />;
}

jest.mock('@/components/ui', () => ({
  HStack: mockStack,
  VStack: mockStack,
}));

jest.mock('@ravitamil/buddy-ui', () => ({
  GlassSurface: mockStack,
  HStack: mockStack,
  Text: mockText,
  VStack: mockStack,
  useBuddyColors: () => ({iconBrand: '#3b82f6'}),
}));

jest.mock('@ravitamil/buddy-ui/icons/AppIcon', () => ({
  Ionicons: mockIcon,
}));

describe('AddEditLoanCard', () => {
  it('uses the subscription-form glass treatment while retaining loan form content', () => {
    const {getByText} = render(
      <AddEditLoanCard
        title="Interest & Tenure"
        subtitle="Set the repayment terms"
        icon="trending-up"
        accentColor="#F59E0B">
        <Text>Loan form content</Text>
      </AddEditLoanCard>,
    );

    expect(getByText('Interest & Tenure')).toBeTruthy();
    expect(getByText('Set the repayment terms')).toBeTruthy();
    expect(getByText('Loan form content')).toBeTruthy();
  });
});
