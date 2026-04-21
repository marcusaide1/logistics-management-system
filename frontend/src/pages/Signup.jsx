import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { useToast } from "../toast.jsx";

export function Signup() {
  const { user, register } = useAuth();
  const { push } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await register({ email, password, name: name || undefined });
      push("Account created.", "success");
    } catch (err) {
      push(err.message || "Signup failed", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Create your client account</h1>
      <p className="mt-2 text-sm text-slate-600">
        Already have an account?{" "}
        <Link className="font-medium text-sky-800 hover:underline" to="/login">
          Sign in
        </Link>
        .
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block text-sm">
          <span className="font-medium text-slate-800">Name (optional)</span>
          <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
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
            minLength={8}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span className="mt-1 block text-xs text-slate-500">Minimum 8 characters.</span>
        </label>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-sky-700 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-60"
        >
          {busy ? "Creating…" : "Create account"}
        </button>
      </form>
    </div>
  );
}
