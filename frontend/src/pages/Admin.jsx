import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api.js";
import { useAuth } from "../auth.jsx";
import { useToast } from "../toast.jsx";

const navBase =
  "block w-full rounded-md px-3 py-2 text-left text-sm font-medium hover:bg-slate-100";
const navActive = "bg-slate-900 text-white hover:bg-slate-900";
const navIdle = "text-slate-700";

const STATUSES = ["CREATED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "EXCEPTION"];

export function Admin() {
  const { token, user, logout } = useAuth();
  const { push } = useToast();
  const [tab, setTab] = useState("shipments");

  const [shipments, setShipments] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);

  const [createForm, setCreateForm] = useState({
    title: "Sample shipment",
    fromCity: "Houston, TX",
    toCity: "Atlanta, GA",
    clientEmail: "client@logi.local"
  });

  const [eventForm, setEventForm] = useState(() => ({}));

  const loadShipments = useCallback(async () => {
    const data = await apiFetch("/shipments", { token });
    setShipments(data.shipments || []);
  }, [token]);

  const loadUsers = useCallback(async () => {
    const data = await apiFetch("/admin/users", { token });
    setUsers(data.users || []);
  }, [token]);

  const loadPayments = useCallback(async () => {
    const data = await apiFetch("/payments", { token });
    setPayments(data.payments || []);
  }, [token]);

  const refreshAll = useCallback(async () => {
    try {
      await Promise.all([loadShipments(), loadUsers(), loadPayments()]);
    } catch (e) {
      push(e.message || "Failed to load admin data", "error");
    }
  }, [loadPayments, loadShipments, loadUsers, push]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const eventDefaults = useMemo(() => {
    const m = {};
    for (const s of shipments) {
      m[s.id] = m[s.id] || { status: "IN_TRANSIT", message: "Status update", location: "" };
    }
    return m;
  }, [shipments]);

  async function createShipment(e) {
    e.preventDefault();
    try {
      const data = await apiFetch("/shipments", {
        method: "POST",
        token,
        body: JSON.stringify({
          title: createForm.title,
          fromCity: createForm.fromCity,
          toCity: createForm.toCity,
          clientEmail: createForm.clientEmail || undefined
        })
      });
      push(`Created shipment ${data.shipment.trackingNumber}`, "success");
      await loadShipments();
    } catch (err) {
      push(err.message || "Create failed", "error");
    }
  }

  async function addEvent(shipmentId) {
    const ef = { ...(eventForm[shipmentId] || eventDefaults[shipmentId]) };
    try {
      await apiFetch(`/shipments/${shipmentId}/events`, {
        method: "POST",
        token,
        body: JSON.stringify({
          status: ef.status,
          message: ef.message,
          location: ef.location || undefined
        })
      });
      push("Event added.", "success");
      await loadShipments();
    } catch (err) {
      push(err.message || "Update failed", "error");
    }
  }

  async function markPaid(paymentId) {
    try {
      await apiFetch(`/payments/${paymentId}/mark-paid`, { method: "POST", token });
      push("Marked paid.", "success");
      await loadPayments();
    } catch (err) {
      push(err.message || "Could not update payment", "error");
    }
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row">
      <aside className="w-full shrink-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:w-56">
        <p className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Admin</p>
        <p className="mt-2 truncate px-2 text-xs text-slate-600">{user?.email}</p>
        <nav className="mt-4 space-y-1">
          <button
            type="button"
            className={`${navBase} ${tab === "shipments" ? navActive : navIdle}`}
            onClick={() => setTab("shipments")}
          >
            Shipments
          </button>
          <button type="button" className={`${navBase} ${tab === "users" ? navActive : navIdle}`} onClick={() => setTab("users")}>
            Users
          </button>
          <button
            type="button"
            className={`${navBase} ${tab === "payments" ? navActive : navIdle}`}
            onClick={() => setTab("payments")}
          >
            Payments
          </button>
        </nav>
        <button
          type="button"
          onClick={logout}
          className="mt-6 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
        >
          Log out
        </button>
      </aside>

      <section className="min-w-0 flex-1 space-y-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-bold text-slate-900">Operations console</h1>
          <button
            type="button"
            onClick={refreshAll}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        {tab === "shipments" ? (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Create shipment</h2>
              <form onSubmit={createShipment} className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="text-sm sm:col-span-2">
                  <span className="font-medium text-slate-800">Title</span>
                  <input
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                    value={createForm.title}
                    onChange={(e) => setCreateForm((s) => ({ ...s, title: e.target.value }))}
                  />
                </label>
                <label className="text-sm">
                  <span className="font-medium text-slate-800">From</span>
                  <input
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                    value={createForm.fromCity}
                    onChange={(e) => setCreateForm((s) => ({ ...s, fromCity: e.target.value }))}
                  />
                </label>
                <label className="text-sm">
                  <span className="font-medium text-slate-800">To</span>
                  <input
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                    value={createForm.toCity}
                    onChange={(e) => setCreateForm((s) => ({ ...s, toCity: e.target.value }))}
                  />
                </label>
                <label className="text-sm sm:col-span-2">
                  <span className="font-medium text-slate-800">Client email (optional)</span>
                  <input
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                    value={createForm.clientEmail}
                    onChange={(e) => setCreateForm((s) => ({ ...s, clientEmail: e.target.value }))}
                  />
                </label>
                <div className="sm:col-span-2">
                  <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                    Create
                  </button>
                </div>
              </form>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">All shipments</h2>
              <div className="mt-4 space-y-6">
                {shipments.map((s) => {
                  const ef = eventForm[s.id] || eventDefaults[s.id];
                  return (
                    <div key={s.id} className="rounded-lg border border-slate-200 p-4">
                      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                        <div>
                          <p className="font-mono text-xs text-slate-600">{s.trackingNumber}</p>
                          <p className="font-semibold text-slate-900">{s.title}</p>
                          <p className="text-sm text-slate-700">
                            {s.fromCity} → {s.toCity}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            Owner:{" "}
                            <span className="font-medium">{s.user?.email || "Unassigned"}</span> · Current:{" "}
                            <span className="font-medium">{s.status}</span>
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-2 sm:grid-cols-3">
                        <label className="text-sm">
                          <span className="font-medium text-slate-800">Status</span>
                          <select
                            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2"
                            value={ef.status}
                            onChange={(e) =>
                              setEventForm((m) => ({
                                ...m,
                                [s.id]: { ...ef, status: e.target.value }
                              }))
                            }
                          >
                            {STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="text-sm sm:col-span-2">
                          <span className="font-medium text-slate-800">Message</span>
                          <input
                            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                            value={ef.message}
                            onChange={(e) =>
                              setEventForm((m) => ({
                                ...m,
                                [s.id]: { ...ef, message: e.target.value }
                              }))
                            }
                          />
                        </label>
                        <label className="text-sm sm:col-span-3">
                          <span className="font-medium text-slate-800">Location (optional)</span>
                          <input
                            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                            value={ef.location}
                            onChange={(e) =>
                              setEventForm((m) => ({
                                ...m,
                                [s.id]: { ...ef, location: e.target.value }
                              }))
                            }
                          />
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => addEvent(s.id)}
                        className="mt-3 rounded-md bg-sky-700 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-800"
                      >
                        Add tracking event
                      </button>
                    </div>
                  );
                })}
                {shipments.length === 0 ? <p className="text-sm text-slate-600">No shipments yet.</p> : null}
              </div>
            </div>
          </div>
        ) : null}

        {tab === "users" ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Users</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Role</th>
                    <th className="py-2">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="py-3 pr-4">{u.email}</td>
                      <td className="py-3 pr-4">{u.role}</td>
                      <td className="py-3">{new Date(u.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {tab === "payments" ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Payments</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-2 pr-4">User</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td className="py-3 pr-4">{p.user?.email}</td>
                      <td className="py-3 pr-4">
                        {(p.amountCents / 100).toFixed(2)} {p.currency}
                      </td>
                      <td className="py-3 pr-4">{p.status}</td>
                      <td className="py-3">
                        {p.status === "PENDING" ? (
                          <button
                            type="button"
                            onClick={() => markPaid(p.id)}
                            className="rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
                          >
                            Mark paid
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
