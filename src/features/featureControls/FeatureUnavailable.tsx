import React from 'react';
import {FeatureUnavailableScreen} from '@/screenModules/FeatureUnavailableScreen';
import type {FeatureStatus} from './types';

interface FeatureUnavailableProps {
  title?: string;
  message?: string;
  status: FeatureStatus;
}

export function FeatureUnavailable({title, message, status}: FeatureUnavailableProps) {
  return (
    <FeatureUnavailableScreen
      title={title}
      message={message}
      status={status}
      showThemeSwitch={true}
    />
  );
}

export default FeatureUnavailable;
