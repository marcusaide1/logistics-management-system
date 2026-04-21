import { Link } from "react-router-dom";
import { useAuth } from "../../auth.jsx";

export function DashboardOverview() {
  const { user } = useAuth();
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Welcome</h1>
      <p className="mt-2 text-slate-700">
        Signed in as <span className="font-medium">{user?.email}</span>.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link
          to="/dashboard/shipments"
          className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-900 hover:bg-slate-100"
        >
          View shipments →
        </Link>
        <Link
          to="/dashboard/payments"
          className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-900 hover:bg-slate-100"
        >
          Payment portal →
        </Link>
      </div>
    </div>
  );
}
