/**
 * Context Foundation Types
 *
 * This file contains standardized interfaces and types for the new context architecture.
 * These types provide consistent patterns for CRUD operations, error handling, and state management.
 */

import React from 'react';
import {logger as appLogger} from '@/services/LoggerService';
import {ContextError, ErrorSeverity, withErrorHandling} from './context-errors';
import {generateEntityId} from './entity-id';
import {createContextReducer} from './context-reducer';
import {syncWithRemote} from './context-sync';
import type {CRUDServices, EntityValidator} from './context-crud.types';
import type {BaseEntity, ContextAction, ContextState, CRUDOperations} from './context-core.types';
export type {AuthContextType, User, UserProfile} from './auth-context.types';
export {AuthMethod} from './auth-context.types';
export type {CategorySyncResult} from './category-sync.types';
export {ContextError, ErrorSeverity, withErrorHandling} from './context-errors';
export {createContextReducer} from './context-reducer';
export {generateEntityId} from './entity-id';
export type {CRUDServices, EntityValidator} from './context-crud.types';
export type {SyncAuthService, SyncOptions} from './context-sync';
export {syncWithRemote} from './context-sync';
export type {BaseEntity, ContextAction, ContextState, CRUDOperations} from './context-core.types';
export {
  createDeepMemoizedValue,
  createMemoizedContextValue,
  createStableCallback,
} from './react-context-memo';

const logger = appLogger.contextLogger('ContextFoundation');

// ============================================================================
// CRUD Operations Factory
// ============================================================================

/**
 * Factory for creating CRUD operation builders
 */
class CRUDOperationsFactory<T extends BaseEntity> {
  constructor(
    private state: ContextState<T>,
    private dispatch: React.Dispatch<ContextAction<T>>,
    private context: string,
    private services: CRUDServices<T>,
    private validator?: EntityValidator<T>,
  ) {}

  /**
   * Validates an entity and throws an error if validation fails
   */
  private validateEntity = (item: Partial<T>, operation: string): void => {
    if (this.validator) {
      const errors = this.validator(item);
      if (errors && errors.length > 0) {
        throw new ContextError(
          `Validation failed for ${operation}: ${errors.join(', ')}`,
          `${this.context.toUpperCase()}_VALIDATION_ERROR`,
          this.context,
        );
      }
    }
  };

  /**
   * Creates optimistic update handler with rollback capability
   */
  private createOptimisticHandler = <TPayload>(
    optimisticAction: ContextAction<T>,
    rollbackAction: ContextAction<T>,
    operation: () => Promise<void>,
  ) => {
    return async (): Promise<void> => {
      this.dispatch(optimisticAction);
      try {
        await operation();
      } catch (error) {
        this.dispatch(rollbackAction);
        throw error;
      }
    };
  };

  /**
   * Builds the complete CRUD operations interface
   */
  build(): CRUDOperations<T> {
    return {
      items: this.state.items,
      getById: this.createGetById(),
      add: this.createAdd(),
      update: this.createUpdate(),
      delete: this.createDelete(),
      addMany: this.createAddMany(),
      deleteMany: this.createDeleteMany(),
      isLoading: this.state.isLoading,
      error: this.state.error,
    };
  }

  private createGetById = (): ((id: string) => T | null) => {
    return (id: string) => this.state.items.find((item) => item.id === id) || null;
  };
  private createAdd = (): ((item: Omit<T, 'id'>) => Promise<T>) => {
    return async (item: Omit<T, 'id'>): Promise<T> => {
      return withErrorHandling(
        async () => {
          this.validateEntity(item as Partial<T>, 'add');

          const newItem: T = {
            ...item,
            id: generateEntityId(),
            createdAt: new Date(),
            updatedAt: new Date(),
          } as T;

          const optimisticAdd = {type: 'ADD_ITEM' as const, payload: newItem};
          const rollbackAdd = {type: 'DELETE_ITEM' as const, payload: newItem.id};

          const operation = async () => {
            const updatedItems = [...this.state.items, newItem];
            await this.services.storageService.save(updatedItems);

            if (this.services.remoteService) {
              try {
                await syncWithRemote(
                  updatedItems,
                  this.services.remoteService.sync,
                  this.context || 'ContextFoundation',
                  {skipIfAnonymous: true, retryOnFailure: false},
                  this.services.authService,
                );
              } catch (remoteError) {
                // Log error and RE-THROW to trigger rollback
                // This prevents "ghost" items that exist locally but failed to start sync
                logger.error('Remote sync failed during operation, rolling back', {
                  context: this.context || 'ContextFoundation',
                  error: remoteError,
                });
                throw remoteError;
              }
            }
          };

          await this.createOptimisticHandler(optimisticAdd, rollbackAdd, operation)();
          return newItem;
        },
        this.context || 'ContextFoundation',
        'add',
        {
          maxRetries: 1,
          retryDelay: 500,
          severity: ErrorSeverity.MEDIUM,
        },
      );
    };
  };

  private createUpdate = (): ((id: string, updates: Partial<T>) => Promise<void>) => {
    return async (id: string, updates: Partial<T>): Promise<void> => {
      return withErrorHandling(
        async () => {
          const originalItem = this.state.items.find((item) => item.id === id);
          if (!originalItem) {
            throw new Error(`Item with id ${id} not found`);
          }

          this.validateEntity(updates, 'update');

          const updatesWithTimestamp = {
            ...updates,
            updatedAt: new Date(),
          };

          const optimisticUpdate = {
            type: 'UPDATE_ITEM' as const,
            payload: {id, updates: updatesWithTimestamp},
          };
          const rollbackUpdate = {
            type: 'UPDATE_ITEM' as const,
            payload: {id, updates: originalItem},
          };

          const operation = async () => {
            const updatedItems = this.state.items.map((item) =>
              item.id === id ? {...item, ...updatesWithTimestamp} : item,
            );

            await this.services.storageService.save(updatedItems);

            if (this.services.remoteService) {
              try {
                await syncWithRemote(
                  updatedItems,
                  this.services.remoteService.sync,
                  this.context || 'ContextFoundation',
                  {skipIfAnonymous: true, retryOnFailure: false},
                  this.services.authService,
                );
              } catch (remoteError) {
                // Log error and RE-THROW to trigger rollback
                logger.error('Remote sync failed during update, rolling back', {
                  context: this.context || 'ContextFoundation',
                  error: remoteError,
                  itemId: id,
                });
                throw remoteError;
              }
            }
          };

          await this.createOptimisticHandler(optimisticUpdate, rollbackUpdate, operation)();
        },
        this.context || 'ContextFoundation',
        'update',
        {
          maxRetries: 1,
          retryDelay: 500,
          severity: ErrorSeverity.MEDIUM,
        },
      );
    };
  };

  private createDelete = (): ((id: string) => Promise<void>) => {
    return async (id: string): Promise<void> => {
      return withErrorHandling(
        async () => {
          const itemToDelete = this.state.items.find((item) => item.id === id);
          if (!itemToDelete) {
            throw new Error(`Item with id ${id} not found`);
          }

          const optimisticDelete = {type: 'DELETE_ITEM' as const, payload: id};
          const rollbackDelete = {type: 'ADD_ITEM' as const, payload: itemToDelete};

          const operation = async () => {
            const updatedItems = this.state.items.filter((item) => item.id !== id);
            await this.services.storageService.save(updatedItems);

            if (this.services.remoteService) {
              try {
                // Use specific delete method if available, otherwise fall back to sync
                if (this.services.remoteService.delete) {
                  await this.services.remoteService.delete(id);
                  logger.info('Successfully deleted item from remote storage', {
                    context: this.context || 'ContextFoundation',
                    itemId: id,
                  });
                } else {
                  await syncWithRemote(
                    updatedItems,
                    this.services.remoteService.sync,
                    this.context || 'ContextFoundation',
                    {skipIfAnonymous: true, retryOnFailure: false},
                    this.services.authService,
                  );
                }
              } catch (remoteError) {
                // Log error and RE-THROW to trigger rollback
                logger.error('Remote sync failed during delete, rolling back', {
                  context: this.context || 'ContextFoundation',
                  error: remoteError,
                  itemId: id,
                });
                throw remoteError;
              }
            }
          };

          await this.createOptimisticHandler(optimisticDelete, rollbackDelete, operation)();
        },
        this.context || 'ContextFoundation',
        'delete',
        {
          maxRetries: 1,
          retryDelay: 500,
          severity: ErrorSeverity.MEDIUM,
        },
      );
    };
  };

  private createAddMany = (): ((items: Omit<T, 'id'>[]) => Promise<T[]>) => {
    return async (items: Omit<T, 'id'>[]): Promise<T[]> => {
      return withErrorHandling(
        async () => {
          const newItems: T[] = items.map(
            (item) =>
              ({
                ...item,
                id: generateEntityId(),
                createdAt: new Date(),
                updatedAt: new Date(),
              }) as T,
          );

          this.dispatch({type: 'ADD_MANY_ITEMS', payload: newItems});

          const updatedItems = [...this.state.items, ...newItems];
          await this.services.storageService.save(updatedItems);

          if (this.services.remoteService) {
            try {
              await syncWithRemote(
                updatedItems,
                this.services.remoteService.sync,
                this.context || 'ContextFoundation',
                {skipIfAnonymous: true, retryOnFailure: false},
                this.services.authService,
              );
            } catch (remoteError) {
              // Log error and RE-THROW to trigger rollback
              logger.error('Remote sync failed during addMany, rolling back', {
                context: this.context || 'ContextFoundation',
                error: remoteError,
                itemCount: newItems.length,
              });
              throw remoteError;
            }
          }

          return newItems;
        },
        this.context || 'ContextFoundation',
        'addMany',
        {
          maxRetries: 1,
          retryDelay: 500,
          severity: ErrorSeverity.MEDIUM,
        },
      );
    };
  };

  private createDeleteMany = (): ((ids: string[]) => Promise<void>) => {
    return async (ids: string[]): Promise<void> => {
      return withErrorHandling(
        async () => {
          this.dispatch({type: 'DELETE_MANY_ITEMS', payload: ids});

          const updatedItems = this.state.items.filter((item) => !ids.includes(item.id));
          await this.services.storageService.save(updatedItems);

          if (this.services.remoteService) {
            try {
              await syncWithRemote(
                updatedItems,
                this.services.remoteService.sync,
                this.context || 'ContextFoundation',
                {skipIfAnonymous: true, retryOnFailure: false},
                this.services.authService,
              );
            } catch (remoteError) {
              // Log error and RE-THROW to trigger rollback
              logger.error('Remote sync failed during deleteMany, rolling back', {
                context: this.context || 'ContextFoundation',
                error: remoteError,
                itemCount: ids.length,
              });
              throw remoteError;
            }
          }
        },
        this.context || 'ContextFoundation',
        'deleteMany',
        {
          maxRetries: 1,
          retryDelay: 500,
          severity: ErrorSeverity.MEDIUM,
        },
      );
    };
  };
}

/**
 * Creates a complete set of CRUD operations for a given entity type
 *
 * @param state - Current context state
 * @param dispatch - State dispatch function
 * @param context - Context name for logging and error handling
 * @param services - Required services (storage, firestore, auth)
 * @param validator - Optional validation function
 * @returns Complete CRUD operations interface
 */
export const createCRUDOperations = <T extends BaseEntity>(
  state: ContextState<T>,
  dispatch: React.Dispatch<ContextAction<T>>,
  context: string,
  services: CRUDServices<T>,
  validator?: EntityValidator<T>,
): CRUDOperations<T> => {
  const factory = new CRUDOperationsFactory(state, dispatch, context, services, validator);
  return factory.build();
};

// ============================================================================
// Performance Optimization Utilities
// ============================================================================

/**
 * Creates a memoized context value with proper dependency tracking
 * This is a helper to ensure consistent memoization patterns across contexts
 *
 * ⚠️ WARNING: This function calls React.useMemo internally.
 * Do NOT use this function inside useMemo, useCallback, or other callback contexts as it violates React Hooks rules.
 * Only use this function at the top level of your React components or custom hooks.
 *
 * @param factory - Function that creates the context value
 * @param dependencies - Dependencies for memoization
 * @returns Memoized context value
 */
/**
 * Creates a stable callback with proper dependency tracking
 * Prevents unnecessary re-renders in child components
 *
 * ⚠️ WARNING: This function calls React.useCallback internally.
 * Do NOT use this function inside useMemo or other callback contexts as it violates React Hooks rules.
 * Only use this function at the top level of your React components or custom hooks.
 *
 * @param callback - Function to memoize
 * @param dependencies - Dependencies for memoization
 * @returns Memoized callback
 */
/**
 * Creates a deep comparison memoized value
 * Useful for complex objects that might have the same content but different references
 *
 * @param factory - Function that creates the value
 * @param dependencies - Dependencies for memoization
 * @returns Deeply memoized value
 */
