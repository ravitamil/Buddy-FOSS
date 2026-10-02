import React from 'react';
import {render} from '@testing-library/react-native';
import {Card} from '@ravitamil/buddy-ui/Card';

describe('package Card', () => {
  it('keeps the public elevation level separate from the native elevation style prop', () => {
    const {getByTestId} = render(
      <Card testID="shared-card" elevation={2}>
        Content
      </Card>,
    );

    const frame = getByTestId('shared-card');
    expect(frame.props.elevation).toBeUndefined();
    expect(frame.props.elevationLevel).toBe(2);
  });
});
