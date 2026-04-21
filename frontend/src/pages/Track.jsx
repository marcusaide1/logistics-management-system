import { useState } from "react";
import { apiFetch } from "../api.js";
import { useToast } from "../toast.jsx";

function formatStatus(s) {
  return String(s || "")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function Track() {
  const { push } = useToast();
  const [q, setQ] = useState("");
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSearch(e) {
    e.preventDefault();
    const trackingNumber = q.trim();
    if (!trackingNumber) return;
    setLoading(true);
    setShipment(null);
    try {
      const data = await apiFetch(`/public/shipments/${encodeURIComponent(trackingNumber)}`);
      setShipment(data.shipment);
      if (!data.shipment) push("No shipment found.", "error");
    } catch (err) {
      if (err.status === 404) push("Tracking number not found.", "error");
      else push(err.message || "Lookup failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Track a shipment</h1>
      <p className="mt-3 text-slate-700">
        Enter your tracking number to see the latest status and milestone history. Try the demo number{" "}
        <span className="font-mono font-semibold">DEMO-TRACK-001</span> after seeding the database.
      </p>

      <form onSubmit={onSearch} className="mt-8 flex flex-col gap-3 sm:flex-row">
        <input
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm font-mono sm:flex-1"
          placeholder="Tracking number"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-sky-700 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-60"
        >
          {loading ? "Searching…" : "Track"}
        </button>
      </form>

      {shipment ? (
        <div className="mt-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tracking</p>
              <p className="font-mono text-lg font-semibold text-slate-900">{shipment.trackingNumber}</p>
              <p className="mt-1 text-sm text-slate-600">{shipment.title}</p>
            </div>
            <div className="rounded-md bg-slate-100 px-3 py-2 text-sm">
              <span className="font-medium text-slate-800">Current status:</span>{" "}
              <span className="text-slate-900">{formatStatus(shipment.status)}</span>
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-700">
            <span className="font-medium">Route:</span> {shipment.fromCity} → {shipment.toCity}
          </div>

          <div className="mt-8">
            <p className="text-sm font-semibold text-slate-900">Status timeline</p>
            <ol className="mt-4 space-y-4">
              {(shipment.events || []).map((ev) => (
                <li key={ev.id} className="flex gap-4">
                  <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-sky-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{formatStatus(ev.status)}</p>
                    <p className="text-sm text-slate-700">{ev.message}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(ev.createdAt).toLocaleString()}
                      {ev.location ? ` · ${ev.location}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ) : null}
    </div>
  );
}
