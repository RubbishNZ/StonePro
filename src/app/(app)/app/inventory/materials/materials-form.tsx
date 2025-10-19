'use client';

import { useMemo, useState } from "react";

import { Loader2 } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

import type { MaterialRecord } from "./page";
import { useToast } from "@/components/ui/toast-provider";
import { useAppWorkspace } from "@/components/layout/app-shell-context";

type MaterialFormOptionSets = {
  materialTypes: string[];
  categories: string[];
  finishes: string[];
  colourFamilies: string[];
};

type DropdownFieldKey = "material_type" | "category" | "surface_finish" | "color_family";

type MaterialFormValues = {
  name: string;
  sku: string;
  batch_number: string;
  material_type: string;
  category: string;
  color_family: string;
  surface_finish: string;
  default_thickness_mm: string;
  lead_time_days: string;
  unit_cost: string;
  currency: string;
  supplier_reference: string;
  slab_length_mm: string;
  slab_width_mm: string;
  description: string;
  quantity: string;
};

type CustomFieldState = Record<DropdownFieldKey, boolean>;

type MaterialFormProps = {
  mode: "create" | "edit";
  initialMaterial?: MaterialRecord | null;
  options: MaterialFormOptionSets;
  onCancel: () => void;
  onSuccess: (material: MaterialRecord) => void;
};

const DEFAULT_CURRENCY = "NZD";
const MAX_BULK_QUANTITY = 50;

function blankToNull(value: string) {
  return value.trim() === "" ? null : value.trim();
}

function parseNumber(value: string) {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatDropdownValue(value: unknown) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (trimmed === "") return "";
  return trimmed
    .split(/\s+/)
    .map((part) => (part.length > 0 ? part[0].toUpperCase() + part.slice(1).toLowerCase() : part))
    .join(" ");
}

function containsOption(options: string[], candidate: string) {
  return options.some(
    (option) => option.localeCompare(candidate, undefined, { sensitivity: "accent" }) === 0
  );
}

function shouldUseCustom(initial: unknown, options: string[]) {
  const formatted = formatDropdownValue(initial);
  if (formatted === "") return false;
  if (options.length === 0) return false;
  return !containsOption(options, formatted);
}

export function MaterialForm({ mode, initialMaterial, options, onCancel, onSuccess }: MaterialFormProps) {
  const { materialTypes = [], categories = [], finishes = [], colourFamilies = [] } = options;

  const workspace = useAppWorkspace();
  const tenantId = workspace.org.id;

  const [values, setValues] = useState<MaterialFormValues>(() => ({
    name: (initialMaterial?.name as string | null) ?? "",
    sku: (initialMaterial?.sku as string | null) ?? "",
    batch_number: (initialMaterial?.batch_number as string | null) ?? "",
    material_type: formatDropdownValue(initialMaterial?.material_type ?? ""),
    category: formatDropdownValue(initialMaterial?.category ?? ""),
    color_family: formatDropdownValue(initialMaterial?.color_family ?? ""),
    surface_finish: formatDropdownValue(
      (initialMaterial?.surface_finish ?? initialMaterial?.finish) ?? ""
    ),
    default_thickness_mm:
      initialMaterial?.default_thickness_mm != null
        ? String(initialMaterial.default_thickness_mm)
        : "",
    lead_time_days:
      initialMaterial?.lead_time_days != null ? String(initialMaterial.lead_time_days) : "",
    unit_cost: initialMaterial?.unit_cost != null ? String(initialMaterial.unit_cost) : "",
    currency: (initialMaterial?.currency as string | null) ?? DEFAULT_CURRENCY,
    supplier_reference: (initialMaterial?.supplier_reference as string | null) ?? "",
    slab_length_mm:
      initialMaterial?.slab_length_mm != null ? String(initialMaterial.slab_length_mm) : "",
    slab_width_mm:
      initialMaterial?.slab_width_mm != null ? String(initialMaterial.slab_width_mm) : "",
    description: (initialMaterial?.description as string | null) ?? "",
    quantity: "1",
  }));

  const [customFieldMode, setCustomFieldMode] = useState<CustomFieldState>(() => ({
    material_type: shouldUseCustom(initialMaterial?.material_type, materialTypes),
    category: shouldUseCustom(initialMaterial?.category, categories),
    surface_finish: shouldUseCustom(
      initialMaterial?.surface_finish ?? initialMaterial?.finish,
      finishes
    ),
    color_family: shouldUseCustom(
      initialMaterial?.color_family ?? initialMaterial?.color_primary,
      colourFamilies
    ),
  }));

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const { toast } = useToast();

  const handleChange = (field: keyof MaterialFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleSelectChange = (field: DropdownFieldKey) =>
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const nextValue = formatDropdownValue(event.target.value);
      setValues((current) => ({ ...current, [field]: nextValue }));
    };

  const toggleCustomField = (field: DropdownFieldKey, enabled: boolean) => {
    setCustomFieldMode((current) => ({ ...current, [field]: enabled }));
    if (!enabled) {
      setValues((current) => ({ ...current, [field]: "" }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    if (values.name.trim().length === 0) {
      setError("Material name is required.");
      return;
    }

    const quantityInput = Number.parseInt(values.quantity, 10);
    const quantity =
      mode === "create"
        ? Math.max(1, Math.min(MAX_BULK_QUANTITY, Number.isNaN(quantityInput) ? 1 : quantityInput))
        : 1;

    setError(null);
    setSubmitting(true);

    const payload = {
      name: values.name.trim(),
      sku: blankToNull(values.sku),
      batch_number: blankToNull(values.batch_number),
      material_type: blankToNull(formatDropdownValue(values.material_type)),
      category: blankToNull(formatDropdownValue(values.category)),
      color_family: blankToNull(formatDropdownValue(values.color_family)),
      surface_finish: blankToNull(formatDropdownValue(values.surface_finish)),
      default_thickness_mm: parseNumber(values.default_thickness_mm),
      lead_time_days: parseNumber(values.lead_time_days),
      unit_cost: parseNumber(values.unit_cost),
      currency: blankToNull(values.currency) ?? DEFAULT_CURRENCY,
      supplier_reference: blankToNull(values.supplier_reference),
      slab_length_mm: parseNumber(values.slab_length_mm),
      slab_width_mm: parseNumber(values.slab_width_mm),
      description: blankToNull(values.description),
    } satisfies Partial<MaterialRecord>;

    try {
      if (mode === "create") {
        if (quantity === 1) {
          const response = await supabase
            .from("materials")
            .insert({
              ...payload,
              tenant_id: tenantId,
            })
            .select("*")
            .single();

          if (response.error) {
            throw response.error;
          }

          toast({
            variant: "success",
            title: "Material added",
            description: "The material is now available when receiving inventory.",
          });

          onSuccess(response.data as MaterialRecord);
        } else {
          const insertPayload = Array.from({ length: quantity }, () => ({
            ...payload,
            tenant_id: tenantId,
          }));
          const response = await supabase
            .from("materials")
            .insert(insertPayload)
            .select("*");

          if (response.error) {
            throw response.error;
          }

          const createdRecords = (response.data ?? []) as MaterialRecord[];
          const firstRecord = createdRecords[0];

          if (!firstRecord) {
            throw new Error("Material was not created. Please try again.");
          }

          toast({
            variant: "success",
            title: `${quantity} materials added`,
            description: "Each copy is now available when receiving inventory.",
          });

          onSuccess(firstRecord);
        }
      } else if (initialMaterial?.id) {
        const response = await supabase
          .from("materials")
          .update(payload)
          .eq("id", initialMaterial.id)
          .eq("tenant_id", tenantId)
          .select("*")
          .single();

        if (response.error) {
          throw response.error;
        }

        toast({
          variant: "success",
          title: "Material updated",
          description: "Changes saved to the catalog.",
        });

        onSuccess(response.data as MaterialRecord);
      } else {
        throw new Error("Missing material identifier.");
      }
    } catch (submissionError) {
      console.error("Material save failed", submissionError);
      const message =
        typeof submissionError === "object" && submissionError !== null && "message" in submissionError
          ? String((submissionError as { message?: unknown }).message ?? "Unknown error")
          : "Unable to save material. Please try again.";
      setError(message);
      toast({ variant: "error", title: "Save failed", description: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-4">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700" htmlFor="material-name">
            Material name
          </label>
          <input
            id="material-name"
            name="name"
            required
            data-autofocus
            value={values.name}
            onChange={handleChange("name")}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
            placeholder="Eg. Calacatta Gold"
          />
        </div>

        {mode === "create" ? (
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700" htmlFor="material-quantity">
              Quantity to add
            </label>
            <input
              id="material-quantity"
              inputMode="numeric"
              min={1}
              max={MAX_BULK_QUANTITY}
              step={1}
              value={values.quantity}
              onChange={handleChange("quantity")}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="1"
            />
            <p className="text-xs text-slate-500">
              We will duplicate this material entry up to {MAX_BULK_QUANTITY} times when saving.
            </p>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700" htmlFor="material-sku">
              SKU / Code
            </label>
            <input
              id="material-sku"
              name="sku"
              value={values.sku}
              onChange={handleChange("sku")}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="MAT-001"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700" htmlFor="material-type">
              Material type
            </label>
            {customFieldMode.material_type ? (
              <div className="space-y-1">
                <input
                  id="material-type"
                  name="material_type"
                  value={values.material_type}
                  onChange={handleChange("material_type")}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="Granite"
                />
                {materialTypes.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => toggleCustomField("material_type", false)}
                    className="text-xs font-medium text-slate-500 underline-offset-2 hover:underline"
                  >
                    Choose from list
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="space-y-1">
                <select
                  id="material-type"
                  value={values.material_type}
                  onChange={handleSelectChange("material_type")}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                >
                  <option value="">Select material type</option>
                  {materialTypes.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <div className="flex items-start justify-between text-xs text-slate-500">
                  {materialTypes.length === 0 ? (
                    <span>No saved material types yet.</span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => toggleCustomField("material_type", true)}
                    className="text-xs font-medium text-slate-500 underline-offset-2 hover:underline"
                  >
                    Enter custom value
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700" htmlFor="material-batch-number">
            Batch / Lot number
          </label>
          <input
            id="material-batch-number"
            name="batch_number"
            value={values.batch_number}
            onChange={handleChange("batch_number")}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
            placeholder="Lot 24-08"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700" htmlFor="material-category">
              Category
            </label>
            {customFieldMode.category ? (
              <div className="space-y-1">
                <input
                  id="material-category"
                  name="category"
                  value={values.category}
                  onChange={handleChange("category")}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="Premium"
                />
                {categories.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => toggleCustomField("category", false)}
                    className="text-xs font-medium text-slate-500 underline-offset-2 hover:underline"
                  >
                    Choose from list
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="space-y-1">
                <select
                  id="material-category"
                  value={values.category}
                  onChange={handleSelectChange("category")}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                >
                  <option value="">Select category</option>
                  {categories.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <div className="flex items-start justify-between text-xs text-slate-500">
                  {categories.length === 0 ? <span>No saved categories yet.</span> : null}
                  <button
                    type="button"
                    onClick={() => toggleCustomField("category", true)}
                    className="text-xs font-medium text-slate-500 underline-offset-2 hover:underline"
                  >
                    Enter custom value
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700" htmlFor="material-finish">
              Finish / Surface
            </label>
            {customFieldMode.surface_finish ? (
              <div className="space-y-1">
                <input
                  id="material-finish"
                  name="surface_finish"
                  value={values.surface_finish}
                  onChange={handleChange("surface_finish")}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="Polished"
                />
                {finishes.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => toggleCustomField("surface_finish", false)}
                    className="text-xs font-medium text-slate-500 underline-offset-2 hover:underline"
                  >
                    Choose from list
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="space-y-1">
                <select
                  id="material-finish"
                  value={values.surface_finish}
                  onChange={handleSelectChange("surface_finish")}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                >
                  <option value="">Select finish</option>
                  {finishes.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <div className="flex items-start justify-between text-xs text-slate-500">
                  {finishes.length === 0 ? <span>No saved finishes yet.</span> : null}
                  <button
                    type="button"
                    onClick={() => toggleCustomField("surface_finish", true)}
                    className="text-xs font-medium text-slate-500 underline-offset-2 hover:underline"
                  >
                    Enter custom value
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700" htmlFor="material-colour">
              Colour family
            </label>
            {customFieldMode.color_family ? (
              <div className="space-y-1">
                <input
                  id="material-colour"
                  name="color_family"
                  value={values.color_family}
                  onChange={handleChange("color_family")}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="White"
                />
                {colourFamilies.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => toggleCustomField("color_family", false)}
                    className="text-xs font-medium text-slate-500 underline-offset-2 hover:underline"
                  >
                    Choose from list
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="space-y-1">
                <select
                  id="material-colour"
                  value={values.color_family}
                  onChange={handleSelectChange("color_family")}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                >
                  <option value="">Select colour family</option>
                  {colourFamilies.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <div className="flex items-start justify-between text-xs text-slate-500">
                  {colourFamilies.length === 0 ? <span>No saved colour families yet.</span> : null}
                  <button
                    type="button"
                    onClick={() => toggleCustomField("color_family", true)}
                    className="text-xs font-medium text-slate-500 underline-offset-2 hover:underline"
                  >
                    Enter custom value
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700" htmlFor="material-thickness">
              Default thickness (mm)
            </label>
            <input
              id="material-thickness"
              inputMode="decimal"
              value={values.default_thickness_mm}
              onChange={handleChange("default_thickness_mm")}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="20"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700" htmlFor="material-lead-time">
              Lead time (days)
            </label>
            <input
              id="material-lead-time"
              inputMode="numeric"
              value={values.lead_time_days}
              onChange={handleChange("lead_time_days")}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="14"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700" htmlFor="material-cost">
              Unit cost
            </label>
            <div className="flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-200">
              <input
                id="material-cost"
                inputMode="decimal"
                value={values.unit_cost}
                onChange={handleChange("unit_cost")}
                className="h-full w-full border-none bg-transparent p-0 text-sm text-slate-700 focus:outline-none"
                placeholder="120.00"
              />
              <input
                id="material-currency"
                value={values.currency}
                onChange={handleChange("currency")}
                className="h-full w-16 border-none bg-transparent p-0 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 focus:outline-none"
                placeholder={DEFAULT_CURRENCY}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700" htmlFor="material-length">
              Typical slab length (mm)
            </label>
            <input
              id="material-length"
              inputMode="decimal"
              value={values.slab_length_mm}
              onChange={handleChange("slab_length_mm")}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="3200"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700" htmlFor="material-width">
              Typical slab width (mm)
            </label>
            <input
              id="material-width"
              inputMode="decimal"
              value={values.slab_width_mm}
              onChange={handleChange("slab_width_mm")}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="1600"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700" htmlFor="material-supplier-ref">
            Supplier reference
          </label>
          <input
            id="material-supplier-ref"
            name="supplier_reference"
            value={values.supplier_reference}
            onChange={handleChange("supplier_reference")}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
            placeholder="Supplier SKU"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700" htmlFor="material-description">
            Description / Notes
          </label>
          <textarea
            id="material-description"
            rows={4}
            value={values.description}
            onChange={handleChange("description")}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
            placeholder="Include supplier, pattern, or recommended applications"
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className={cn(
            "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-slate-900 px-6 text-sm font-semibold text-white shadow-sm transition",
            submitting && "cursor-wait opacity-80"
          )}
        >
          {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {mode === "create" ? "Save material" : "Save changes"}
        </button>
      </div>
    </form>
  );
}