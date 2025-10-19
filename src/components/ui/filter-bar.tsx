'use client';

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { Check, ChevronDown, Filter, Search, X } from 'lucide-react';

import { cn } from '@/lib/utils';

export type FilterBarProps = {
  className?: string;
  search?: FilterBarSearchControl | null;
  toggles?: FilterBarToggleControl[];
  dropdowns?: FilterBarDropdownControl[];
  actions?: ReactNode;
  dense?: boolean;
};

export type FilterBarSearchControl = {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
};

export type FilterBarPillOption = {
  value: string;
  label: string;
  badge?: ReactNode;
  description?: string;
  icon?: ReactNode;
};

export type FilterBarToggleControl = {
  id: string;
  label?: string;
  icon?: ReactNode;
  options: FilterBarPillOption[];
  value: string[];
  onChange: (value: string[]) => void;
  selectionMode?: 'single' | 'multiple';
  maxSelected?: number;
};

export type FilterBarDropdownOption = {
  value: string;
  label: string;
  badge?: ReactNode;
  description?: string;
};

export type FilterBarDropdownControl = {
  id: string;
  label: string;
  icon?: ReactNode;
  options: FilterBarDropdownOption[];
  value: string[];
  onChange: (value: string[]) => void;
  allowMultiple?: boolean;
  emptyLabel?: string;
};

export function FilterBar({
  className,
  search,
  toggles = [],
  dropdowns = [],
  actions,
  dense,
}: FilterBarProps) {
  const hasFilters = toggles.length > 0 || dropdowns.length > 0 || !!search;

  if (!hasFilters) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white/95 px-4 py-3 shadow-sm shadow-slate-950/[0.02] backdrop-blur',
        dense && 'px-3 py-2',
        className
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {search ? <FilterSearch {...search} /> : null}

          {toggles.map((group) => (
            <FilterPillGroup key={group.id} {...group} />
          ))}
        </div>

        <div className="flex items-center gap-2">
          {dropdowns.map((dropdown) => (
            <FilterDropdown key={dropdown.id} control={dropdown} />
          ))}

          {actions ? <Fragment>{actions}</Fragment> : null}
        </div>
      </div>
    </div>
  );
}

type FilterSearchProps = FilterBarSearchControl;

function FilterSearch({ placeholder, value, onChange, onSubmit }: FilterSearchProps) {
  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      onSubmit?.(value);
    },
    [onSubmit, value]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="relative min-w-[220px] flex-1 max-w-xs"
      role="search"
    >
      <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      <input
        className="h-10 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
        placeholder={placeholder ?? 'Search'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={placeholder ?? 'Search'}
      />
    </form>
  );
}

function FilterPillGroup({
  id,
  label,
  icon,
  options,
  value,
  onChange,
  selectionMode = 'multiple',
  maxSelected,
}: FilterBarToggleControl) {
  const handleToggle = useCallback(
    (option: FilterBarPillOption) => {
      const isSelected = value.includes(option.value);
      let next = value;

      if (selectionMode === 'single') {
        next = isSelected ? [] : [option.value];
      } else {
        if (isSelected) {
          next = value.filter((item) => item !== option.value);
        } else if (!maxSelected || value.length < maxSelected) {
          next = [...value, option.value];
        } else if (maxSelected === 1) {
          next = [option.value];
        } else {
          next = value;
        }
      }

      if (next !== value) {
        onChange(next);
      }
    },
    [selectionMode, value, onChange, maxSelected]
  );

  return (
    <div className="flex flex-wrap items-center gap-1">
      {label ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
          {icon ? <span className="text-slate-500">{icon}</span> : null}
          {label}
        </span>
      ) : null}

      <div className="flex flex-wrap items-center gap-1">
        {options.map((option) => {
          const isSelected = value.includes(option.value);
          return (
            <button
              key={`${id}-${option.value}`}
              type="button"
              onClick={() => handleToggle(option)}
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
                isSelected
                  ? 'border-sky-400 bg-sky-50 text-sky-600 shadow-[0_8px_20px_-13px_rgba(56,189,248,0.9)]'
                  : 'border-transparent bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {option.icon ? <span className="text-sky-500">{option.icon}</span> : null}
              <span>{option.label}</span>
              {option.badge ? <span className="text-xs text-slate-400">{option.badge}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type FilterDropdownProps = {
  control: FilterBarDropdownControl;
};

function FilterDropdown({ control }: FilterDropdownProps) {
  const { label, icon, options, value, onChange, allowMultiple = true, emptyLabel } = control;
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointer = (event: PointerEvent) => {
      if (!panelRef.current) return;
      if (panelRef.current.contains(event.target as Node)) return;
      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('pointerdown', handlePointer);
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('pointerdown', handlePointer);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const toggleValue = useCallback(
    (optionValue: string) => {
      const isSelected = value.includes(optionValue);
      let next = value;

      if (allowMultiple) {
        next = isSelected ? value.filter((item) => item !== optionValue) : [...value, optionValue];
      } else {
        next = isSelected ? [] : [optionValue];
        setOpen(false);
      }

      if (next !== value) {
        onChange(next);
      }
    },
    [allowMultiple, onChange, value]
  );

  const clearSelection = useCallback(() => {
    if (value.length === 0) return;
    onChange([]);
  }, [onChange, value]);

  const appliedSummary = useMemo(() => {
    if (value.length === 0) {
      return emptyLabel ?? 'Any';
    }

    if (!allowMultiple) {
      const option = options.find((item) => item.value === value[0]);
      return option?.label ?? emptyLabel ?? 'Any';
    }

    if (value.length === 1) {
      const option = options.find((item) => item.value === value[0]);
      return option?.label ?? `${value.length} selected`;
    }

    return `${value.length} selected`;
  }, [allowMultiple, emptyLabel, options, value]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-sky-300 hover:text-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
          value.length > 0 && 'border-sky-200 bg-sky-50 text-sky-600'
        )}
        aria-expanded={open ? 'true' : 'false'}
        aria-haspopup="true"
      >
        <span className="inline-flex items-center gap-1">
          {icon ? icon : <Filter className="size-4" aria-hidden />}
          <span>{label}</span>
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
          {appliedSummary}
        </span>
        <ChevronDown className="size-4 text-slate-400" aria-hidden />
      </button>

      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-64 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-950/10">
          <div className="max-h-72 overflow-y-auto p-2">
            {options.map((option) => {
              const isSelected = value.includes(option.value);

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleValue(option.value)}
                  className={cn(
                    'flex w-full items-start gap-2 rounded-2xl px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
                    isSelected ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 inline-flex size-5 items-center justify-center rounded-full border text-xs font-semibold',
                      isSelected ? 'border-sky-300 bg-sky-500 text-white' : 'border-slate-300 bg-white'
                    )}
                    aria-hidden
                  >
                    {isSelected ? <Check className="size-3.5" /> : ''}
                  </span>

                  <span className="flex-1">
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      {option.label}
                      {option.badge ? (
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {option.badge}
                        </span>
                      ) : null}
                    </span>
                    {option.description ? (
                      <span className="mt-1 block text-xs text-slate-500">{option.description}</span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-3 py-2">
            <span className="text-xs text-slate-400">{value.length} selected</span>
            <button
              type="button"
              onClick={clearSelection}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-slate-500 transition hover:bg-white"
            >
              <X className="size-3.5" aria-hidden />
              Clear
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export type { FilterDropdownProps };