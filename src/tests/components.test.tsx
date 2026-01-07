/**
 * Example Component Test
 * Demonstrates testing patterns
 */

import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen, userEvent } from './utils';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Loading } from '../components/Loading';

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    renderWithProviders(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders error UI when an error is thrown', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderWithProviders(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});

describe('Loading', () => {
  it('renders loading spinner', () => {
    const { container } = renderWithProviders(<Loading />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    renderWithProviders(<Loading message="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('renders fullscreen when specified', () => {
    const { container } = renderWithProviders(<Loading fullScreen />);
    expect(container.firstChild).toHaveClass('fixed');
  });
});
