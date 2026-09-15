const Documents = ({
  documents,
  verificationResults,
}: {
  documents: any[];
  verificationResults: any[];
}) => {
  const getResultForDocument = (documentId: number) => {
    const results = verificationResults
      .filter(
        (result) => String(result.document_id) === String(documentId)
      )
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );

    return results[0];
  };

  const getDocumentStatusClass = (status: string) => {
    if (status === "VALID") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }

    if (status === "NEEDS_REVIEW") {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }

    if (status === "INVALID") {
      return "bg-red-50 text-red-700 border-red-200";
    }

    return "bg-slate-50 text-slate-600 border-slate-200";
  };

  const getRiskClass = (risk: string) => {
    if (risk === "LOW") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (risk === "MEDIUM") {
      return "bg-amber-50 text-amber-700";
    }

    if (risk === "HIGH" || risk === "CRITICAL") {
      return "bg-red-50 text-red-700";
    }

    return "bg-slate-50 text-slate-600";
  };

  const verifiedCount = documents.filter((document) => {
    const result = getResultForDocument(document.id);
    return result?.verification_status === "VALID";
  }).length;

  const reviewCount = documents.filter((document) => {
    const result = getResultForDocument(document.id);
    return result?.verification_status === "NEEDS_REVIEW";
  }).length;

  const invalidCount = documents.filter((document) => {
    const result = getResultForDocument(document.id);
    return result?.verification_status === "INVALID";
  }).length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">
            DOCUMENT MANAGEMENT
          </p>

          <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Documents
          </h2>

          <p className="mt-1 text-slate-500">
            Review uploaded bidder documents and verification results
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
          <p className="text-xs font-medium text-slate-400">
            TOTAL DOCUMENTS
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {documents.length}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Documents
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {documents.length}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <p className="text-sm text-emerald-700">
            Verified
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-700">
            {verifiedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
          <p className="text-sm text-amber-700">
            Needs Review
          </p>

          <p className="mt-2 text-3xl font-bold text-amber-700">
            {reviewCount}
          </p>
        </div>

        <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
          <p className="text-sm text-red-700">
            Invalid
          </p>

          <p className="mt-2 text-3xl font-bold text-red-700">
            {invalidCount}
          </p>
        </div>

      </div>

      {/* Document List */}
      <div className="space-y-4">

        {documents.map((document) => {
          const result = getResultForDocument(document.id);

          return (
            <div
              key={document.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >

              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                {/* Document Info */}
                <div className="flex items-start gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
                    📄
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900">
                      {document.file_name}
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-2">

                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        {document.document_type}
                      </span>

                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        Document #{document.id}
                      </span>

                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        Bidder #{document.bidder_id}
                      </span>

                    </div>
                  </div>

                </div>

                {/* Status */}
                <div className="flex flex-wrap gap-2">

                  <span
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                      result
                        ? getDocumentStatusClass(
                            result.verification_status
                          )
                        : "bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                  >
                    {result?.verification_status || "NOT VERIFIED"}
                  </span>

                  {result?.risk_level && (
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getRiskClass(
                        result.risk_level
                      )}`}
                    >
                      {result.risk_level} RISK
                    </span>
                  )}

                </div>

              </div>

              {/* Verification Details */}
              <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 md:grid-cols-3">

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Verification Score
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {result?.score !== null &&
                    result?.score !== undefined
                      ? `${result.score}/100`
                      : "Pending"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Verification
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {result?.verification_status ||
                      "Awaiting verification"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Uploaded Status
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {document.status || "UPLOADED"}
                  </p>
                </div>

              </div>

              {/* Issues */}
              {result?.issues && (
                <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                    Verification Issues
                  </p>

                  <p className="mt-1 text-sm leading-6 text-red-800">
                    {result.issues}
                  </p>
                </div>
              )}

              {/* Recommendation */}
              {result?.ai_recommendation && (
                <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    AI Recommendation
                  </p>

                  <p className="mt-1 text-sm leading-6 text-blue-900">
                    {result.ai_recommendation}
                  </p>
                </div>
              )}

            </div>
          );
        })}

        {documents.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="font-medium text-slate-600">
              No documents uploaded
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Uploaded bidder documents will appear here.
            </p>
          </div>
        )}

      </div>

      {/* Officer Notice */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
        <p className="text-sm font-semibold text-blue-900">
          Document Verification Notice
        </p>

        <p className="mt-1 text-sm leading-6 text-blue-800">
          Documents are analyzed using OCR and automated compliance
          checks. Any flagged document should be reviewed by the
          Procurement Officer before final tender decisions.
        </p>
      </div>

    </div>
  );
};
export default Documents;