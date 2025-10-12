import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ExclamationTriangleIcon, XCircleIcon, WifiIcon } from '@heroicons/react/24/outline';
import { AuthorizationError, NetworkError, ErrorType } from '../../types/errors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorType: ErrorType;
  isRetrying: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorType: 'unknown',
    isRetrying: false
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    let errorType: ErrorType = 'unknown';
    
    if (error instanceof AuthorizationError) {
      errorType = 'authorization';
    } else if (error instanceof NetworkError) {
      errorType = 'network';
    }

    return {
      hasError: true,
      error,
      errorType
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo);
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleRetry = async () => {
    this.setState({ isRetrying: true });
    try {
      await this.props.onRetry?.();
      this.setState({
        hasError: false,
        error: null,
        errorType: 'unknown',
        isRetrying: false
      });
    } catch (error) {
      this.setState({
        error: error as Error,
        isRetrying: false
      });
    }
  };

  private getErrorIcon = () => {
    switch (this.state.errorType) {
      case 'authorization':
        return <XCircleIcon className="h-12 w-12 text-red-400" />;
      case 'network':
        return <WifiIcon className="h-12 w-12 text-yellow-400" />;
      default:
        return <ExclamationTriangleIcon className="h-12 w-12 text-yellow-400" />;
    }
  };

  private getErrorMessage = () => {
    switch (this.state.errorType) {
      case 'authorization':
        return 'You do not have permission to access this resource';
      case 'network':
        return 'Failed to connect to the server. Please check your internet connection.';
      default:
        return this.state.error?.message || 'An unexpected error occurred';
    }
  };

  public render() {
    const { hasError, isRetrying } = this.state;

    if (hasError) {
      return this.props.fallback || (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-4">
          <div className="text-center">
            {this.getErrorIcon()}
            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              {this.state.errorType === 'authorization' ? 'Access Denied' : 'Something went wrong'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {this.getErrorMessage()}
            </p>
            {this.props.onRetry && (
              <button
                onClick={this.handleRetry}
                disabled={isRetrying}
                className={`
                  mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium 
                  rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {isRetrying ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Retrying...
                  </>
                ) : (
                  'Try again'
                )}
              </button>
            )}
            {this.state.errorType === 'authorization' && (
              <button
                onClick={() => window.history.back()}
                className="mt-4 ml-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Go back
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}