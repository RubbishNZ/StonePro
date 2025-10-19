'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from 'lucide-react';

import { cn } from '@/lib/utils';

type ToastVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

type ToastAction = {
  label: string;
  onClick: () => void;
  altText?: string;
};

export type ToastOptions = {
  id?: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: ToastAction;
  onDismiss?: () => void;
};

type ToastRecord = Required<Pick<ToastOptions, 'id'>> & Omit<ToastOptions, 'id'>;

type ToastContextValue = {
  toast: (options: ToastOptions) => string;
  dismiss: (id?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 4500;

const VARIANT_STYLES: Record<ToastVariant, { container: string; icon: string; action: string; description: string }> = {
  default: {
    container:
      'border-slate-200 bg-white/95 text-slate-900 shadow-[0_20px_45px_-20px_rgba(15,23,42,0.25)]',
    icon: 'text-slate-500',
    action: 'text-slate-700 hover:text-slate-900',
    description: 'text-slate-600',
  },
  success: {
    container:
      'border-emerald-200 bg-emerald-50 text-emerald-900 shadow-[0_20px_35px_-20px_rgba(4,120,87,0.35)]',
    icon: 'text-emerald-500',
    action: 'text-emerald-700 hover:text-emerald-900',
    description: 'text-emerald-700/90',
  },
  warning: {
    container:
      'border-amber-200 bg-amber-50 text-amber-900 shadow-[0_20px_35px_-20px_rgba(217,119,6,0.35)]',
    icon: 'text-amber-500',
    action: 'text-amber-700 hover:text-amber-900',
    description: 'text-amber-700/90',
  },
  error: {
    container:
      'border-rose-200 bg-rose-50 text-rose-900 shadow-[0_20px_35px_-20px_rgba(225,29,72,0.35)]',
    icon: 'text-rose-500',
    action: 'text-rose-700 hover:text-rose-900',
    description: 'text-rose-700/90',
  },
  info: {
    container:
      'border-sky-200 bg-sky-50 text-sky-900 shadow-[0_20px_35px_-20px_rgba(14,116,144,0.35)]',
    icon: 'text-sky-500',
    action: 'text-sky-700 hover:text-sky-900',
    description: 'text-sky-700/90',
  },
};

const VARIANT_ICON: Record<ToastVariant, ComponentType<{ className?: string }>> = {
  default: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertTriangle,
  info: Info,
};

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const timeouts = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const clearTimeoutForId = useCallback((id: string) => {
    const timeoutId = timeouts.current[id];
    if (timeoutId) {
      clearTimeout(timeoutId);
      delete timeouts.current[id];
    }
  }, []);

  const dismiss = useCallback(
    (id?: string) => {
      setToasts((current) => {
        if (!id) {
          current.forEach((toast) => toast.onDismiss?.());
          return [];
        }
        const toast = current.find((item) => item.id === id);
        if (!toast) {
          return current;
        }
        toast.onDismiss?.();
        return current.filter((item) => item.id !== id);
      });

      if (id) {
        clearTimeoutForId(id);
      } else {
        Object.keys(timeouts.current).forEach((timeoutId) => {
          clearTimeout(timeouts.current[timeoutId]);
        });
        timeouts.current = {};
      }
    },
    [clearTimeoutForId]
  );

  useEffect(() => {
    return () => {
      Object.values(timeouts.current).forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      timeouts.current = {};
    };
  }, []);

  const scheduleRemoval = useCallback(
    (id: string, duration?: number) => {
      if (duration === Infinity || duration === 0) {
        clearTimeoutForId(id);
        return;
      }

      const effectiveDuration = duration ?? DEFAULT_DURATION;

      if (typeof window === 'undefined') {
        return;
      }

      clearTimeoutForId(id);
      timeouts.current[id] = window.setTimeout(() => {
        dismiss(id);
      }, effectiveDuration);
    },
    [clearTimeoutForId, dismiss]
  );

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = options.id ?? generateId();
      const variant = options.variant ?? 'default';

      setToasts((current) => {
        const withoutExisting = current.filter((item) => item.id !== id);
        return [
          ...withoutExisting,
          {
            id,
            title: options.title,
            description: options.description,
            variant,
            duration: options.duration,
            action: options.action,
            onDismiss: options.onDismiss,
          },
        ];
      });

      scheduleRemoval(id, options.duration);

      return id;
    },
    [scheduleRemoval]
  );

  const contextValue = useMemo<ToastContextValue>(
    () => ({ toast, dismiss }),
    [toast, dismiss]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

type ToastViewportProps = {
  toasts: ToastRecord[];
  onDismiss: (id: string) => void;
};

function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[110] flex flex-col items-center gap-3 px-4 pb-6 sm:items-end sm:px-6">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body
  );
}

type ToastCardProps = {
  toast: ToastRecord;
  onDismiss: (id: string) => void;
};

function ToastCard({ toast, onDismiss }: ToastCardProps) {
  const variant = toast.variant ?? 'default';
  const styles = VARIANT_STYLES[variant];
  const Icon = VARIANT_ICON[variant];

  const handleDismiss = useCallback(() => {
    onDismiss(toast.id);
  }, [onDismiss, toast.id]);

  const handleAction = useCallback(() => {
    toast.action?.onClick();
    onDismiss(toast.id);
  }, [onDismiss, toast.action, toast.id]);

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-4 text-sm shadow-lg backdrop-blur-sm transition duration-200',
        styles.container
      )}
      role="status"
      aria-live="polite"
    >
      <div className={cn('mt-0.5 flex size-9 items-center justify-center rounded-full bg-white/70', styles.icon)}>
        <Icon className="size-4" aria-hidden="true" />
      </div>
      <div className="flex-1 space-y-1">
        {toast.title ? (
          <p className="font-semibold tracking-tight">{toast.title}</p>
        ) : null}
        {toast.description ? (
          <p
            className={cn(
              'text-sm leading-relaxed',
              styles.description
            )}
          >
            {toast.description}
          </p>
        ) : null}
        {toast.action ? (
          <button
            type="button"
            onClick={handleAction}
            aria-label={toast.action.altText ?? toast.action.label}
            className={cn(
              'inline-flex items-center gap-1 rounded-full border border-current/30 px-3 py-1 text-xs font-semibold uppercase tracking-wide transition',
              styles.action
            )}
          >
            {toast.action.label}
          </button>
        ) : null}
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        className="rounded-full p-1.5 text-slate-500 transition hover:text-slate-800"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
