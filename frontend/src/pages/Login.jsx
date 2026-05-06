import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { useToast } from "../toast.jsx";

export function Login() {
  const { user, login } = useAuth();
  const { push } = useToast();
  const loc = useLocation();
  const from = loc.state?.from || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) {
    if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
    return <Navigate to={from} replace />;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const u = await login(email, password);
      push(`Welcome back${u.name ? `, ${u.name}` : ""}.`, "success");
    } catch (err) {
      push(err.message || "Login failed", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Client login</h1>
      <p className="mt-2 text-sm text-slate-600">
        New here?{" "}
        <Link className="font-medium text-sky-800 hover:underline" to="/signup">
          Create an account
        </Link>
        . Admin?{" "}
        <Link className="font-medium text-sky-800 hover:underline" to="/admin-login">
          Admin login
        </Link>
        .
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block text-sm">
          <span className="font-medium text-slate-800">Email</span>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            type="email"
            autoComplete="email"
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
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <div className="text-right text-sm">
          <Link className="font-medium text-sky-800 hover:underline" to="/forgot-password">
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-sky-700 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
