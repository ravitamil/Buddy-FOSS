import React from 'react';
import {render} from '@testing-library/react-native';
import {useKeepAwake} from 'expo-keep-awake';

import {APP_KEEP_AWAKE_TAG, AppKeepAwake} from './AppKeepAwake';

jest.mock('expo-keep-awake', () => ({
  useKeepAwake: jest.fn(),
}));

const mockUseKeepAwake = jest.mocked(useKeepAwake);

describe('AppKeepAwake', () => {
  beforeEach(() => {
    mockUseKeepAwake.mockClear();
  });

  it('keeps the display awake while the app shell is mounted', () => {
    render(<AppKeepAwake />);

    expect(mockUseKeepAwake).toHaveBeenCalledWith(APP_KEEP_AWAKE_TAG);
  });
});
