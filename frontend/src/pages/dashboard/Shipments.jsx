import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../../api.js";
import { useAuth } from "../../auth.jsx";
import { useToast } from "../../toast.jsx";

function formatStatus(s) {
  return String(s || "")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function DashboardShipments() {
  const { token } = useAuth();
  const { push } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/shipments", { token });
      setRows(data.shipments || []);
    } catch (e) {
      push(e.message || "Failed to load shipments", "error");
    } finally {
      setLoading(false);
    }
  }, [push, token]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold text-slate-900">My shipments</h1>
        <button
          type="button"
          onClick={load}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-slate-600">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="mt-6 text-sm text-slate-600">No shipments yet. Ask your admin to assign shipments to your email.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-4">Tracking</th>
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Route</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((s) => (
                <tr key={s.id}>
                  <td className="py-3 pr-4 font-mono text-xs">{s.trackingNumber}</td>
                  <td className="py-3 pr-4">{s.title}</td>
                  <td className="py-3 pr-4 text-slate-700">
                    {s.fromCity} → {s.toCity}
                  </td>
                  <td className="py-3">{formatStatus(s.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
