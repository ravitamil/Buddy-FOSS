import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import type {AddEditSubscriptionScreenState} from '../../hooks/useAddEditSubscriptionScreen';

export type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export interface AddEditSubscriptionSectionsProps {
  screen: AddEditSubscriptionScreenState;
  isDarkMode: boolean;
}
