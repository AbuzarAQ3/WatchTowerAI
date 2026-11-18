import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

export interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, variant?: ToastVariant, duration?: number) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismissToast = useCallback((id: string) => {
    const existingTimer = timersRef.current.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'success', duration = 4000): string => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newToast: Toast = { id, message, variant, duration };

      setToasts((prev) => {
        // Enforce max 3 toasts: evict oldest if already at 3
        const trimmed = prev.length >= 3 ? prev.slice(prev.length - 2) : prev;
        return [...trimmed, newToast];
      });

      if (duration > 0) {
        const timer = setTimeout(() => {
          dismissToast(id);
        }, duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [dismissToast]
  );

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      {/* Fixed Toast Container — zero layout shift */}
      <div
        aria-live="polite"
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '380px',
          width: 'calc(100vw - 48px)',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => {
          const isError = toast.variant === 'error';
          const isSuccess = toast.variant === 'success';

          const borderColor = isError
            ? 'var(--clr-danger, #ef4444)'
            : isSuccess
            ? 'var(--clr-success, #10b981)'
            : 'var(--clr-amber, #f59e0b)';

          const iconColor = borderColor;

          return (
            <div
              key={toast.id}
              role={isError ? 'alert' : 'status'}
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '12px 14px',
                background: 'var(--clr-bg-card, #111827)',
                color: 'var(--clr-text-primary, #e2e8f0)',
                border: `1px solid ${borderColor}`,
                borderRadius: '6px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
                fontFamily: 'var(--font-sans, system-ui, sans-serif)',
                fontSize: '13px',
                lineHeight: '1.4',
                animation: 'toastFadeIn 0.2s ease-out',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                {isError ? (
                  <AlertCircle size={18} style={{ color: iconColor, flexShrink: 0 }} />
                ) : isSuccess ? (
                  <CheckCircle size={18} style={{ color: iconColor, flexShrink: 0 }} />
                ) : (
                  <Info size={18} style={{ color: iconColor, flexShrink: 0 }} />
                )}
                <span style={{ wordBreak: 'break-word' }}>{toast.message}</span>
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Close notification"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--clr-text-secondary, #94a3b8)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  flexShrink: 0,
                }}
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Hook to access the toast notification system.
 * Returns safe no-op fallbacks if used outside ToastProvider to prevent test crashes.
 */
export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toasts: [],
      showToast: () => '',
      dismissToast: () => {},
    };
  }
  return context;
}
