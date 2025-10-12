import React, { Component, ErrorInfo, ReactNode } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isLoading: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    isLoading: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      isLoading: false
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo);
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleRetry = async () => {
    this.setState({ isLoading: true });
    try {
      // Wait for any pending operations to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.setState({
        hasError: false,
        error: null,
        isLoading: false
      });
    } catch (error) {
      this.setState({
        hasError: true,
        error: error as Error,
        isLoading: false
      });
    }
  };

  public render() {
    const { hasError, error, isLoading } = this.state;

    if (isLoading) {
      return (
        <div className="min-h-[200px] flex items-center justify-center">
          <LoadingSpinner size="large" />
        </div>
      );
    }

    if (hasError) {
      return this.props.fallback || (
        <div className="min-h-[200px] p-4 bg-white rounded-lg shadow-sm">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
