import {subscriptionDatabaseService} from '@/services/SubscriptionDatabaseService';
import type {SubscriptionData} from './types';

export const subscriptionService = {
  getAll: (userId: string) => subscriptionDatabaseService.getSubscriptions(userId),
  saveMany: (userId: string, subscriptions: SubscriptionData[]) =>
    subscriptionDatabaseService.saveSubscriptions(userId, subscriptions),
  create: (userId: string, subscription: SubscriptionData) =>
    subscriptionDatabaseService.saveSubscriptions(userId, [subscription]),
  update: (userId: string, subscription: SubscriptionData) =>
    subscriptionDatabaseService.saveSubscriptions(userId, [subscription]),
};
