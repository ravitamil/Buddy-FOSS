/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree and displays a
 * Fluid Surface fallback UI using SystemErrorScreen.
 */

import React from 'react';
import {logger as appLogger} from '../services/LoggerService';
import {categorizeBoundaryError} from './errorBoundaryUtils';
import {SystemErrorScreen} from '../screenModules/SystemErrorScreen';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{error?: Error; retry: () => void}>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {hasError: true, error};
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const componentLogger = appLogger.component('ErrorBoundary');
    componentLogger.error('Error Boundary caught error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorType: categorizeBoundaryError(error),
    });

    this.setState({error, errorInfo});

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  retry = () => {
    this.setState({hasError: false, error: undefined, errorInfo: undefined});
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} retry={this.retry} />;
      }

      return <SystemErrorScreen error={this.state.error} retry={this.retry} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
