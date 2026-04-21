import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { useToast } from "../toast.jsx";

export function AdminLogin() {
  const { user, login, logout } = useAuth();
  const { push } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (user?.role === "ADMIN") return <Navigate to="/admin" replace />;
  if (user?.role === "CLIENT") return <Navigate to="/dashboard" replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const u = await login(email, password);
      if (u.role !== "ADMIN") {
        logout();
        push("This account is not an admin.", "error");
      } else {
        push("Admin session started.", "success");
      }
    } catch (err) {
      push(err.message || "Login failed", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Admin login</h1>
      <p className="mt-2 text-sm text-slate-600">
        Clients should use{" "}
        <Link className="font-medium text-sky-800 hover:underline" to="/login">
          client login
        </Link>
        .
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block text-sm">
          <span className="font-medium text-slate-800">Email</span>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-800">Password</span>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-slate-900 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in as admin"}
        </button>
      </form>
    </div>
  );
}
