'use client';

import Image from 'next/image';
import {
  forwardRef,
  useCallback,
  useMemo,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';

import { Check, ImageOff } from 'lucide-react';

import { cn } from '@/lib/utils';

export type GalleryItem = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string | null;
  imageAlt?: string;
  meta?: ReactNode;
  accent?: ReactNode;
  badge?: string;
  disabled?: boolean;
};

export type GalleryEmptyState = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
};

export type GalleryGridProps = {
  items: GalleryItem[];
  className?: string;
  columns?: {
    base?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  selectionMode?: 'none' | 'single' | 'multiple';
  selectedIds?: string[];
  onSelectionChange?: (nextSelected: string[], item: GalleryItem) => void;
  emptyState?: GalleryEmptyState;
  renderItemActions?: (item: GalleryItem) => ReactNode;
  maxSelection?: number;
  loading?: boolean;
  skeletonCount?: number;
};

const columnClassNames: Array<keyof NonNullable<GalleryGridProps['columns']>> = [
  'base',
  'sm',
  'md',
  'lg',
];

const columnDefaults: Record<typeof columnClassNames[number], number> = {
  base: 1,
  sm: 2,
  md: 3,
  lg: 4,
};

function GalleryGridBase({
  items,
  className,
  columns,
  selectionMode = 'none',
  selectedIds: selectedIdsProp,
  onSelectionChange,
  emptyState,
  renderItemActions,
  maxSelection,
  loading = false,
  skeletonCount = 6,
}: GalleryGridProps) {
  const [selectedInternal, setSelectedInternal] = useState<string[]>([]);
  const isControlled = Array.isArray(selectedIdsProp);

  const selectedIds = isControlled ? selectedIdsProp ?? [] : selectedInternal;

  const columnsClassName = useMemo(() => {
    const merged = { ...columnDefaults, ...(columns ?? {}) };

    return columnClassNames
      .map((key) => {
        const rawValue = merged[key];
        if (!rawValue) return null;
        const clamped = Math.min(Math.max(rawValue, 1), 6);
        const prefix = key === 'base' ? '' : `${key}:`;
        return `${prefix}grid-cols-${clamped}`;
      })
      .filter(Boolean)
      .join(' ');
  }, [columns]);

  const handleTilePress = useCallback(
    (item: GalleryItem) => {
      if (selectionMode === 'none') {
        return;
      }
      if (item.disabled) {
        return;
      }

      const currentSelected = [...selectedIds];
      const itemIndex = currentSelected.indexOf(item.id);
      let nextSelected = currentSelected;

      if (selectionMode === 'single') {
        nextSelected = itemIndex === -1 ? [item.id] : [];
      } else if (selectionMode === 'multiple') {
        if (itemIndex === -1) {
          if (maxSelection && currentSelected.length >= maxSelection) {
            return;
          }
          nextSelected = [...currentSelected, item.id];
        } else {
          nextSelected = currentSelected.filter((value) => value !== item.id);
        }
      }

      if (!isControlled) {
        setSelectedInternal(nextSelected);
      }

      onSelectionChange?.(nextSelected, item);
    },
    [isControlled, selectionMode, selectedIds, maxSelection, onSelectionChange]
  );

  const showEmptyState = !loading && items.length === 0 && emptyState;

  return (
    <div className={cn('space-y-4', className)}>
      <div
        className={cn(
          'grid gap-4',
          columnsClassName || 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
        )}
      >
        {loading
          ? Array.from({ length: skeletonCount }, (_, index) => <GallerySkeleton key={`skeleton-${index}`} />)
          : items.map((item) => (
              <GalleryTile
                key={item.id}
                item={item}
                selected={selectedIds.includes(item.id)}
                selectable={selectionMode !== 'none'}
                onSelect={handleTilePress}
                actions={renderItemActions?.(item)}
              />
            ))}
      </div>

      {showEmptyState ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/70 px-10 py-16 text-center">
          {emptyState.icon ?? (
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-slate-200 text-slate-500">
              <ImageOff className="size-7" />
            </div>
          )}
          <h3 className="text-lg font-semibold text-slate-900">{emptyState.title}</h3>
          {emptyState.description ? (
            <p className="mt-2 max-w-sm text-sm text-slate-600">{emptyState.description}</p>
          ) : null}
          {emptyState.action ? <div className="mt-6">{emptyState.action}</div> : null}
        </div>
      ) : null}
    </div>
  );
}

type GalleryTileProps = {
  item: GalleryItem;
  selected: boolean;
  selectable: boolean;
  onSelect: (item: GalleryItem) => void;
  actions?: ReactNode;
};

const GalleryTile = forwardRef<HTMLButtonElement, GalleryTileProps>(
  ({ item, selected, selectable, onSelect, actions }, ref) => {
    const handleClick = useCallback(() => {
      if (!selectable) {
        return;
      }
      onSelect(item);
    }, [item, onSelect, selectable]);

    const Tag = selectable ? 'button' : 'div';
    const indicatorContent = useMemo(() => {
      if (item.accent) return item.accent;
      if (typeof item.meta === 'string' || typeof item.meta === 'number') {
        return item.meta;
      }
      return '+';
    }, [item.accent, item.meta]);

    return (
      <Tag
        ref={selectable ? (ref as never) : undefined}
        type={selectable ? 'button' : undefined}
        onClick={selectable ? handleClick : undefined}
        disabled={selectable && item.disabled}
        className={cn(
          'group relative flex flex-col overflow-hidden rounded-3xl border bg-white shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-4 focus-visible:ring-offset-white',
          item.disabled ? 'cursor-not-allowed opacity-60' : 'hover:-translate-y-1 hover:shadow-md',
          selected ? 'border-sky-400 shadow-[0_18px_35px_-18px_rgba(56,189,248,0.55)]' : 'border-slate-200'
        )}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
          <GalleryImage
            src={item.imageUrl ?? undefined}
            alt={item.imageAlt ?? item.title}
            disabled={item.disabled}
          />

          {item.badge ? (
            <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700 shadow-sm">
              {item.badge}
            </span>
          ) : null}

          {selectable ? (
            <span
              className={cn(
                'absolute right-4 top-4 inline-flex size-8 items-center justify-center rounded-full border text-sm font-semibold transition',
                selected
                  ? 'border-sky-500 bg-sky-500 text-white'
                  : 'border-white/60 bg-white/90 text-slate-500 group-hover:border-sky-300 group-hover:text-sky-500'
              )}
            >
              {selected ? <Check className="size-4" aria-hidden /> : indicatorContent}
              <span className="sr-only">{selected ? 'Selected' : 'Select'}</span>
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
            {item.description ? (
              <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
            ) : null}
          </div>

          <div className="mt-auto flex items-center justify-between gap-3">
            <div className="text-xs text-slate-500">{item.meta}</div>
            {actions}
          </div>
        </div>
      </Tag>
    );
  }
);

GalleryTile.displayName = 'GalleryTile';

type GalleryImageProps = {
  src?: string;
  alt: string;
  disabled?: boolean;
} & Omit<ComponentPropsWithoutRef<typeof Image>, 'src' | 'alt' | 'fill'>;

function GalleryImage({ src, alt, disabled, ...props }: GalleryImageProps) {
  const [isError, setIsError] = useState(false);

  if (!src || isError) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-100 text-slate-400">
        <ImageOff className="size-6" aria-hidden />
        <span className="sr-only">No image available</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={cn('object-cover transition duration-200', disabled ? 'saturate-50' : 'group-hover:scale-[1.02]')}
      onError={() => setIsError(true)}
      sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
      {...props}
    />
  );
}

type GallerySkeletonProps = {
  className?: string;
};

function GallerySkeleton({ className }: GallerySkeletonProps) {
  return (
    <div
      className={cn(
        'flex animate-pulse flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm',
        className
      )}
    >
      <div className="aspect-[4/3] bg-slate-200/70" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded-full bg-slate-200/80" />
        <div className="h-3 w-full rounded-full bg-slate-200/70" />
        <div className="h-3 w-2/3 rounded-full bg-slate-200/70" />
      </div>
    </div>
  );
}

type GalleryGridComponent = ((props: GalleryGridProps) => JSX.Element) & {
  Skeleton: typeof GallerySkeleton;
};

const GalleryGrid = Object.assign(GalleryGridBase, {
  Skeleton: GallerySkeleton,
}) as GalleryGridComponent;

export { GalleryGrid };
