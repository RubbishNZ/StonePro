export const metadata = {
  title: "Receive items",
};

export default function ReceivePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Receive items</h1>
      <p className="text-sm text-slate-600">
        Receiving workflow coming next: select PO (optional), enter material,
        dimensions, area, and location. Photos and label printing to follow.
      </p>
    </div>
  );
}
