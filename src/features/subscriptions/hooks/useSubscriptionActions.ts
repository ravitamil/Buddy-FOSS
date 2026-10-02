import {useCallback} from 'react';
import type {Dispatch, SetStateAction} from 'react';
import {Linking, Share} from 'react-native';
import {router} from 'expo-router';

import type {SubscriptionContextType} from '../context/subscriptionContextTypes';
import {useFeatureActionGuard} from '@/features/featureControls';
import {logger as appLogger} from '@/services/LoggerService';
import type {SubscriptionData} from '@/types/finance.types';
import {
  buildShareContent,
  createResumeSubscriptionActions,
  normalizeWebsiteUrl,
} from './subscriptionDetailUtils';

const logger = appLogger.contextLogger('SubscriptionDetailScreen');

interface AlertAction {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

type ShowAlert = (config: {title: string; message: string; actions?: AlertAction[]}) => void;

type SubscriptionOperations = Pick<
  SubscriptionContextType,
  'deleteSubscription' | 'pauseSubscription' | 'resumeSubscription'
>;

interface UseSubscriptionActionsOptions extends SubscriptionOperations {
  subscriptionId: string;
  subscription: SubscriptionData | null;
  currency: string;
  setSubscription: Dispatch<SetStateAction<SubscriptionData | null>>;
  showAlert: ShowAlert;
}

export function useSubscriptionActions({
  subscriptionId,
  subscription,
  currency,
  setSubscription,
  showAlert,
  deleteSubscription,
  pauseSubscription,
  resumeSubscription,
}: UseSubscriptionActionsOptions) {
  const updateAccess = useFeatureActionGuard('subscriptions.update');
  const handlePauseResume = useCallback(() => {
    if (!subscription) return;

    void (async () => {
      try {
        updateAccess.assertAllowed();
        if (subscription.status === 'active') {
          const paused = await pauseSubscription(subscriptionId);
          setSubscription(paused);
          showAlert({
            title: 'Success',
            message: 'Subscription paused successfully!',
            actions: [{text: 'OK', style: 'default'}],
          });
          return;
        }

        showAlert({
          title: 'Resume Subscription',
          message: 'When should the next billing occur?',
          actions: createResumeSubscriptionActions({
            resumeSubscription,
            setSubscription,
            showAlert,
            subscriptionId,
          }),
        });
      } catch (error) {
        logger.error('Error updating subscription status', error, {
          subscriptionId,
          currentStatus: subscription.status,
        });
        showAlert({
          title: 'Error',
          message: 'Failed to update subscription status. Please try again.',
          actions: [{text: 'OK'}],
        });
      }
    })();
  }, [
    pauseSubscription,
    resumeSubscription,
    setSubscription,
    showAlert,
    subscription,
    subscriptionId,
    updateAccess,
  ]);

  const deleteAccess = useFeatureActionGuard('subscriptions.delete');
  const handleDeleteSubscription = useCallback(() => {
    showAlert({
      title: 'Delete Subscription',
      message: 'Are you sure you want to delete this subscription? This action cannot be undone.',
      actions: [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                deleteAccess.assertAllowed();
                await deleteSubscription(subscriptionId);
                showAlert({
                  title: 'Success',
                  message: 'Subscription deleted successfully!',
                  actions: [{text: 'OK', style: 'default'}],
                });
                router.back();
              } catch (error) {
                logger.error('Error deleting subscription', error, {subscriptionId});
                showAlert({
                  title: 'Error',
                  message: 'Failed to delete subscription. Please try again.',
                  actions: [{text: 'OK'}],
                });
              }
            })();
          },
        },
      ],
    });
  }, [deleteAccess, deleteSubscription, showAlert, subscriptionId]);

  const handleShare = useCallback(() => {
    if (!subscription) return;

    void (async () => {
      try {
        await Share.share({
          message: buildShareContent(subscription, currency),
          title: `${subscription.name} Subscription Details`,
        });
      } catch (error) {
        logger.error('Error sharing', error, {subscriptionId});
      }
    })();
  }, [currency, subscription, subscriptionId]);

  const handleWebsitePress = useCallback(() => {
    if (!subscription?.website) return;
    void Linking.openURL(normalizeWebsiteUrl(subscription.website));
  }, [subscription?.website]);

  return {
    handlePauseResume,
    handleDeleteSubscription,
    handleShare,
    handleWebsitePress,
  };
}
