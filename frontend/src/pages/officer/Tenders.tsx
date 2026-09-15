const Tenders = ({
  tenders,
  setActivePage,
}: {
  tenders: any[];
  setActivePage: (page: string) => void;
}) => {

  const openTenders = tenders.filter(
    (tender) => tender.status === "OPEN"
  ).length;

  const closedTenders = tenders.filter(
    (tender) => tender.status !== "OPEN"
  ).length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">
            PROCUREMENT MANAGEMENT
          </p>

          <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Tenders
          </h2>

          <p className="mt-1 text-slate-500">
            Manage and review GeM procurement tenders
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs text-slate-400">
            TOTAL TENDERS
          </p>

          <p className="mt-1 text-xl font-bold text-slate-900">
            {tenders.length}
          </p>
        </div>
      </div>


      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

        <div className="rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl">
              ◫
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Total Tenders
              </p>

              <p className="mt-1 text-2xl font-bold">
                {tenders.length}
              </p>
            </div>

          </div>
        </div>


        <div className="rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-xl">
              ✓
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Open Tenders
              </p>

              <p className="mt-1 text-2xl font-bold text-green-600">
                {openTenders}
              </p>
            </div>

          </div>
        </div>


        <div className="rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xl">
              ◷
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Closed Tenders
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-600">
                {closedTenders}
              </p>
            </div>

          </div>
        </div>

      </div>


      {/* Tender List */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

        <div className="flex flex-col gap-2 border-b border-slate-100 p-6 md:flex-row md:items-center md:justify-between">

          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Tender List
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Active procurement opportunities and submission deadlines
            </p>
          </div>

          <span className="w-fit rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600">
            {tenders.length} tender(s)
          </span>

        </div>


        {tenders.length === 0 ? (

          <div className="p-12 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
              ◫
            </div>

            <p className="mt-4 font-semibold text-slate-700">
              No tenders found
            </p>

            <p className="mt-1 text-sm text-slate-400">
              No procurement tenders are currently available.
            </p>

          </div>

        ) : (

          <div className="divide-y divide-slate-100">

            {tenders.map((tender) => (

              <div
                key={tender.id}
                className="p-6 transition hover:bg-slate-50"
              >

                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

                  {/* Tender Info */}
                  <div className="flex gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg font-bold text-blue-600">
                      T
                    </div>

                    <div>

                      <div className="flex flex-wrap items-center gap-3">

                        <h4 className="text-lg font-bold text-slate-900">
                          {tender.tender_number}
                        </h4>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            tender.status === "OPEN"
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {tender.status}
                        </span>

                      </div>

                      <p className="mt-2 text-base font-medium text-slate-700">
                        {tender.title}
                      </p>

                      <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                        {tender.description}
                      </p>

                    </div>

                  </div>


                  {/* Deadline */}
                  <div className="min-w-[220px] rounded-xl border border-slate-200 bg-slate-50 p-4">

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Submission Deadline
                    </p>

                    <p className="mt-2 text-sm font-bold text-slate-800">
                      {tender.submission_deadline
                        ? new Date(
                            tender.submission_deadline
                          ).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Not specified"}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Tender submission closing time
                    </p>

                  </div>

                </div>


                {/* Bottom Information */}
                <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">

                  <div className="rounded-lg bg-slate-100 px-3 py-2">
                    <span className="text-xs text-slate-400">
                      Tender ID
                    </span>

                    <span className="ml-2 text-xs font-semibold text-slate-700">
                      {tender.id}
                    </span>
                  </div>


                  <div className="rounded-lg bg-blue-50 px-3 py-2">
                    <span className="text-xs text-blue-500">
                      Procurement
                    </span>

                    <span className="ml-2 text-xs font-semibold text-blue-700">
                      GeM
                    </span>
                  </div>


                  <div className="ml-auto">

                    <button
                      onClick={() => setActivePage("Bidders")}
                      className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                    >
                      View Bidders →
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>


      {/* Officer Notice */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">

        <div className="flex gap-3">

          <div className="mt-0.5 text-lg">
            ℹ️
          </div>

          <div>

            <p className="font-semibold text-blue-900">
              Tender Compliance Workflow
            </p>

            <p className="mt-1 text-sm leading-6 text-blue-700">
              Select a tender, review registered bidders and run
              document-level compliance verification before procurement
              evaluation.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};
export default Tenders;