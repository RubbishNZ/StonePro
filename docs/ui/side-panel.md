---
title: "UI Primitives: SidePanel"
description: "Usage guide for the SidePanel component"
---

# SidePanel Component

The `SidePanel` component presents a slide-in drawer with overlay, focus trapping, and optional resizing. It keeps users in context while exposing deeper record detail or rich editing surfaces.

## Import

```tsx
import { SidePanel } from '@/components/ui/side-panel';
```

## Basic Usage

```tsx
import { useState } from 'react';
import { SidePanel } from '@/components/ui/side-panel';

export function ExampleSidePanel() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm"
        onClick={() => setOpen(true)}
      >
        Edit material
      </button>

      <SidePanel
        open={open}
        onClose={() => setOpen(false)}
        title="Update material"
        description="Adjust the details below and save your changes."
        size="lg"
        footer={
          <div className="flex w-full items-center justify-end gap-3">
            <button
              type="button"
              className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="material-form"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Save changes
            </button>
          </div>
        }
      >
        <form id="material-form" className="space-y-4">
          {/* form fields */}
        </form>
      </SidePanel>
    </>
  );
}
```

## Resizable Panels

Panels can be made resizable with a drag handle. Width preferences persist per user via `localStorage`.

```tsx
<SidePanel
  open={open}
  onClose={onClose}
  title="Material details"
  size="lg"
  resizable
  storageKey="materials.catalog.detail.width"
  minWidth={360}
  maxWidth={960}
>
  {/* panel content */}
</SidePanel>
```

- `size` determines the starting width (before loading any saved value).
- `minWidth`/`maxWidth` clamp resizing; sensible defaults prevent panels from going off-screen.
- `storageKey` must be unique per panel surface so widths are saved independently.

## Prop Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | — | Controls whether the panel is visible. |
| `onClose` | `() => void` | — | Called when the panel requests to close (close button, overlay click, Escape key). |
| `children` | `ReactNode` | — | Primary content rendered in the scrollable body region. |
| `title` | `string` | — | Heading rendered in the panel header. |
| `description` | `string` | — | Optional supporting text under the title. |
| `footer` | `ReactNode` | — | Sticky footer area for actions or status. |
| `side` | `'left' \| 'right'` | `'right'` | Choose the edge the panel slides from. |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl'` | `'lg'` | Sets the base width before any resizing or persistence. |
| `resizable` | `boolean` | `false` | Enables the drag handle and dynamic width. |
| `storageKey` | `string` | — | LocalStorage key used to persist width when `resizable` is `true`. |
| `initialWidth` | `number` | derived from `size` | Optional override for the starting width (pixels). |
| `minWidth` | `number` | `max(320, initialWidth)` | Minimum width (pixels) when resizing. |
| `maxWidth` | `number` | `960` | Maximum width (pixels) when resizing. |
| `panelClassName` | `string` | — | Extra classes merged onto the inner panel element. |
| `overlayClassName` | `string` | — | Extra classes merged onto the overlay element. |
| `closeButtonLabel` | `string` | `'Close panel'` | Accessible label for the close button. |
| `closeOnOverlayClick` | `boolean` | `true` | Disable to require explicit close actions. |
| `closeOnEsc` | `boolean` | `true` | Disable to prevent closing via the Escape key. |

## Accessibility & Behavior

- **Focus trap:** Focus stays inside the panel while open and restores to the previously focused element when closed.
- **Keyboard controls:** `Escape` triggers `onClose()` when `closeOnEsc` is true.
- **Screen reader support:** Header and description are linked via `aria-labelledby` and `aria-describedby`.
- **Body scroll lock:** Background scrolling is disabled while the panel is mounted and open.
- **Resize affordance:** The handle supports pointer and touch interactions; cursor feedback and minimum/maximum constraints prevent the panel from overlapping critical layout regions.

## Integration Tips

- Render the panel near the root of your layout; it portals to `document.body`.
- For forms, wire footer buttons to the form via `form="your-form-id"` to trigger submit from the sticky footer.
- Pair with `DataTable` or `FilterBar` to build responsive master-detail experiences.
