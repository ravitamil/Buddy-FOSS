import React from 'react';
import {useRouter} from 'expo-router';
import {Badge} from '@ravitamil/buddy-ui';
import {useMembership} from '../../context/MembershipContext';

export const ProBadge = () => {
  const {isPro} = useMembership();
  const router = useRouter();

  if (!isPro) return null;

  return <Badge label="PRO" tone="warning" onPress={() => router.push('/plan-comparison')} />;
};
