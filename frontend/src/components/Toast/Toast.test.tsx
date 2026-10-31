import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
import { ToastProvider, useToast } from './ToastContext';

function TestComponent() {
  const { showToast, dismissToast, toasts } = useToast();
  return (
    <div>
      <button onClick={() => showToast('Success message', 'success')}>Trigger Success</button>
      <button onClick={() => showToast('Error message', 'error')}>Trigger Error</button>
      <button onClick={() => showToast('Info message', 'info')}>Trigger Info</button>
      <button onClick={() => showToast('Custom duration', 'success', 2000)}>Trigger Short</button>
      {toasts[0] && (
        <button onClick={() => dismissToast(toasts[0].id)}>Dismiss First</button>
      )}
    </div>
  );
}

describe('Toast System', () => {
  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('renders a success toast with role="status" and container with aria-live="polite"', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const triggerBtn = screen.getByText('Trigger Success');
    fireEvent.click(triggerBtn);

    const toastElement = screen.getByRole('status');
    expect(toastElement).toBeInTheDocument();
    expect(toastElement).toHaveTextContent('Success message');

    const liveContainer = toastElement.parentElement;
    expect(liveContainer).toHaveAttribute('aria-live', 'polite');
  });

  it('renders an error toast with role="alert"', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const triggerBtn = screen.getByText('Trigger Error');
    fireEvent.click(triggerBtn);

    const errorToast = screen.getByRole('alert');
    expect(errorToast).toBeInTheDocument();
    expect(errorToast).toHaveTextContent('Error message');
  });

  it('auto-dismisses toasts after 4000ms using vi.useFakeTimers and advanceTimersByTimeAsync', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const triggerBtn = screen.getByText('Trigger Success');
    fireEvent.click(triggerBtn);

    expect(screen.getByText('Success message')).toBeInTheDocument();

    // Advance 3800ms: still in document
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3800);
    });
    expect(screen.getByText('Success message')).toBeInTheDocument();

    // Advance past 4000ms: auto-dismisses
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
  });

  it('limits active toasts to a maximum of 3, evicting the oldest', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const successBtn = screen.getByText('Trigger Success');
    const errorBtn = screen.getByText('Trigger Error');
    const infoBtn = screen.getByText('Trigger Info');

    fireEvent.click(successBtn); // Toast 1
    fireEvent.click(errorBtn);   // Toast 2
    fireEvent.click(infoBtn);    // Toast 3

    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.getByText('Info message')).toBeInTheDocument();

    // Trigger 4th toast
    const shortBtn = screen.getByText('Trigger Short');
    fireEvent.click(shortBtn);   // Toast 4

    // Toast 1 (oldest) must have been evicted
    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    // Toasts 2, 3, and 4 must remain
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.getByText('Info message')).toBeInTheDocument();
    expect(screen.getByText('Custom duration')).toBeInTheDocument();
  });

  it('manually dismisses a toast when the close button is clicked', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Trigger Success'));
    expect(screen.getByText('Success message')).toBeInTheDocument();

    const closeBtn = screen.getByLabelText('Close notification');
    fireEvent.click(closeBtn);

    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
  });
});
