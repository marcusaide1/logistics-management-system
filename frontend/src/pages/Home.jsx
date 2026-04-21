import { Link } from "react-router-dom";

export function Home() {
  return (
    <div>
      <section className="border-b border-slate-200 bg-gradient-to-b from-slate-100 to-slate-200/60">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-800">Logistics you can trust</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Move freight faster—with full visibility from dock to door.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-700">
            LogiFlow coordinates pickup, linehaul, and last-mile delivery. Track every milestone, pay invoices online,
            and reach our team when you need help.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/track"
              className="inline-flex items-center justify-center rounded-md bg-sky-700 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-800"
            >
              Track a shipment
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              Talk to sales
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="text-xl font-semibold text-slate-900">Why teams choose LogiFlow</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Live tracking",
              body: "Milestone updates with location context so customers stay informed."
            },
            {
              title: "Operational rigor",
              body: "Exception handling, SLA visibility, and proactive status changes."
            },
            {
              title: "Payments in one place",
              body: "Create checkout records and reconcile shipments with invoices."
            }
          ].map((c) => (
            <div key={c.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="font-semibold text-slate-900">{c.title}</p>
              <p className="mt-2 text-sm text-slate-600">{c.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
