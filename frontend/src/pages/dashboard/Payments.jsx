import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../api.js";
import { useAuth } from "../../auth.jsx";
import { useToast } from "../../toast.jsx";

export function DashboardPayments() {
  const { token } = useAuth();
  const { push } = useToast();
  const [payments, setPayments] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [amount, setAmount] = useState("49.99");
  const [shipmentId, setShipmentId] = useState("");
  const [loading, setLoading] = useState(true);

  const shipmentOptions = useMemo(() => shipments.map((s) => ({ id: s.id, label: `${s.trackingNumber} — ${s.title}` })), [shipments]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, s] = await Promise.all([apiFetch("/payments", { token }), apiFetch("/shipments", { token })]);
      setPayments(p.payments || []);
      setShipments(s.shipments || []);
    } catch (e) {
      push(e.message || "Failed to load payments", "error");
    } finally {
      setLoading(false);
    }
  }, [push, token]);

  useEffect(() => {
    load();
  }, [load]);

  async function checkout(e) {
    e.preventDefault();
    const dollars = Number(amount);
    if (!Number.isFinite(dollars) || dollars <= 0) {
      push("Enter a valid amount.", "error");
      return;
    }
    const amountCents = Math.round(dollars * 100);
    try {
      await apiFetch("/payments/checkout", {
        method: "POST",
        token,
        body: JSON.stringify({
          amountCents,
          currency: "USD",
          shipmentId: shipmentId || undefined
        })
      });
      push("Checkout created (demo). Admin can mark it paid.", "success");
      setAmount("49.99");
      await load();
    } catch (err) {
      push(err.message || "Checkout failed", "error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Payment portal</h1>
        <p className="mt-2 text-sm text-slate-600">
          This is a starter flow: it records a pending payment in the database. Replace with Stripe/PayPal for real
          card processing.
        </p>

        <form onSubmit={checkout} className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-1">
            <span className="font-medium text-slate-800">Amount (USD)</span>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
          <label className="block text-sm sm:col-span-1">
            <span className="font-medium text-slate-800">Link to shipment (optional)</span>
            <select
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2"
              value={shipmentId}
              onChange={(e) => setShipmentId(e.target.value)}
            >
              <option value="">— None —</option>
              {shipmentOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <div className="sm:col-span-2">
            <button type="submit" className="rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800">
              Create checkout
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Your payments</h2>
        {loading ? (
          <p className="mt-4 text-sm text-slate-600">Loading…</p>
        ) : payments.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">No payments yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2">Shipment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 pr-4">{p.status}</td>
                    <td className="py-3 pr-4">
                      {(p.amountCents / 100).toFixed(2)} {p.currency}
                    </td>
                    <td className="py-3 font-mono text-xs text-slate-700">{p.shipment?.trackingNumber || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
