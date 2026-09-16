type TendersProps = {
  tenders: any[];
  setActivePage?: (page: string) => void;
};

const Tenders = ({ tenders }: TendersProps) => {

  const open = tenders.filter(
    (t) => t.status === "OPEN"
  ).length;

  const closed = tenders.length - open;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Procurement Management
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Tenders
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage and monitor GeM procurement tenders.
          </p>
        </div>

        <button className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
          + Add Tender
        </button>

      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Tenders
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {tenders.length}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
            Active
          </p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">
            {open}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Closed / Other
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-700">
            {closed}
          </p>
        </div>

      </div>

      {/* Table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">

          <div>
            <h2 className="font-bold text-slate-950">
              Tender List
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {tenders.length} tender(s) found
            </p>
          </div>

          <div className="flex gap-2">

            <input
              placeholder="Search tenders..."
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 md:w-64"
            />

            <button className="rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600">
              Filter
            </button>

          </div>

        </div>

        {tenders.length === 0 ? (
          <div className="px-6 py-16 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl">
              ◫
            </div>

            <p className="mt-4 font-semibold text-slate-700">
              No tenders found
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Create or import a tender to get started.
            </p>

          </div>
        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[800px]">

              <thead className="bg-slate-50">
                <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">

                  <th className="px-6 py-4">
                    Tender
                  </th>

                  <th className="px-6 py-4">
                    Description
                  </th>

                  <th className="px-6 py-4">
                    Deadline
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {tenders.map((tender) => (

                  <tr
                    key={tender.id}
                    className="transition hover:bg-slate-50"
                  >

                    <td className="px-6 py-5">

                      <p className="font-semibold text-slate-800">
                        {tender.tender_number}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {tender.title}
                      </p>

                    </td>

                    <td className="max-w-xs px-6 py-5">

                      <p className="truncate text-sm text-slate-500">
                        {tender.description || "—"}
                      </p>

                    </td>

                    <td className="px-6 py-5 text-sm text-slate-600">
                      {tender.submission_deadline || "—"}
                    </td>

                    <td className="px-6 py-5">

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                          tender.status === "OPEN"
                            ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-50 text-slate-600"
                        }`}
                      >
                        {tender.status}
                      </span>

                    </td>

                    <td className="px-6 py-5 text-right">

                      <button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                        View
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>
  );
};

export default Tenders;