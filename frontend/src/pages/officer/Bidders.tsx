const Bidders = ({
  bidders,
  documents,
  verificationResults,
  setActivePage,
  setSelectedBidderId,
}: {
  bidders: any[];
  documents: any[];
  verificationResults: any[];
  setActivePage: (page: string) => void;
  setSelectedBidderId: (id: string) => void;
}) => {
  const getBidderDocuments = (bidderId: number) =>
    documents.filter(
      (document) => String(document.bidder_id) === String(bidderId)
    );

  const getLatestResults = (bidderId: number) => {
    const bidderDocs = getBidderDocuments(bidderId);

    return bidderDocs
      .map((doc) => {
        const results = verificationResults
          .filter(
            (result) => String(result.document_id) === String(doc.id)
          )
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );

        return results[0];
      })
      .filter(Boolean);
  };

  const getBidderScore = (bidderId: number) => {
    const results = getLatestResults(bidderId);
    const scores = results
      .map((result) => result.score)
      .filter((score) => score !== null);

    if (!scores.length) return null;

    return Math.round(
      scores.reduce((sum, score) => sum + Number(score), 0) /
        scores.length
    );
  };

  const getBidderStatus = (bidderId: number) => {
    const results = getLatestResults(bidderId);

    if (results.some((r) => r.verification_status === "INVALID")) {
      return "NON_COMPLIANT";
    }

    if (results.some((r) => r.verification_status === "NEEDS_REVIEW")) {
      return "NEEDS_REVIEW";
    }

    if (results.length > 0) {
      return "COMPLIANT";
    }

    return "PENDING";
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">
            BIDDER MANAGEMENT
          </p>

          <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Bidders
          </h2>

          <p className="mt-1 text-slate-500">
            Review bidder profiles and compliance status
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
          <p className="text-xs font-medium text-slate-400">
            REGISTERED BIDDERS
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {bidders.length}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Bidders</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {bidders.length}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <p className="text-sm text-emerald-700">Compliant</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">
            {
              bidders.filter(
                (bidder) =>
                  getBidderStatus(bidder.id) === "COMPLIANT"
              ).length
            }
          </p>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
          <p className="text-sm text-amber-700">Needs Review</p>
          <p className="mt-2 text-3xl font-bold text-amber-700">
            {
              bidders.filter(
                (bidder) =>
                  getBidderStatus(bidder.id) === "NEEDS_REVIEW"
              ).length
            }
          </p>
        </div>

        <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
          <p className="text-sm text-red-700">Non-Compliant</p>
          <p className="mt-2 text-3xl font-bold text-red-700">
            {
              bidders.filter(
                (bidder) =>
                  getBidderStatus(bidder.id) === "NON_COMPLIANT"
              ).length
            }
          </p>
        </div>

      </div>

      {/* Bidder Cards */}
      <div className="space-y-4">

        {bidders.map((bidder) => {
          const bidderDocuments = getBidderDocuments(bidder.id);
          const score = getBidderScore(bidder.id);
          const status = getBidderStatus(bidder.id);

          const statusClass =
            status === "COMPLIANT"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : status === "NEEDS_REVIEW"
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : status === "NON_COMPLIANT"
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-slate-50 text-slate-600 border-slate-200";

          return (
            <div
              key={bidder.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >

              {/* Top */}
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                <div className="flex items-start gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg font-bold text-blue-600">
                    {bidder.company_name
                      ?.charAt(0)
                      ?.toUpperCase() || "B"}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {bidder.company_name || "Unnamed Bidder"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Bidder Code:{" "}
                      <span className="font-medium text-slate-700">
                        {bidder.bidder_code || "N/A"}
                      </span>
                    </p>
                  </div>

                </div>

                <div
                  className={`inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${statusClass}`}
                >
                  {status.replace("_", " ")}
                </div>

              </div>

              {/* Details */}
              <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 md:grid-cols-3">

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    GSTIN
                  </p>
                  <p className="mt-1 font-mono text-sm text-slate-700">
                    {bidder.gstin || "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    PAN
                  </p>
                  <p className="mt-1 font-mono text-sm text-slate-700">
                    {bidder.pan || "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    UDYAM
                  </p>
                  <p className="mt-1 font-mono text-sm text-slate-700">
                    {bidder.udyam_number || "Not available"}
                  </p>
                </div>

              </div>

              {/* Bottom Metrics */}
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    DOCUMENTS
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {bidderDocuments.length}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    COMPLIANCE SCORE
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {score !== null ? `${score}/100` : "Pending"}
                  </p>
                </div>

                <div className="flex items-end justify-end">
                  <button
                    onClick={() => {
                      setSelectedBidderId(String(bidder.id));
                      setActivePage("Verification");
                    }}
                    className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    View Compliance →
                  </button>
                </div>

              </div>

            </div>
          );
        })}

        {bidders.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="font-medium text-slate-600">
              No bidders found
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Add bidder data to begin compliance verification.
            </p>
          </div>
        )}

      </div>

      {/* Officer Notice */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
        <p className="text-sm font-semibold text-blue-900">
          Procurement Officer Notice
        </p>

        <p className="mt-1 text-sm leading-6 text-blue-800">
          Bidder compliance results are generated from available
          verification data. Final qualification or disqualification
          remains with the Procurement Officer.
        </p>
      </div>

    </div>
  );
};

export default Bidders;