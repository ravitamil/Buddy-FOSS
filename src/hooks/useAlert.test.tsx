import React from 'react';
import {renderHook, act} from '@testing-library/react-native';
import {AlertProvider, useAlert} from './useAlert';

describe('useAlert', () => {
  const wrapper = ({children}: {children: React.ReactNode}) => (
    <AlertProvider>{children}</AlertProvider>
  );

  it('calls onDismiss when hideAlert is invoked', () => {
    const onDismiss = jest.fn();
    const {result} = renderHook(() => useAlert(), {wrapper});

    act(() => {
      result.current.showAlert({
        title: 'Notice',
        message: 'Something happened',
        onDismiss,
      });
    });

    act(() => {
      result.current.hideAlert();
    });

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('calls single action onPress on dismiss when no onDismiss is explicitly provided', () => {
    const singleActionPress = jest.fn();
    const {result} = renderHook(() => useAlert(), {wrapper});

    act(() => {
      result.current.showAlert({
        title: 'Success',
        message: 'Saved successfully',
        actions: [{text: 'OK', onPress: singleActionPress}],
      });
    });

    act(() => {
      result.current.hideAlert();
    });

    expect(singleActionPress).toHaveBeenCalledTimes(1);
  });

  it('does not auto-call action onPress on dismiss if there are multiple actions', () => {
    const confirmPress = jest.fn();
    const cancelPress = jest.fn();
    const {result} = renderHook(() => useAlert(), {wrapper});

    act(() => {
      result.current.showAlert({
        title: 'Confirm',
        message: 'Are you sure?',
        actions: [
          {text: 'Cancel', style: 'cancel', onPress: cancelPress},
          {text: 'Confirm', style: 'destructive', onPress: confirmPress},
        ],
      });
    });

    act(() => {
      result.current.hideAlert();
    });

    expect(confirmPress).not.toHaveBeenCalled();
    expect(cancelPress).not.toHaveBeenCalled();
  });
});
