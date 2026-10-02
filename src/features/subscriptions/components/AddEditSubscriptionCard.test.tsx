import React from 'react';
import {render} from '@testing-library/react-native';
import {Text, View} from 'react-native';

import {AddEditSubscriptionCard} from './AddEditSubscriptionCard';

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
  GlassSurface: mockStack,
  HStack: mockStack,
  Text: mockText,
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

describe('AddEditSubscriptionCard', () => {
  it('uses the canonical app surface and retains its form content', () => {
    const {getByText} = render(
      <AddEditSubscriptionCard
        title="Service Information"
        subtitle="Choose your subscription service"
        icon="information-circle"
        accentColor="#E50914"
        isDarkMode>
        <Text>Subscription form content</Text>
      </AddEditSubscriptionCard>,
    );

    expect(getByText('Service Information')).toBeTruthy();
    expect(getByText('Subscription form content')).toBeTruthy();
  });
});
