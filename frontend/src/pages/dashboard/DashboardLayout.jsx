import { NavLink, Outlet } from "react-router-dom";

const item =
  "block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 aria-[current=page]:bg-sky-100 aria-[current=page]:text-sky-900";

export function DashboardLayout() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row">
      <aside className="w-full shrink-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:w-56">
        <p className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Client</p>
        <nav className="mt-3 space-y-1">
          <NavLink to="/dashboard" end className={item}>
            Overview
          </NavLink>
          <NavLink to="/dashboard/shipments" className={item}>
            My shipments
          </NavLink>
          <NavLink to="/dashboard/payments" className={item}>
            Payments
          </NavLink>
        </nav>
      </aside>
      <section className="min-w-0 flex-1">
        <Outlet />
      </section>
    </div>
  );
}
