import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';

import type {Category} from '@/types';
import {CategoryFilters, ManageCategoriesOverview} from './ManageCategoryControls';
import {CategoryItem} from './ManageCategoryRows';

jest.mock('@/context/TamaguiThemeProvider', () => ({
  useTamaguiTheme: jest.fn(() => ({isDarkMode: false})),
}));

describe('Manage Categories components', () => {
  it('announces the selected filter and changes it from a 48-point control', () => {
    const onChange = jest.fn();
    const {getByLabelText} = render(
      <CategoryFilters
        activeFilter="expense"
        counts={{expense: 5, income: 3, investment: 2, total: 10}}
        onChange={onChange}
      />,
    );

    expect(getByLabelText('Show expense categories').props.accessibilityState).toEqual({
      selected: true,
    });

    fireEvent.press(getByLabelText('Show income categories'));
    expect(onChange).toHaveBeenCalledWith('income');
  });

  it('allows switching category filters from the interactive overview metric stat pills', () => {
    const onSelectFilter = jest.fn();
    const {getByLabelText} = render(
      <ManageCategoriesOverview
        expenseCount={8}
        incomeCount={4}
        investmentCount={3}
        activeFilter="all"
        onSelectFilter={onSelectFilter}
      />,
    );

    fireEvent.press(getByLabelText('Filter by expense categories (8)'));
    expect(onSelectFilter).toHaveBeenCalledWith('expense');

    fireEvent.press(getByLabelText('Filter by income categories (4)'));
    expect(onSelectFilter).toHaveBeenCalledWith('income');

    fireEvent.press(getByLabelText('Filter by investment categories (3)'));
    expect(onSelectFilter).toHaveBeenCalledWith('investment');
  });

  it('keeps edit and delete as explicit category-specific actions and allows tapping row to edit', () => {
    const category: Category = {
      id: 'category-groceries',
      name: 'Groceries',
      icon: 'cart-outline',
      color: '#16a34a',
      type: 'expense',
    };
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    const {getByLabelText} = render(
      <CategoryItem category={category} isMandatory={false} onEdit={onEdit} onDelete={onDelete} />,
    );

    fireEvent.press(getByLabelText('Edit Groceries category'));
    fireEvent.press(getByLabelText('Delete Groceries category'));

    expect(onEdit).toHaveBeenCalledWith(category);
    expect(onDelete).toHaveBeenCalledWith(category.id);
  });

  it('replaces destructive controls with a protected label for built-in categories', () => {
    const category: Category = {
      id: 'category-salary',
      name: 'Salary',
      icon: 'cash-outline',
      color: '#16a34a',
      type: 'income',
      isSystem: true,
    };
    const {getByLabelText, getByText, queryByLabelText} = render(
      <CategoryItem category={category} isMandatory onEdit={jest.fn()} onDelete={jest.fn()} />,
    );

    expect(getByLabelText('Salary is protected')).toBeTruthy();
    expect(getByText('Income category • Built-in')).toBeTruthy();
    expect(queryByLabelText('Edit Salary category')).toBeNull();
    expect(queryByLabelText('Delete Salary category')).toBeNull();
  });
});
