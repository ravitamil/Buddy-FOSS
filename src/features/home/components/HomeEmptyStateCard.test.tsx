import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';

import {HomeEmptyStateCard} from './HomeEmptyStateCard';

describe('HomeEmptyStateCard', () => {
  it('uses the Groups-screen empty-state anatomy and keeps the icon as the action', () => {
    const onPress = jest.fn();
    const {getByLabelText, getByText} = render(
      <HomeEmptyStateCard
        type="group"
        title="No Groups Yet"
        description="Create a group to share expenses"
        onPress={onPress}
      />,
    );

    expect(getByText('No Groups Yet')).toBeTruthy();
    fireEvent.press(getByLabelText('Create group'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('uses the same circular action treatment for transactions', () => {
    const onPress = jest.fn();
    const {getByLabelText} = render(
      <HomeEmptyStateCard
        type="transaction"
        title="No Transactions Yet"
        description="Add your first transaction"
        onPress={onPress}
      />,
    );

    fireEvent.press(getByLabelText('Add transaction'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
