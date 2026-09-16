type BiddersProps = {
  bidders: any[];
  documents?: any[];
  verificationResults?: any[];
  setActivePage?: (page: string) => void;
  setSelectedBidderId?: (id: string) => void;
};

const Bidders = ({
  bidders,
  verificationResults = [],
  setActivePage,
  setSelectedBidderId,
}: BiddersProps) => {

  const getBidderStatus = (bidderId: number) => {

    const results = verificationResults.filter(
      (r) => Number(r.bidder_id) === Number(bidderId)
    );

    if (results.some((r) => r.verification_status === "INVALID"))
      return "NON-COMPLIANT";

    if (results.some((r) => r.verification_status === "NEEDS_REVIEW"))
      return "NEEDS REVIEW";

    if (results.some((r) => r.verification_status === "VALID"))
      return "COMPLIANT";

    return "PENDING";
  };

  const statusClass = (status: string) => {
    if (status === "COMPLIANT")
      return "bg-emerald-50 text-emerald-700 border-emerald-100";

    if (status === "NEEDS REVIEW")
      return "bg-amber-50 text-amber-700 border-amber-100";

    if (status === "NON-COMPLIANT")
      return "bg-rose-50 text-rose-700 border-rose-100";

    return "bg-slate-50 text-slate-600 border-slate-200";
  };

  return (
    <div className="space-y-6">

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Bidder Management
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Bidders
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View and manage registered procurement bidders.
          </p>
        </div>

        <button className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20">
          + Add Bidder
        </button>

      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-slate-400">
            Total Bidders
          </p>
          <p className="mt-2 text-3xl font-bold">
            {bidders.length}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
          <p className="text-xs uppercase tracking-wider text-emerald-600">
            Compliant
          </p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">
            {bidders.filter(
              (b) => getBidderStatus(b.id) === "COMPLIANT"
            ).length}
          </p>
        </div>

        <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-5">
          <p className="text-xs uppercase tracking-wider text-rose-600">
            Attention
          </p>
          <p className="mt-2 text-3xl font-bold text-rose-700">
            {bidders.filter(
              (b) =>
                getBidderStatus(b.id) === "NON-COMPLIANT" ||
                getBidderStatus(b.id) === "NEEDS REVIEW"
            ).length}
          </p>
        </div>

      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">

          <div>
            <h2 className="font-bold">
              Registered Bidders
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {bidders.length} organization(s)
            </p>
          </div>

          <input
            placeholder="Search company..."
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          />

        </div>

        {bidders.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-slate-400">
            No bidders found.
          </div>
        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead className="bg-slate-50">

                <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">

                  <th className="px-6 py-4">
                    Company
                  </th>

                  <th className="px-6 py-4">
                    GSTIN
                  </th>

                  <th className="px-6 py-4">
                    PAN
                  </th>

                  <th className="px-6 py-4">
                    Udyam
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

                {bidders.map((bidder) => {

                  const status = getBidderStatus(bidder.id);

                  return (
                    <tr
                      key={bidder.id}
                      className="hover:bg-slate-50"
                    >

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-600">
                            {bidder.company_name?.charAt(0) || "B"}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-800">
                              {bidder.company_name}
                            </p>

                            <p className="text-xs text-slate-400">
                              {bidder.bidder_code}
                            </p>
                          </div>

                        </div>

                      </td>

                      <td className="px-6 py-5 text-sm text-slate-600">
                        {bidder.gstin || "—"}
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-600">
                        {bidder.pan || "—"}
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-600">
                        {bidder.udyam_number || "—"}
                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                            status
                          )}`}
                        >
                          {status}
                        </span>

                      </td>

                      <td className="px-6 py-5 text-right">

                        <button
                          onClick={() => {
                            setSelectedBidderId?.(
                              String(bidder.id)
                            );
                            setActivePage?.("Verification");
                          }}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                        >
                          Review
                        </button>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>
  );
};

export default Bidders;