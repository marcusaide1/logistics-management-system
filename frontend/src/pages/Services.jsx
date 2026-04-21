const blocks = [
  {
    id: "freight",
    title: "Freight & linehaul",
    body: "Palletized freight, regional consolidation, and scheduled departures between major hubs."
  },
  {
    id: "lastmile",
    title: "Last-mile delivery",
    body: "Residential and commercial delivery windows, proof-of-delivery, and exception workflows."
  },
  {
    id: "warehousing",
    title: "Warehousing",
    body: "Inbound receiving, inventory snapshots, and outbound staging for high-velocity SKUs."
  }
];

export function Services() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Services</h1>
      <p className="mt-3 max-w-2xl text-slate-700">
        Pick the capabilities you need—LogiFlow stitches them into an end-to-end program with shared tracking and
        reporting.
      </p>
      <div className="mt-10 space-y-8">
        {blocks.map((b) => (
          <section key={b.id} id={b.id} className="scroll-mt-28 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">{b.title}</h2>
            <p className="mt-2 text-slate-600">{b.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
