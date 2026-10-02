/**
 * Offline Mutation Queue Service
 *
 * Persists pending mutations to MMKV and replays them on reconnect.
 * Mutations survive app restart via disk persistence.
 */

import {MMKVLoader} from 'react-native-mmkv-storage';
import NetInfo from '@react-native-community/netinfo';

const QUEUE_KEY = 'offline_mutation_queue';

interface QueuedMutation {
  id: string;
  mutationKey: readonly unknown[];
  variables: unknown;
  meta?: Record<string, unknown>;
  createdAt: number;
}

/**
 * Offline mutation queue that persists mutations to disk and replays on reconnect.
 * TanStack Query v5 pauses mutations when offline but doesn't persist them.
 * This queue bridges that gap - mutations survive app restart.
 */
export class OfflineMutationQueue {
  private storage;
  private netInfoUnsubscribe: (() => void) | null = null;

  constructor() {
    this.storage = new MMKVLoader().withInstanceID('offline-mutations').initialize();
  }

  private getQueue(): QueuedMutation[] {
    const queue = this.storage.getArray(QUEUE_KEY);
    return Array.isArray(queue) ? (queue as QueuedMutation[]) : [];
  }

  /**
   * Add a mutation to the offline queue
   */
  async enqueue(descriptor: {
    mutationKey: readonly unknown[];
    variables: unknown;
    meta?: Record<string, unknown>;
  }): Promise<void> {
    await Promise.resolve();
    const queue = this.getQueue();
    queue.push({
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      mutationKey: descriptor.mutationKey,
      variables: descriptor.variables,
      meta: descriptor.meta,
      createdAt: Date.now(),
    });
    this.storage.setArray(QUEUE_KEY, queue);
  }

  /**
   * Remove a completed mutation from the queue
   */
  async dequeue(id: string): Promise<void> {
    await Promise.resolve();
    const queue = this.getQueue();
    this.storage.setArray(
      QUEUE_KEY,
      queue.filter((item) => item.id !== id),
    );
  }

  /**
   * Get all pending mutations
   */
  async getPending(): Promise<QueuedMutation[]> {
    await Promise.resolve();
    return this.getQueue();
  }

  /**
   * Clear the queue
   */
  async clear(): Promise<void> {
    await Promise.resolve();
    this.storage.removeItem(QUEUE_KEY);
  }

  /**
   * Listen for connectivity and replay mutations
   * Returns cleanup function
   */
  listenAndReplay(replayFn: () => Promise<void>): () => void {
    this.netInfoUnsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        void replayFn();
      }
    });
    return () => {
      this.netInfoUnsubscribe?.();
    };
  }
}

export const offlineMutationQueue = new OfflineMutationQueue();
