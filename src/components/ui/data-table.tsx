'use client';

import { useMemo, useState, type ReactNode } from "react";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { cn } from "@/lib/utils";

export type DataTableSortDirection = "asc" | "desc";

export type DataTableColumn<T> = {
  /** Unique identifier used for keys and sorting. */
  id: string;
  /** Header label / element. */
  header: ReactNode;
  /** Cell renderer */
  cell?: (row: T) => ReactNode;
  /** Accessor for simple cells (alias for cell). */
  accessor?: (row: T) => ReactNode;
  /** Value extractor used for sorting */
  sortValue?: (row: T) => string | number | boolean | Date | null | undefined;
  /** Enable client-side sorting */
  sortable?: boolean;
  /** Horizontal alignment */
  align?: "left" | "right" | "center";
  /** Custom class for TD element */
  className?: string;
  /** Custom class for TH element */
  headerClassName?: string;
  /** Optional width (tailwind width classes) */
  width?: string;
  /** Render prop for column footer */
  footer?: ReactNode | ((rows: T[]) => ReactNode);
};

export type DataTableEmptyState = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
};

export type DataTableProps<T> = {
  data: T[];
  columns: DataTableColumn<T>[];
  caption?: ReactNode;
  keyExtractor?: (row: T, index: number) => string | number;
  emptyState?: DataTableEmptyState;
  initialSort?: { columnId: string; direction: DataTableSortDirection };
  onSortChange?: (sort: { columnId: string; direction: DataTableSortDirection }) => void;
  dense?: boolean;
  className?: string;
  footerClassName?: string;
};

export function DataTable<T>({
  data,
  columns,
  caption,
  keyExtractor,
  emptyState,
  initialSort,
  onSortChange,
  dense,
  className,
  footerClassName,
}: DataTableProps<T>) {
  const [sort, setSort] = useState(initialSort ?? null);

  const withSortHandlers = useMemo(() => {
    if (!sort) {
      return data;
    }

    const column = columns.find((col) => col.id === sort.columnId && col.sortable);
    if (!column) {
      return data;
    }

    const sorter = column.sortValue ?? column.accessor ?? column.cell;
    if (!sorter) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = valueForSort(sorter, a);
      const bValue = valueForSort(sorter, b);

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sort.direction === "asc" ? -1 : 1;
      if (bValue == null) return sort.direction === "asc" ? 1 : -1;

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sort.direction === "asc" ? aValue - bValue : bValue - aValue;
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return sort.direction === "asc"
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();

      if (aString === bString) return 0;
      return sort.direction === "asc"
        ? aString.localeCompare(bString)
        : bString.localeCompare(aString);
    });
  }, [columns, data, sort]);

  const handleSort = (column: DataTableColumn<T>) => {
    if (!column.sortable) return;

    setSort((prev) => {
      const nextDirection: DataTableSortDirection =
        prev && prev.columnId === column.id && prev.direction === "asc" ? "desc" : "asc";

      const nextSort = { columnId: column.id, direction: nextDirection } as const;

      onSortChange?.(nextSort);

      return nextSort;
    });
  };

  if (withSortHandlers.length === 0) {
    return (
      <div
        className={cn(
          "flex min-h-[240px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center",
          className,
        )}
      >
        {emptyState?.icon ? <div className="mb-4 text-slate-400">{emptyState.icon}</div> : null}
        <h3 className="text-lg font-semibold text-slate-900">
          {emptyState?.title ?? "No data available"}
        </h3>
        {emptyState?.description ? (
          <p className="mt-2 text-sm text-slate-600">{emptyState.description}</p>
        ) : null}
        {emptyState?.action ? <div className="mt-4">{emptyState.action}</div> : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table className={cn("min-w-full text-left", dense ? "text-sm" : "text-base")}>
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className={cn(
                    "px-4 py-3 font-semibold",
                    column.align === "right" && "text-right",
                    column.align === "center" && "text-center",
                    column.width,
                    column.headerClassName,
                  )}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(column)}
                      className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:bg-slate-200/60"
                    >
                      <span>{column.header}</span>
                      <SortIcon active={sort?.columnId === column.id} direction={sort?.direction} />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {withSortHandlers.map((row, index) => {
              const key = keyExtractor?.(row, index) ?? `${index}`;

              return (
                <tr
                  key={key}
                  className={cn(
                    "transition hover:bg-slate-50",
                    dense ? "text-sm" : "text-[15px]",
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={cn(
                        "px-4 py-3 text-slate-700",
                        column.align === "right" && "text-right",
                        column.align === "center" && "text-center",
                        column.width,
                        column.className,
                      )}
                    >
                      {renderCell(column, row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
          {columns.some((c) => c.footer) ? (
            <tfoot className={cn("bg-slate-50/80 text-sm text-slate-600", footerClassName)}>
              <tr>
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={cn(
                      "px-4 py-3",
                      column.align === "right" && "text-right",
                      column.align === "center" && "text-center",
                      column.width,
                      column.className,
                    )}
                  >
                    {typeof column.footer === "function" ? column.footer(withSortHandlers) : column.footer}
                  </td>
                ))}
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>
    </div>
  );
}

function renderCell<T>(column: DataTableColumn<T>, row: T) {
  if (column.cell) return column.cell(row);
  if (column.accessor) return column.accessor(row);
  return null;
}

function valueForSort<T>(
  sorter: DataTableColumn<T>["sortValue"] | DataTableColumn<T>["cell"],
  row: T,
) {
  if (!sorter) return null;
  const value = sorter(row);
  if (value instanceof Date) return value;
  if (typeof value === "number" || typeof value === "string" || typeof value === "boolean") {
    return value as string | number | boolean;
  }
  if (value == null) return null;

  return String(value);
}

function SortIcon({
  active,
  direction,
}: {
  active?: boolean;
  direction?: DataTableSortDirection | null;
}) {
  if (!active || !direction) {
    return <ArrowUpDown className="size-3" />;
  }

  if (direction === "asc") {
    return <ArrowUp className="size-3" />;
  }

  return <ArrowDown className="size-3" />;
}