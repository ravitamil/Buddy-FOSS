import React from 'react';
import {FloatingAction, type FloatingActionProps, type SpeedDialAction} from '@ravitamil/buddy-ui';

export type {SpeedDialAction};

export type SpeedDialFABProps = FloatingActionProps;

export const SpeedDialFAB: React.FC<SpeedDialFABProps> = (props) => {
  return <FloatingAction presentation="circular" {...props} />;
};

SpeedDialFAB.displayName = 'SpeedDialFAB';
