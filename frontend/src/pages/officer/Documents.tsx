type DocumentsProps = {
  documents: any[];
  verificationResults: any[];
};

const Documents = ({
  documents,
  verificationResults,
}: DocumentsProps) => {

  const getResult = (documentId: number) =>
    verificationResults.find(
      (r) => Number(r.document_id) === Number(documentId)
    );

  const statusClass = (status?: string) => {

    if (status === "VALID")
      return "bg-emerald-50 text-emerald-700 border-emerald-100";

    if (status === "NEEDS_REVIEW")
      return "bg-amber-50 text-amber-700 border-amber-100";

    if (status === "INVALID")
      return "bg-rose-50 text-rose-700 border-rose-100";

    return "bg-slate-50 text-slate-600 border-slate-200";
  };

  return (
    <div className="space-y-6">

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
          Document Center
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Documents
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Review submitted documents and verification status.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">

        <button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm">
          All Documents
        </button>

        <button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600">
          Verified
        </button>

        <button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600">
          Needs Review
        </button>

        <input
          placeholder="Search documents..."
          className="ml-auto rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
        />

      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-6 py-5">

          <h2 className="font-bold">
            Submitted Documents
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            {documents.length} document(s) uploaded
          </p>

        </div>

        {documents.length === 0 ? (

          <div className="px-6 py-16 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl">
              ▤
            </div>

            <p className="mt-4 font-semibold text-slate-700">
              No documents uploaded
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Uploaded bidder documents will appear here.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead className="bg-slate-50">

                <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">

                  <th className="px-6 py-4">
                    Document
                  </th>

                  <th className="px-6 py-4">
                    Type
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>

                  <th className="px-6 py-4">
                    Score
                  </th>

                  <th className="px-6 py-4">
                    Risk
                  </th>

                  <th className="px-6 py-4 text-right">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {documents.map((document) => {

                  const result = getResult(document.id);

                  return (
                    <tr
                      key={document.id}
                      className="transition hover:bg-slate-50"
                    >

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            ▤
                          </div>

                          <div>
                            <p className="font-semibold text-slate-800">
                              {document.file_name}
                            </p>

                            <p className="text-xs text-slate-400">
                              Document #{document.id}
                            </p>
                          </div>

                        </div>

                      </td>

                      <td className="px-6 py-5">

                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {document.document_type}
                        </span>

                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                            result?.verification_status
                          )}`}
                        >
                          {result?.verification_status ||
                            "NOT VERIFIED"}
                        </span>

                      </td>

                      <td className="px-6 py-5 text-sm font-bold text-slate-700">
                        {result?.score ?? "—"}
                      </td>

                      <td className="px-6 py-5 text-sm font-semibold">
                        {result?.risk_level || "—"}
                      </td>

                      <td className="px-6 py-5 text-right">

                        <button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                          View
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

      {/* Notice */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">

        <div className="flex gap-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            i
          </div>

          <div>
            <p className="text-sm font-semibold text-blue-900">
              Document Verification Notice
            </p>

            <p className="mt-1 text-sm leading-6 text-blue-800">
              Documents are analyzed using OCR and automated compliance
              checks. Flagged documents should be reviewed by the
              Procurement Officer before final tender decisions.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Documents;