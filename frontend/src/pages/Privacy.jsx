export function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Privacy policy</h1>
      <p className="mt-4 text-slate-700">
        This demo application stores account, shipment, and contact information in a database you control. Do not use
        production secrets in local development.
      </p>
      <p className="mt-4 text-slate-700">
        For a production deployment, publish a full privacy policy describing data categories, retention, subprocessors,
        and user rights.
      </p>
    </div>
  );
}
