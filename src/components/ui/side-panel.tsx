'use client';

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
} from 'react';
import { createPortal } from 'react-dom';

import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

type SidePanelSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const sizeClassMap = {
  sm: 'w-[20rem] max-w-full',
  md: 'w-[24rem] max-w-full',
  lg: 'w-[28rem] max-w-full',
  xl: 'w-[32rem] max-w-full',
  '2xl': 'w-[48rem] max-w-full',
} satisfies Record<SidePanelSize, string>;

const sizePixelMap = {
  sm: 320,
  md: 384,
  lg: 448,
  xl: 512,
  '2xl': 768,
} satisfies Record<SidePanelSize, number>;

export type SidePanelProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: 'left' | 'right';
  size?: SidePanelSize;
  resizable?: boolean;
  storageKey?: string;
  initialWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  panelClassName?: string;
  overlayClassName?: string;
  closeButtonLabel?: string;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
};

function getFocusableElements(container: HTMLElement) {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([type="hidden"]):not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ];

  return Array.from(
    container.querySelectorAll<HTMLElement>(focusableSelectors.join(','))
  ).filter((element) => !element.hasAttribute('disabled') && !element.getAttribute('aria-hidden'));
}

export function SidePanel({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  side = 'right',
  size = 'lg',
  resizable = false,
  storageKey,
  initialWidth,
  minWidth,
  maxWidth,
  panelClassName,
  overlayClassName,
  closeButtonLabel = 'Close panel',
  closeOnOverlayClick = true,
  closeOnEsc = true,
}: SidePanelProps) {
  const [mounted, setMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(open);
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const labelledBy = useId();
  const describedBy = useId();

  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
    } else {
      closeTimeoutRef.current = window.setTimeout(() => {
        setShouldRender(false);
      }, 220);
    }

    return () => {
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open || !mounted) {
      return;
    }

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    const panel = panelRef.current;
    const focusNext = () => {
      if (!panel) return;
      const focusable = getFocusableElements(panel);
      (focusable[0] ?? panel).focus({ preventScroll: true });
    };

    const animationFrame = window.requestAnimationFrame(focusNext);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.cancelAnimationFrame(animationFrame);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedRef.current?.focus({ preventScroll: true });
      previouslyFocusedRef.current = null;
    };
  }, [open, mounted]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEsc) {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === 'Tab') {
        const panel = panelRef.current;
        if (!panel) {
          return;
        }

        const focusable = getFocusableElements(panel);
        if (focusable.length === 0) {
          event.preventDefault();
          panel.focus({ preventScroll: true });
          return;
        }

        const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
        const lastIndex = focusable.length - 1;

        if (event.shiftKey) {
          if (currentIndex <= 0) {
            event.preventDefault();
            focusable[lastIndex].focus({ preventScroll: true });
          }
        } else if (currentIndex === lastIndex) {
          event.preventDefault();
          focusable[0].focus({ preventScroll: true });
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, closeOnEsc, onClose]);

  const defaultWidth = sizePixelMap[size] ?? sizePixelMap.lg;

  const minWidthPx = useMemo(() => {
    if (!resizable) return undefined;
    return Math.max(minWidth ?? 320, 240);
  }, [resizable, minWidth]);

  const maxWidthPx = useMemo(() => {
    if (!resizable) return undefined;
    const base = maxWidth ?? 960;
    return minWidthPx ? Math.max(base, minWidthPx) : base;
  }, [resizable, maxWidth, minWidthPx]);

  const resolvedDefaultWidth = useMemo(() => {
    if (!resizable) return defaultWidth;
    if (typeof initialWidth === 'number' && Number.isFinite(initialWidth) && initialWidth > 0) {
      return initialWidth;
    }
    return defaultWidth;
  }, [resizable, initialWidth, defaultWidth]);

  const clampWidth = useCallback(
    (value: number) => {
      if (!resizable) return value;
      const minValue = Math.max(minWidthPx ?? resolvedDefaultWidth, 240);
      const viewportMax =
        typeof window !== 'undefined' ? Math.max(minValue, window.innerWidth - 120) : Infinity;
      const configuredMax = maxWidthPx ?? viewportMax;
      const upperBound = Number.isFinite(configuredMax)
        ? Math.max(minValue, Math.min(configuredMax, viewportMax))
        : viewportMax;
      return Math.min(Math.max(value, minValue), upperBound);
    },
    [resizable, minWidthPx, maxWidthPx, resolvedDefaultWidth]
  );

  const [dynamicWidth, setDynamicWidth] = useState(() => resolvedDefaultWidth);
  const widthRef = useRef(resolvedDefaultWidth);
  const resizeStateRef = useRef<{ startX: number; startWidth: number } | null>(null);

  useEffect(() => {
    if (!resizable) {
      const clamped = clampWidth(resolvedDefaultWidth);
      setDynamicWidth(clamped);
      widthRef.current = clamped;
      return;
    }

    let startingWidth = resolvedDefaultWidth;

    if (typeof window !== 'undefined' && storageKey) {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const parsed = Number.parseInt(stored, 10);
        if (Number.isFinite(parsed) && parsed > 0) {
          startingWidth = parsed;
        }
      }
    }

    const clamped = clampWidth(startingWidth);
    setDynamicWidth(clamped);
    widthRef.current = clamped;
  }, [resizable, resolvedDefaultWidth, storageKey, clampWidth]);

  useEffect(() => {
    widthRef.current = dynamicWidth;
  }, [dynamicWidth]);

  const handleDocumentPointerMove = useCallback(
    (event: PointerEvent) => {
      if (!resizable || !resizeStateRef.current) {
        return;
      }
      const { startX, startWidth } = resizeStateRef.current;
      const delta = side === 'right' ? startX - event.clientX : event.clientX - startX;
      const nextWidth = clampWidth(startWidth + delta);
      widthRef.current = nextWidth;
      setDynamicWidth(nextWidth);
    },
    [clampWidth, resizable, side]
  );

  const handleDocumentPointerUp = useCallback(() => {
    if (!resizable || !resizeStateRef.current) {
      return;
    }
    resizeStateRef.current = null;
    document.removeEventListener('pointermove', handleDocumentPointerMove);
    document.removeEventListener('pointerup', handleDocumentPointerUp);
    document.removeEventListener('pointercancel', handleDocumentPointerUp);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';

    if (storageKey && typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, String(Math.round(widthRef.current)));
    }
  }, [handleDocumentPointerMove, resizable, storageKey]);

  useEffect(() => {
    return () => {
      document.removeEventListener('pointermove', handleDocumentPointerMove);
      document.removeEventListener('pointerup', handleDocumentPointerUp);
      document.removeEventListener('pointercancel', handleDocumentPointerUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      resizeStateRef.current = null;
    };
  }, [handleDocumentPointerMove, handleDocumentPointerUp]);

  const handleResizeStart = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!resizable) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();

      const startingWidth = clampWidth(widthRef.current);
      widthRef.current = startingWidth;
      resizeStateRef.current = {
        startX: event.clientX,
        startWidth: startingWidth,
      };

      document.addEventListener('pointermove', handleDocumentPointerMove);
      document.addEventListener('pointerup', handleDocumentPointerUp);
      document.addEventListener('pointercancel', handleDocumentPointerUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    },
    [handleDocumentPointerMove, handleDocumentPointerUp, clampWidth, resizable]
  );

  const handleOverlayPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!closeOnOverlayClick) {
        return;
      }
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [closeOnOverlayClick, onClose]
  );

  const panelClasses = useMemo(() => {
    const sideClass = side === 'left' ? '-translate-x-full' : 'translate-x-full';
    const openClass = 'translate-x-0';
    const base = cn(
      'relative flex h-full max-h-full flex-col overflow-hidden bg-white shadow-[0_15px_35px_-15px_rgba(15,23,42,0.3)]',
      'max-w-full outline-none transition-transform duration-200 ease-out',
      !resizable && sizeClassMap[size],
      panelClassName
    );

    return {
      base,
      sideClosed: sideClass,
      open: openClass,
    };
  }, [panelClassName, resizable, side, size]);

  const panelStyle = useMemo(() => {
    if (!resizable) {
      return undefined;
    }
    return {
      width: `${Math.round(dynamicWidth)}px`,
      minWidth: minWidthPx ? `${minWidthPx}px` : undefined,
      maxWidth: maxWidthPx ? `${maxWidthPx}px` : undefined,
    } satisfies CSSProperties;
  }, [resizable, dynamicWidth, minWidthPx, maxWidthPx]);

  if (!mounted || !shouldRender) {
    return null;
  }

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-[120] flex',
        side === 'left' ? 'justify-start' : 'justify-end'
      )}
    >
      <div
        role="presentation"
        className={cn(
          'absolute inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none',
          overlayClassName
        )}
        onPointerDown={handleOverlayPointerDown}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? labelledBy : undefined}
        aria-describedby={description ? describedBy : undefined}
        tabIndex={-1}
        className={cn(panelClasses.base, open ? panelClasses.open : panelClasses.sideClosed)}
        data-state={open ? 'open' : 'closed'}
        style={panelStyle}
      >
        {resizable ? (
          <div
            role="presentation"
            aria-hidden="true"
            onPointerDown={handleResizeStart}
            className={cn(
              'absolute inset-y-0 z-10 w-3 cursor-col-resize touch-none transition-colors hover:bg-slate-200/60 active:bg-slate-300/60',
              side === 'right' ? 'left-0 -ml-1' : 'right-0 -mr-1'
            )}
          >
            <span className="absolute inset-y-4 left-1/2 w-px -translate-x-1/2 rounded-full bg-slate-200" />
          </div>
        ) : null}
        <header className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div className="space-y-1">
            {title ? (
              <h2 id={labelledBy} className="text-lg font-semibold text-slate-900">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p id={describedBy} className="text-sm text-slate-500">
                {description}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={closeButtonLabel}
            className="inline-flex size-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {children}
        </div>

        {footer ? (
          <footer className="border-t border-slate-200 bg-slate-50/80 px-6 py-4">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
