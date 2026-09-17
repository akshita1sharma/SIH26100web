import { useEffect, useState } from "react";

type VerificationStatusProps = {
  setActivePage: (page: string) => void;
};

const VerificationStatus = ({
  setActivePage,
}: VerificationStatusProps) => {
  const [results, setResults] =
    useState<any[]>([]);

  useEffect(() => {
    fetch(
      "http://127.0.0.1:8000/verification-results"
    )
      .then((res) => res.json())
      .then((data) =>
        setResults(
          data.verification_results || []
        )
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

  return (
    <div className="space-y-6 pb-10">

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
          onClick={() =>
            setActivePage("UploadDocuments")
          }
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Upload Document
        </button>

      </header>


      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Verified
          </p>

          <p className="mt-1 text-3xl font-bold text-emerald-600">
            {
              results.filter(
                (r) =>
                  r.verification_status === "VALID"
              ).length
            }
          </p>

        </div>


        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Under Review
          </p>

          <p className="mt-1 text-3xl font-bold text-amber-600">
            {
              results.filter(
                (r) =>
                  r.verification_status ===
                  "NEEDS_REVIEW"
              ).length
            }
          </p>

        </div>


        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Issues Found
          </p>

          <p className="mt-1 text-3xl font-bold text-rose-600">
            {
              results.filter(
                (r) =>
                  r.verification_status ===
                  "INVALID"
              ).length
            }
          </p>

        </div>

      </section>


      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-6 py-4">

          <div className="flex gap-6 text-sm">

            <button className="border-b-2 border-blue-600 pb-3 font-semibold text-blue-600">
              All Documents
            </button>

            <button className="pb-3 text-slate-400">
              Verified
            </button>

            <button className="pb-3 text-slate-400">
              Under Review
            </button>

            <button className="pb-3 text-slate-400">
              Issues Found
            </button>

          </div>

        </div>


        {results.length === 0 ? (

          <div className="px-6 py-16 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-400">
              ✓
            </div>

            <h2 className="mt-4 text-base font-bold text-slate-800">
              No verification results yet
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Upload your documents to begin compliance verification.
            </p>

            <button
              onClick={() =>
                setActivePage("UploadDocuments")
              }
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

                {results.map(
                  (result, index) => (

                    <tr
                      key={result.id ?? index}
                      className="hover:bg-slate-50"
                    >

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            ▤
                          </div>

                          <span className="text-sm font-semibold text-slate-700">
                            Document #
                            {result.document_id}
                          </span>

                        </div>

                      </td>

                      <td className="px-6 py-4 text-sm font-bold text-slate-700">
                        {result.score ?? "—"}
                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusClass(
                            result.verification_status
                          )}`}
                        >
                          {result.verification_status}
                        </span>

                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${riskClass(
                            result.risk_level
                          )}`}
                        >
                          {result.risk_level || "—"}
                        </span>

                      </td>

                      <td className="max-w-xs px-6 py-4 text-xs text-slate-500">
                        {result.ai_recommendation ||
                          result.issues ||
                          "No remarks"}
                      </td>

                      <td className="px-6 py-4">

                        <button className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50">
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

    </div>
  );
};

export default VerificationStatus;