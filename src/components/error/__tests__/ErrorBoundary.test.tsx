import React from 'react';
import { render, screen, fireEvent } from '../../../utils/testUtils';
import { ErrorBoundary } from '../ErrorBoundary';
import { mockConsoleError } from '../../../utils/testHelpers';

// Mock console.error to avoid test output noise
mockConsoleError();

const ThrowError = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Normal render</div>;
};

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders error UI when child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    const fallback = <div>Custom error message</div>;
    render(
      <ErrorBoundary fallback={fallback}>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('calls onError when error occurs', () => {
    const onError = jest.fn();
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(Object)
    );
  });

  it('resets error state when retry button is clicked', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    // Verify error state
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Click retry and update component to not throw
    fireEvent.click(screen.getByText('Try again'));
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    // Verify normal render
    expect(screen.getByText('Normal render')).toBeInTheDocument();
  });

  it('shows loading state during retry', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByText('Try again'));
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
