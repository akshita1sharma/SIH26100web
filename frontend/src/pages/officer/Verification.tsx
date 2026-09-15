const Verification = ({
  bidders,
  documents,
  verificationResults,
  selectedBidderId,
  setSelectedBidderId,
}: {
  bidders: any[];
  documents: any[];
  verificationResults: any[];
  selectedBidderId: string;
  setSelectedBidderId: (id: string) => void;
}) => {
  const bidder = bidders.find(
    (item) => String(item.id) === String(selectedBidderId)
  );

  const bidderDocuments = documents.filter(
    (document) =>
      String(document.bidder_id) === String(selectedBidderId)
  );

  const latestResults = bidderDocuments
    .map((document) => {
      const results = verificationResults.filter(
        (result) =>
          String(result.document_id) === String(document.id)
      );

      if (results.length === 0) {
        return null;
      }

      return results.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      )[0];
    })
    .filter(Boolean);

  const scores = latestResults
    .map((result: any) => Number(result.score))
    .filter((score) => !Number.isNaN(score));

  const overallScore =
    scores.length > 0
      ? (
          scores.reduce((sum, score) => sum + score, 0) /
          scores.length
        ).toFixed(2)
      : "—";

  const validCount = latestResults.filter(
    (result: any) =>
      result.verification_status === "VALID"
  ).length;

  const reviewCount = latestResults.filter(
    (result: any) =>
      result.verification_status === "NEEDS_REVIEW"
  ).length;

  const invalidCount = latestResults.filter(
    (result: any) =>
      result.verification_status === "INVALID"
  ).length;

  const numericScore = Number(overallScore);

  const risk =
    Number.isNaN(numericScore)
      ? "UNKNOWN"
      : numericScore >= 80
      ? "LOW"
      : numericScore >= 60
      ? "MEDIUM"
      : numericScore >= 30
      ? "HIGH"
      : "CRITICAL";

  const status =
    invalidCount > 0
      ? "NON-COMPLIANT"
      : reviewCount > 0
      ? "NEEDS REVIEW"
      : validCount > 0
      ? "COMPLIANT"
      : "NO DATA";

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 text-sm text-slate-400">
            Compliance / Verification
          </div>

          <h2 className="text-3xl font-bold tracking-tight">
            Bid Verification
          </h2>

          <p className="mt-1 text-slate-500">
            Review bidder documents, compliance status and risk assessment
          </p>
        </div>

        {/* Bidder Selector */}
        <div className="min-w-[280px]">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Select Bidder
          </label>

          <select
            value={selectedBidderId}
            onChange={(e) =>
              setSelectedBidderId(e.target.value)
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {bidders.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.company_name}
              </option>
            ))}
          </select>
        </div>
      </div>


      {/* Bidder Profile */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white shadow-lg">

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold">
              {bidder?.company_name?.charAt(0) || "B"}
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">
                Selected Bidder
              </p>

              <h3 className="mt-1 text-xl font-bold">
                {bidder?.company_name || "Unknown Bidder"}
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Bidder ID: {selectedBidderId}
              </p>
            </div>

          </div>

          <div className="flex flex-wrap gap-3">

            <div className="rounded-xl bg-white/10 px-4 py-3">
              <p className="text-xs text-slate-400">GSTIN</p>
              <p className="mt-1 text-sm font-medium">
                {bidder?.gstin || "—"}
              </p>
            </div>

            <div className="rounded-xl bg-white/10 px-4 py-3">
              <p className="text-xs text-slate-400">PAN</p>
              <p className="mt-1 text-sm font-medium">
                {bidder?.pan || "—"}
              </p>
            </div>

            <div className="rounded-xl bg-white/10 px-4 py-3">
              <p className="text-xs text-slate-400">Udyam</p>
              <p className="mt-1 text-sm font-medium">
                {bidder?.udyam_number || "—"}
              </p>
            </div>

          </div>

        </div>
      </div>


      {/* Score Overview */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

        {/* Score */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Compliance Score
            </p>

            <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
              OVERALL
            </span>
          </div>

          <div className="mt-5 flex items-end gap-2">
            <span className="text-4xl font-bold">
              {overallScore}
            </span>

            <span className="mb-1 text-sm text-slate-400">
              / 100
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{
                width: `${Math.min(
                  Math.max(
                    Number(overallScore) || 0,
                    0
                  ),
                  100
                )}%`,
              }}
            />
          </div>

        </div>


        {/* Risk */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">

          <p className="text-sm font-medium text-slate-500">
            Risk Assessment
          </p>

          <div className="mt-5 flex items-center gap-3">

            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                risk === "LOW"
                  ? "bg-green-100 text-green-600"
                  : risk === "MEDIUM"
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              ⚠
            </div>

            <div>
              <p className="text-2xl font-bold">
                {risk}
              </p>

              <p className="text-xs text-slate-400">
                Current risk level
              </p>
            </div>

          </div>

        </div>


        {/* Status */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">

          <p className="text-sm font-medium text-slate-500">
            Compliance Status
          </p>

          <div className="mt-5 flex items-center gap-3">

            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                status === "COMPLIANT"
                  ? "bg-green-100 text-green-600"
                  : status === "NEEDS REVIEW"
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {status === "COMPLIANT"
                ? "✓"
                : "!"}
            </div>

            <div>
              <p className="text-xl font-bold">
                {status}
              </p>

              <p className="text-xs text-slate-400">
                Verification decision
              </p>
            </div>

          </div>

        </div>

      </div>


      {/* Verification Summary */}
      <div className="grid grid-cols-3 gap-4">

        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-xs font-medium text-green-600">
            VALID
          </p>

          <p className="mt-1 text-2xl font-bold text-green-700">
            {validCount}
          </p>
        </div>

        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-xs font-medium text-yellow-600">
            NEEDS REVIEW
          </p>

          <p className="mt-1 text-2xl font-bold text-yellow-700">
            {reviewCount}
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-xs font-medium text-red-600">
            INVALID
          </p>

          <p className="mt-1 text-2xl font-bold text-red-700">
            {invalidCount}
          </p>
        </div>

      </div>


      {/* Documents */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

        <div className="flex flex-col gap-2 border-b border-slate-100 p-6 md:flex-row md:items-center md:justify-between">

          <div>
            <h3 className="text-xl font-bold">
              Document Verification
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Latest verification result for each bidder document
            </p>
          </div>

          <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600">
            {latestResults.length} verified documents
          </span>

        </div>


        {latestResults.length === 0 ? (

          <div className="p-12 text-center text-slate-500">
            No verification results found for this bidder.
          </div>

        ) : (

          <div className="divide-y divide-slate-100">

            {latestResults.map((result: any) => {

              const document = documents.find(
                (item) =>
                  String(item.id) ===
                  String(result.document_id)
              );

              return (
                <div
                  key={result.id}
                  className="p-6 transition hover:bg-slate-50"
                >

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    {/* Document */}
                    <div className="flex items-center gap-4">

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-lg">
                        📄
                      </div>

                      <div>
                        <p className="font-semibold text-slate-900">
                          {document?.file_name ||
                            `Document #${result.document_id}`}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {document?.document_type || "Document"}
                        </p>
                      </div>

                    </div>


                    {/* Status */}
                    <div className="flex flex-wrap items-center gap-6">

                      <div>
                        <p className="text-xs text-slate-400">
                          SCORE
                        </p>

                        <p className="mt-1 font-semibold">
                          {result.score ?? "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          RISK
                        </p>

                        <p
                          className={`mt-1 font-semibold ${
                            result.risk_level === "LOW"
                              ? "text-green-600"
                              : result.risk_level === "MEDIUM"
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {result.risk_level || "—"}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          result.verification_status ===
                          "VALID"
                            ? "bg-green-100 text-green-700"
                            : result.verification_status ===
                              "NEEDS_REVIEW"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {result.verification_status}
                      </span>

                    </div>

                  </div>


                  {/* Issues */}
                  {result.issues && (
                    <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4">

                      <p className="text-xs font-semibold uppercase tracking-wide text-red-500">
                        Issues Detected
                      </p>

                      <p className="mt-1 text-sm text-red-700">
                        {result.issues}
                      </p>

                    </div>
                  )}


                  {/* Recommendation */}
                  {result.ai_recommendation && (
                    <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">

                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                        AI Recommendation
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-700">
                        {result.ai_recommendation}
                      </p>

                    </div>
                  )}

                </div>
              );
            })}

          </div>
        )}

      </div>


      {/* Officer Notice */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

        <div className="flex gap-3">

          <div className="mt-0.5 text-lg">
            ℹ️
          </div>

          <div>
            <p className="font-semibold text-slate-800">
              Procurement Officer Review
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              AI verification results are advisory. Final
              qualification or disqualification remains with
              the Procurement Officer.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
export default Verification;