import { useEffect, useState } from "react";

type VerificationStatusProps = {
  setActivePage: (page: string) => void;
};

const VerificationStatus = ({
  setActivePage,
}: VerificationStatusProps) => {
  const [results, setResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedResult, setSelectedResult] = useState<any | null>(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/verification-results")
      .then((res) => res.json())
      .then((data) =>
        setResults(data.verification_results || [])
      )
      .catch(() => setResults([]));
  }, []);

  const statusClass = (status: string) => {
    if (status === "VALID") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (status === "NEEDS_REVIEW") {
      return "bg-amber-50 text-amber-700";
    }

    return "bg-rose-50 text-rose-700";
  };

  const riskClass = (risk: string) => {
    if (risk === "LOW") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (risk === "MEDIUM") {
      return "bg-amber-50 text-amber-700";
    }

    return "bg-rose-50 text-rose-700";
  };

  // ---------------------------------------------------------
  // COUNTS
  // ---------------------------------------------------------

  const verifiedCount = results.filter(
    (r) => r.verification_status === "VALID"
  ).length;

  const reviewCount = results.filter(
    (r) => r.verification_status === "NEEDS_REVIEW"
  ).length;

  const issuesCount = results.filter(
    (r) => r.verification_status === "INVALID"
  ).length;

  // ---------------------------------------------------------
  // FILTER RESULTS
  // ---------------------------------------------------------

  const filteredResults = results.filter((result) => {
    if (activeTab === "ALL") {
      return true;
    }

    if (activeTab === "VALID") {
      return result.verification_status === "VALID";
    }

    if (activeTab === "REVIEW") {
      return result.verification_status === "NEEDS_REVIEW";
    }

    if (activeTab === "INVALID") {
      return result.verification_status === "INVALID";
    }

    return true;
  });

  // ---------------------------------------------------------
  // TAB BUTTON
  // ---------------------------------------------------------

  const tabClass = (tab: string) => {
    return activeTab === tab
      ? "border-b-2 border-blue-600 pb-3 font-semibold text-blue-600"
      : "pb-3 text-slate-400 hover:text-slate-700";
  };

  // ---------------------------------------------------------
  // FORMAT ISSUES
  // ---------------------------------------------------------

  const formatIssues = (issues: any) => {
    if (!issues) {
      return "No issues detected.";
    }

    if (Array.isArray(issues)) {
      return issues
        .map((issue) => issue.replaceAll("_", " "))
        .join(", ");
    }

    return String(issues)
      .split(",")
      .map((issue) => issue.trim().replaceAll("_", " "))
      .join(", ");
  };

  return (
    <div className="space-y-6 pb-10">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Bidder Portal
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-950">
            Verification Status
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Check the verification status of your submitted documents.
          </p>
        </div>

        <button
          onClick={() => setActivePage("UploadDocuments")}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Upload Document
        </button>

      </header>

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">

        {/* VERIFIED */}

        <button
          onClick={() => setActiveTab("VALID")}
          className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-sm text-slate-500">
            Verified
          </p>

          <p className="mt-1 text-3xl font-bold text-emerald-600">
            {verifiedCount}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Click to view verified documents
          </p>
        </button>

        {/* UNDER REVIEW */}

        <button
          onClick={() => setActiveTab("REVIEW")}
          className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-sm text-slate-500">
            Under Review
          </p>

          <p className="mt-1 text-3xl font-bold text-amber-600">
            {reviewCount}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Click to view documents under review
          </p>
        </button>

        {/* ISSUES */}

        <button
          onClick={() => setActiveTab("INVALID")}
          className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-sm text-slate-500">
            Issues Found
          </p>

          <p className="mt-1 text-3xl font-bold text-rose-600">
            {issuesCount}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Click to view documents with issues
          </p>
        </button>

      </section>

      {/* =====================================================
          DOCUMENT TABLE
      ===================================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* TABS */}

        <div className="border-b border-slate-100 px-6 py-4">

          <div className="flex gap-6 text-sm">

            <button
              onClick={() => setActiveTab("ALL")}
              className={tabClass("ALL")}
            >
              All Documents
            </button>

            <button
              onClick={() => setActiveTab("VALID")}
              className={tabClass("VALID")}
            >
              Verified
            </button>

            <button
              onClick={() => setActiveTab("REVIEW")}
              className={tabClass("REVIEW")}
            >
              Under Review
            </button>

            <button
              onClick={() => setActiveTab("INVALID")}
              className={tabClass("INVALID")}
            >
              Issues Found
            </button>

          </div>

        </div>

        {filteredResults.length === 0 ? (

          <div className="px-6 py-16 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-400">
              ✓
            </div>

            <h2 className="mt-4 text-base font-bold text-slate-800">
              No documents found
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              There are no documents in this category.
            </p>

            <button
              onClick={() => setActivePage("UploadDocuments")}
              className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Upload Documents
            </button>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[850px]">

              <thead className="bg-slate-50">

                <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">

                  <th className="px-6 py-4">
                    Document
                  </th>

                  <th className="px-6 py-4">
                    Score
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>

                  <th className="px-6 py-4">
                    Risk Level
                  </th>

                  <th className="px-6 py-4">
                    Remarks
                  </th>

                  <th className="px-6 py-4">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredResults.map(
                  (result, index) => (

                    <tr
                      key={result.id ?? index}
                      className="hover:bg-slate-50"
                    >

                      {/* DOCUMENT */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            ▤
                          </div>

                          <div>

                            <span className="text-sm font-semibold text-slate-700">
                              Document #{result.document_id}
                            </span>

                            <p className="mt-0.5 text-xs text-slate-400">
                              Verification Result #{result.id}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* SCORE */}

                      <td className="px-6 py-4 text-sm font-bold text-slate-700">
                        {result.score ?? "—"}
                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-4">

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusClass(
                            result.verification_status
                          )}`}
                        >
                          {result.verification_status}
                        </span>

                      </td>

                      {/* RISK */}

                      <td className="px-6 py-4">

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${riskClass(
                            result.risk_level
                          )}`}
                        >
                          {result.risk_level || "—"}
                        </span>

                      </td>

                      {/* REMARKS */}

                      <td className="max-w-xs px-6 py-4 text-xs text-slate-500">

                        {result.ai_recommendation ||
                          result.issues ||
                          "No remarks"}

                      </td>

                      {/* VIEW */}

                      <td className="px-6 py-4">

                        <button
                          onClick={() =>
                            setSelectedResult(result)
                          }
                          className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                        >
                          View
                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>

      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      {selectedResult && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onClick={() => setSelectedResult(null)}
        >

          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Verification Details
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Document #{selectedResult.document_id}
                </h2>

              </div>

              <button
                onClick={() => setSelectedResult(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                ✕
              </button>

            </div>

            {/* MODAL BODY */}

            <div className="space-y-5 p-6">

              {/* SCORE / STATUS / RISK */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                <div className="rounded-xl bg-slate-50 p-4">

                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Score
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {selectedResult.score ?? "—"}
                    {selectedResult.score !== null &&
                      selectedResult.score !== undefined &&
                      "/100"}
                  </p>

                </div>

                <div className="rounded-xl bg-slate-50 p-4">

                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Status
                  </p>

                  <span
                    className={`mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(
                      selectedResult.verification_status
                    )}`}
                  >
                    {selectedResult.verification_status}
                  </span>

                </div>

                <div className="rounded-xl bg-slate-50 p-4">

                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Risk Level
                  </p>

                  <span
                    className={`mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-bold ${riskClass(
                      selectedResult.risk_level
                    )}`}
                  >
                    {selectedResult.risk_level || "—"}
                  </span>

                </div>

              </div>

              {/* ISSUES */}

              <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">

                <p className="text-xs font-bold uppercase tracking-wide text-rose-600">
                  Verification Issues
                </p>

                <p className="mt-2 text-sm leading-6 text-rose-900">
                  {formatIssues(selectedResult.issues)}
                </p>

              </div>

              {/* RECOMMENDATION */}

              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">

                <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                  AI Recommendation
                </p>

                <p className="mt-2 text-sm leading-6 text-blue-900">
                  {selectedResult.ai_recommendation ||
                    "No recommendation available."}
                </p>

              </div>

              {/* EXTRACTED FIELDS */}

              {selectedResult.extracted_fields && (

                <div className="rounded-xl border border-slate-200 bg-white p-4">

                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Extracted Document Data
                  </p>

                  <div className="mt-3 space-y-2">

                    {Object.entries(
                      selectedResult.extracted_fields
                    ).map(([key, value]) => (

                      <div
                        key={key}
                        className="flex flex-col gap-1 rounded-lg bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                      >

                        <span className="text-xs font-semibold uppercase text-slate-400">
                          {key.replaceAll("_", " ")}
                        </span>

                        <span className="text-sm font-medium text-slate-700">
                          {String(value ?? "—")}
                        </span>

                      </div>

                    ))}

                  </div>

                </div>

              )}

            </div>

            {/* MODAL FOOTER */}

            <div className="flex justify-end border-t border-slate-100 px-6 py-4">

              <button
                onClick={() => setSelectedResult(null)}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default VerificationStatus;