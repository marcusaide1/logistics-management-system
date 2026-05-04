import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../api.js";
import { useToast } from "../toast.jsx";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [stage, setStage] = useState("request");
  const [busy, setBusy] = useState(false);
  const { push } = useToast();
  const navigate = useNavigate();

  async function requestReset(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const data = await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email })
      });
      push(data.message || "If an account exists, a reset token has been created.", "success");
      if (data.resetToken) {
        setToken(data.resetToken);
      }
      setStage("reset");
    } catch (err) {
      push(err.message || "Request failed", "error");
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword(e) {
    e.preventDefault();
    if (password.length < 8) {
      push("Password must be at least 8 characters.", "error");
      return;
    }
    setBusy(true);
    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password })
      });
      push("Password reset successfully. Please sign in.", "success");
      navigate("/login");
    } catch (err) {
      push(err.message || "Reset failed", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Forgot password</h1>
      <p className="mt-2 text-sm text-slate-600">
        Enter your email to receive a password reset token.
      </p>

      {stage === "request" ? (
        <form onSubmit={requestReset} className="mt-8 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
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

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-sky-700 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-60"
          >
            {busy ? "Sending…" : "Send reset token"}
          </button>
        </form>
      ) : (
        <form onSubmit={resetPassword} className="mt-8 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="block text-sm">
            <span className="font-medium text-slate-800">Reset Token</span>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              type="text"
              autoComplete="one-time-code"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-800">New password</span>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-sky-700 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-60"
          >
            {busy ? "Resetting…" : "Reset password"}
          </button>
        </form>
      )}

      <p className="mt-4 text-sm text-slate-600">
        Remembered your password?{' '}
        <Link className="font-medium text-sky-800 hover:underline" to="/login">
          Sign in again
        </Link>
        .
      </p>
    </div>
  );
}
