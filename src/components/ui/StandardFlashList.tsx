import React, {memo} from 'react';
import {FlashList, FlashListProps} from '@shopify/flash-list';

interface StandardFlashListProps<T> extends FlashListProps<T> {
  onRefresh?: () => void;
  refreshing?: boolean;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
  emptyStateComponent?: React.ComponentType;
  loadingComponent?: React.ComponentType;
  errorComponent?: React.ComponentType<{error: Error; retry: () => void}>;
  loading?: boolean;
  error?: Error;
  onRetry?: () => void;
}

/**
 * StandardFlashList Component
 *
 * A standardized FlashList implementation with consistent styling and behavior
 * across the application.
 *
 * Features:
 * - Consistent styling with padding and scroll behavior
 * - Built-in pull-to-refresh support
 * - Proper empty state handling
 * - Loading and error state support
 * - Accessibility support
 * - Performance optimizations
 * - Enhanced error boundaries integration
 *
 * Note: FlashList v2.0 no longer requires estimatedItemSize - it auto-calculates sizing.
 */
function StandardFlashList<T>(props: StandardFlashListProps<T>) {
  const {
    data,
    renderItem,
    keyExtractor,
    onRefresh,
    refreshing,
    onEndReached,
    onEndReachedThreshold = 0.5,
    ListEmptyComponent,
    ListHeaderComponent,
    ListFooterComponent,
    emptyStateComponent: EmptyStateComponent,
    loadingComponent: LoadingComponent,
    errorComponent: ErrorComponent,
    loading,
    error,
    onRetry,
    contentContainerStyle,
    overrideProps,
    ...restProps
  } = props;

  // Handle loading state
  if (loading && LoadingComponent) {
    return <LoadingComponent />;
  }

  // Handle error state
  if (error && ErrorComponent && onRetry) {
    return <ErrorComponent error={error} retry={onRetry} />;
  }

  // Determine empty component to use
  const EmptyComponent = EmptyStateComponent || ListEmptyComponent;

  return (
    <FlashList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      removeClippedSubviews={false}
      onRefresh={onRefresh}
      refreshing={refreshing}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      ListEmptyComponent={EmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={contentContainerStyle}
      overrideProps={{
        removeClippedSubviews: false,
        ...(overrideProps || {}),
      }}
      // Accessibility props
      accessibilityRole="list"
      {...restProps}
    />
  );
}

export default memo(StandardFlashList) as <T>(
  props: StandardFlashListProps<T>,
) => React.ReactElement;
