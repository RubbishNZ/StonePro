'use client';

import { useCallback, useMemo, useState } from 'react';

import {
  Bookmark,
  Droplet,
  Edit3,
  Layers,
  PackageSearch,
  Plus,
  Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import {
  FilterBar,
  type FilterBarToggleControl,
  type FilterBarDropdownControl,
} from '@/components/ui/filter-bar';
import { SidePanel } from '@/components/ui/side-panel';

import type { MaterialRecord } from './page';
import { MaterialForm } from './materials-form';

type PanelState =
  | { mode: 'closed' }
  | { mode: 'detail'; materialId: string }
  | { mode: 'create' }
  | { mode: 'edit'; materialId: string };

type MaterialsCatalogProps = {
  materials: MaterialRecord[];
};

export function MaterialsCatalog({ materials }: MaterialsCatalogProps) {
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [finishFilter, setFinishFilter] = useState<string[]>([]);
  const [panelState, setPanelState] = useState<PanelState>({ mode: 'closed' });

  const selectedMaterial = useMemo(() => {
    if (panelState.mode === 'detail' || panelState.mode === 'edit') {
      return materials.find((material) => material.id === panelState.materialId) ?? null;
    }
    return null;
  }, [panelState, materials]);

  const totalMaterials = materials.length;
  const uniqueTypes = useMemo(() => {
    const values = new Set<string>();
    materials.forEach((material) => {
      const value = normaliseString(material.material_type ?? material.category);
      if (value) values.add(value);
    });
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [materials]);

  const uniqueFinishes = useMemo(() => {
    const values = new Set<string>();
    materials.forEach((material) => {
      const value = normaliseString(material.surface_finish ?? material.finish);
      if (value) values.add(value);
    });
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [materials]);

  const materialTypeOptions = useMemo(
    () => deriveSelectOptions(materials, (material) => material.material_type ?? material.category),
    [materials]
  );

  const categoryOptions = useMemo(
    () => deriveSelectOptions(materials, (material) => material.category),
    [materials]
  );

  const finishOptions = useMemo(
    () => deriveSelectOptions(materials, (material) => material.surface_finish ?? material.finish),
    [materials]
  );

  const colourOptions = useMemo(
    () => deriveSelectOptions(materials, (material) => material.color_family ?? material.color_primary),
    [materials]
  );

  const filteredMaterials = useMemo(() => {
    if (materials.length === 0) return [];

    const searchValue = search.trim().toLowerCase();

    return materials.filter((material) => {
      if (searchValue.length > 0) {
        const haystack = [
          material.name,
          material.sku,
          material.batch_number,
          material.description,
          material.material_type,
          material.category,
          material.color_family,
          material.surface_finish,
          material.finish,
        ]
          .map((value) => (typeof value === 'string' ? value.toLowerCase() : ''))
          .join(' ');

        if (!haystack.includes(searchValue)) {
          return false;
        }
      }

      if (typeFilter.length > 0) {
        const value = normaliseString(material.material_type ?? material.category);
        if (!value || !typeFilter.some((entry) => entry.toLowerCase() === value)) {
          return false;
        }
      }

      if (finishFilter.length > 0) {
        const value = normaliseString(material.surface_finish ?? material.finish);
        if (!value || !finishFilter.some((entry) => entry.toLowerCase() === value)) {
          return false;
        }
      }

      return true;
    });
  }, [materials, search, typeFilter, finishFilter]);

  const typeToggle: FilterBarToggleControl | null = uniqueTypes.length
    ? {
        id: 'material-types',
        label: 'Type',
        icon: <Layers className="size-3.5" aria-hidden />,
        options: uniqueTypes.map((value) => ({ value, label: capitalise(value) })),
        value: typeFilter,
        onChange: setTypeFilter,
        selectionMode: 'multiple',
      }
    : null;

  const finishToggle: FilterBarToggleControl | null = uniqueFinishes.length
    ? {
        id: 'material-finish',
        label: 'Finish',
        icon: <Sparkles className="size-3.5" aria-hidden />,
        options: uniqueFinishes.map((value) => ({ value, label: capitalise(value) })),
        value: finishFilter,
        onChange: setFinishFilter,
        selectionMode: 'multiple',
      }
    : null;

  const filterDropdowns: FilterBarDropdownControl[] = [];

  const filtersPresent = Boolean(typeToggle || finishToggle);

  const openCreate = useCallback(() => {
    setPanelState({ mode: 'create' });
  }, []);

  const openDetail = useCallback((materialId: string) => {
    setPanelState({ mode: 'detail', materialId });
  }, []);

  const openEdit = useCallback(() => {
    if (!selectedMaterial) return;
    setPanelState({ mode: 'edit', materialId: selectedMaterial.id });
  }, [selectedMaterial]);

  const closePanel = useCallback(() => {
    setPanelState({ mode: 'closed' });
  }, []);

  const handleFormSuccess = useCallback(
    (_material: MaterialRecord) => {
      closePanel();
      router.refresh();
    },
    [closePanel, router]
  );

  const tableColumns = useMemo<DataTableColumn<MaterialRecord>[]>(() => {
    const nameColumn: DataTableColumn<MaterialRecord> = {
      id: 'name',
      header: 'Material',
      sortable: true,
      sortValue: (row) => (typeof row.name === 'string' ? row.name : ''),
      cell: (row) => (
        <button
          type="button"
          onClick={() => openDetail(row.id)}
          className="flex w-full flex-col items-start gap-0.5 text-left"
        >
          <span className="text-sm font-semibold text-slate-900">
            {typeof row.name === 'string' && row.name.trim().length > 0
              ? row.name
              : 'Unnamed material'}
          </span>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            {row.sku ? String(row.sku).toUpperCase() : 'No SKU'}
          </span>
        </button>
      ),
    };

    const batchColumn: DataTableColumn<MaterialRecord> = {
      id: 'batch_number',
      header: 'Batch / Lot',
      sortable: true,
      width: 'w-[140px]',
      sortValue: (row) => normaliseString(row.batch_number),
      cell: (row) => {
        const value = typeof row.batch_number === 'string' ? row.batch_number.trim() : '';
        return value.length > 0 ? (
          <span className="font-mono text-xs uppercase tracking-wide text-slate-600">{value}</span>
        ) : (
          '—'
        );
      },
    };

    const typeColumn: DataTableColumn<MaterialRecord> = {
      id: 'type',
      header: 'Type',
      sortable: true,
      sortValue: (row) => normaliseDisplay(row.material_type ?? row.category),
      cell: (row) => (
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {normaliseDisplay(row.material_type ?? row.category) ?? '—'}
        </span>
      ),
      align: 'center',
      width: 'w-[140px]',
    };

    const finishColumn: DataTableColumn<MaterialRecord> = {
      id: 'finish',
      header: 'Finish',
      sortable: true,
      sortValue: (row) => normaliseDisplay(row.surface_finish ?? row.finish),
      cell: (row) => normaliseDisplay(row.surface_finish ?? row.finish) ?? '—',
      width: 'w-[160px]',
    };

    const colourColumn: DataTableColumn<MaterialRecord> = {
      id: 'colour',
      header: 'Colour',
      sortable: true,
      sortValue: (row) => normaliseDisplay(row.color_family),
      cell: (row) => (
        <span className="inline-flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Droplet className="size-3" aria-hidden />
          </span>
          <span className="text-sm text-slate-600">
            {normaliseDisplay(row.color_family ?? row.color_primary) ?? '—'}
          </span>
        </span>
      ),
    };

    const thicknessColumn: DataTableColumn<MaterialRecord> = {
      id: 'thickness',
      header: 'Thickness',
      sortable: true,
      align: 'center',
      width: 'w-[120px]',
      sortValue: (row) => Number(row.default_thickness_mm ?? 0),
      cell: (row) => formatThickness(row.default_thickness_mm),
    };

    const unitCostColumn: DataTableColumn<MaterialRecord> = {
      id: 'unit_cost',
      header: 'Unit cost',
      sortable: true,
      align: 'right',
      width: 'w-[140px]',
      sortValue: (row) => Number(row.unit_cost ?? 0),
      cell: (row) => formatCurrency(row.unit_cost, row.currency),
    };

    const updatedColumn: DataTableColumn<MaterialRecord> = {
      id: 'updated_at',
      header: 'Last updated',
      sortable: true,
      width: 'w-[180px]',
      sortValue: (row) => {
        const value = typeof row.updated_at === 'string' ? row.updated_at : String(row.updated_at ?? '');
        return value;
      },
      cell: (row) => formatTimestamp(row.updated_at ?? row.created_at),
    };

    return [
      nameColumn,
      batchColumn,
      typeColumn,
      finishColumn,
      colourColumn,
      thicknessColumn,
      unitCostColumn,
      updatedColumn,
    ];
  }, [openDetail]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-semibold text-slate-900">Materials catalog</h1>
          <p className="text-sm text-slate-600">
            Define surfaces and finishes once, then reuse them when receiving and scheduling jobs.
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
              <PackageSearch className="size-3" aria-hidden />
              {totalMaterials} materials
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
              <Bookmark className="size-3" aria-hidden />
              {uniqueTypes.length} types
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
              <Sparkles className="size-3" aria-hidden />
              {uniqueFinishes.length} finishes
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          <Plus className="size-4" aria-hidden />
          New material
        </button>
      </header>

      <FilterBar
        search={{ value: search, onChange: setSearch, placeholder: 'Search name, SKU, finish…' }}
        toggles={[typeToggle, finishToggle].filter(Boolean) as FilterBarToggleControl[]}
        dropdowns={filterDropdowns}
        actions={filtersPresent ? null : undefined}
      />

      <DataTable
        data={filteredMaterials}
        columns={tableColumns}
        keyExtractor={(row) => row.id}
        className="bg-white"
        dense
        emptyState={{
          title: 'No materials found',
          description:
            materials.length === 0
              ? 'Add your first material to begin receiving slabs and remnants.'
              : 'Adjust your filters or search to find what you need.',
          action: (
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus className="size-3.5" aria-hidden />
              Create material
            </button>
          ),
        }}
      />

      <SidePanel
        open={panelState.mode === 'detail' && !!selectedMaterial}
        onClose={closePanel}
        title={selectedMaterial?.name ?? 'Material details'}
        description={selectedMaterial?.sku ? `SKU ${selectedMaterial.sku}` : undefined}
        size="lg"
        resizable
        storageKey="materials.catalog.detail.width"
        minWidth={360}
        maxWidth={960}
        footer={
          selectedMaterial ? (
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Last updated {formatTimestamp(selectedMaterial.updated_at ?? selectedMaterial.created_at)}
              </div>
              <button
                type="button"
                onClick={openEdit}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                <Edit3 className="size-4" aria-hidden />
                Edit material
              </button>
            </div>
          ) : null
        }
      >
        {selectedMaterial ? <MaterialDetails material={selectedMaterial} /> : null}
      </SidePanel>

      <SidePanel
        open={panelState.mode === 'create' || panelState.mode === 'edit'}
        onClose={closePanel}
        title={panelState.mode === 'create' ? 'New material' : 'Edit material'}
        description={
          panelState.mode === 'edit' && selectedMaterial?.name
            ? `Updating ${selectedMaterial.name}`
            : 'Add catalog details for slabs and remnants.'
        }
        size="2xl"
        resizable
        storageKey="materials.catalog.form.width"
        minWidth={480}
        maxWidth={1024}
      >
        <MaterialForm
          mode={panelState.mode === 'create' ? 'create' : 'edit'}
          initialMaterial={panelState.mode === 'edit' ? selectedMaterial : null}
          onCancel={closePanel}
          onSuccess={handleFormSuccess}
          options={{
            materialTypes: materialTypeOptions,
            categories: categoryOptions,
            finishes: finishOptions,
            colourFamilies: colourOptions,
          }}
        />
      </SidePanel>
    </div>
  );
}

function MaterialDetails({ material }: { material: MaterialRecord }) {
  const items = buildDetailEntries(material);

  return (
    <div className="space-y-6">
      {material.description ? (
        <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {material.description}
        </p>
      ) : null}

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Attributes</h3>
        <dl className="grid gap-3 text-sm text-slate-600">
          {items.map((item) => (
            <div key={item.label} className="flex items-start justify-between gap-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {item.label}
              </dt>
              <dd className="flex-1 text-right text-sm text-slate-700">
                {item.value ?? '—'}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

type DetailEntry = {
  label: string;
  value: string | null;
};

function buildDetailEntries(material: MaterialRecord): DetailEntry[] {
  const entries: DetailEntry[] = [];

  entries.push({ label: 'Material type', value: normaliseDisplay(material.material_type ?? material.category) });
  entries.push({ label: 'Colour family', value: normaliseDisplay(material.color_family) });
  entries.push({ label: 'Finish', value: normaliseDisplay(material.surface_finish ?? material.finish) });
  entries.push({ label: 'Default thickness', value: formatThickness(material.default_thickness_mm) });
  entries.push({ label: 'Lead time', value: formatLeadTime(material.lead_time_days) });
  entries.push({ label: 'Unit cost', value: formatCurrency(material.unit_cost, material.currency) });
  entries.push({ label: 'Batch / lot number', value: formatBatchNumber(material.batch_number) });
  entries.push({ label: 'Supplier reference', value: material.supplier_reference ? String(material.supplier_reference) : null });
  entries.push({ label: 'Typical slab size', value: formatDimensions(material.slab_length_mm, material.slab_width_mm) });

  return entries.filter((entry) => entry.value != null && entry.value !== '');
}

function normaliseString(value: unknown) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.toLowerCase() : '';
}

function normaliseDisplay(value: unknown) {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? capitalise(trimmed) : null;
  }
  return null;
}

function capitalise(value: string) {
  if (!value) return value;
  return value
    .split(/\s+/)
    .map((part) => (part.length > 0 ? part[0].toUpperCase() + part.slice(1).toLowerCase() : part))
    .join(' ');
}

function formatThickness(value: unknown) {
  if (value == null) return '—';
  const num = Number(value);
  if (!Number.isFinite(num) || num === 0) return '—';
  return `${num.toFixed(0)} mm`;
}

function formatLeadTime(value: unknown) {
  if (value == null) return null;
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return null;
  return `${num} day${num === 1 ? '' : 's'}`;
}

function formatDimensions(length: unknown, width: unknown) {
  const lengthNumber = Number(length ?? 0);
  const widthNumber = Number(width ?? 0);

  if (!Number.isFinite(lengthNumber) || !Number.isFinite(widthNumber) || lengthNumber === 0 || widthNumber === 0) {
    return null;
  }

  return `${lengthNumber.toFixed(0)} × ${widthNumber.toFixed(0)} mm`;
}

function formatCurrency(value: unknown, currency: unknown) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount) || amount === 0) {
    return '—';
  }

  const fallbackCurrency = typeof currency === 'string' && currency.trim().length === 3 ? currency.trim().toUpperCase() : 'NZD';

  try {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: fallbackCurrency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${fallbackCurrency}`;
  }
}

function formatBatchNumber(value: unknown) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function formatTimestamp(value: unknown) {
  if (!value) return '—';
  const date = new Date(value as string);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-NZ', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function deriveSelectOptions(
  materials: MaterialRecord[],
  selector: (material: MaterialRecord) => unknown
) {
  const seen = new Map<string, string>();

  materials.forEach((material) => {
    const raw = selector(material);
    if (typeof raw !== 'string') return;
    const trimmed = raw.trim();
    if (!trimmed) return;

    const formatted = capitalise(trimmed);
    const key = formatted.toLowerCase();

    if (!seen.has(key)) {
      seen.set(key, formatted);
    }
  });

  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
}
