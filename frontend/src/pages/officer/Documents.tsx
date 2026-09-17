import { useMemo, useState } from "react";

type Props = {
  documents?: any[];
  verificationResults?: any[];
};

export default function Documents({
  documents = [],
  verificationResults = [],
}: Props) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [type, setType] = useState("ALL");

  const getResult = (documentId: any) =>
    verificationResults.find(
      (result) =>
        String(result.document_id) ===
        String(documentId)
    );

  const filteredDocuments = useMemo(() => {
    return documents.filter((document) => {

      const result = getResult(document.id);

      const text =
        `${document.file_name || ""} ${
          document.document_type || ""
        } ${result?.verification_status || ""}`.toLowerCase();

      const matchesSearch = text.includes(
        search.toLowerCase()
      );

      const resultStatus = String(
        result?.verification_status ||
          document.status ||
          "PENDING"
      ).toUpperCase();

      const matchesStatus =
        status === "ALL" || resultStatus === status;

      const documentType = String(
        document.document_type || "OTHER"
      ).toUpperCase();

      const matchesType =
        type === "ALL" || documentType === type;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType
      );
    });
  }, [documents, verificationResults, search, status, type]);

  const types = Array.from(
    new Set(
      documents.map((d) =>
        String(d.document_type || "OTHER").toUpperCase()
      )
    )
  );

  const statusStyle = (value: string) => {
    if (
      ["VALID", "VERIFIED", "COMPLIANT"].includes(value)
    ) {
      return "bg-emerald-50 text-emerald-700";
    }

    if (
      ["NEEDS_REVIEW", "UNDER_REVIEW", "REVIEW"].includes(
        value
      )
    ) {
      return "bg-amber-50 text-amber-700";
    }

    if (
      ["INVALID", "NON_COMPLIANT", "FAILED"].includes(value)
    ) {
      return "bg-rose-50 text-rose-700";
    }

    return "bg-slate-100 text-slate-600";
  };

  return (
    <div className="space-y-6">

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
          Document Management
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Documents
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Review submitted documents and verification status.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total</p>
          <p className="mt-2 text-3xl font-bold">
            {documents.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Verified</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {
              verificationResults.filter((r) =>
                ["VALID", "VERIFIED", "COMPLIANT"].includes(
                  String(
                    r.verification_status
                  ).toUpperCase()
                )
              ).length
            }
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Needs Review
          </p>
          <p className="mt-2 text-3xl font-bold text-amber-500">
            {
              verificationResults.filter((r) =>
                ["NEEDS_REVIEW", "UNDER_REVIEW"].includes(
                  String(
                    r.verification_status
                  ).toUpperCase()
                )
              ).length
            }
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            High Risk
          </p>
          <p className="mt-2 text-3xl font-bold text-rose-600">
            {
              verificationResults.filter(
                (r) =>
                  String(r.risk_level).toUpperCase() ===
                  "HIGH"
              ).length
            }
          </p>
        </div>

      </div>

      {/* Main table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 p-5">

          <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
            >
              <option value="ALL">All Types</option>

              {types.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}

            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
            >
              <option value="ALL">All Status</option>
              <option value="VALID">Valid</option>
              <option value="NEEDS_REVIEW">
                Needs Review
              </option>
              <option value="INVALID">Invalid</option>
              <option value="PENDING">Pending</option>
            </select>

          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="min-w-full text-left text-sm">

            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">

              <tr>
                <th className="px-6 py-4">Document</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Bidder ID</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Risk</th>
              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {filteredDocuments.map(
                (document, index) => {

                  const result = getResult(
                    document.id
                  );

                  const resultStatus = String(
                    result?.verification_status ||
                      document.status ||
                      "PENDING"
                  ).toUpperCase();

                  return (
                    <tr
                      key={document.id || index}
                      className="hover:bg-slate-50"
                    >

                      <td className="px-6 py-5">

                        <p className="font-semibold text-slate-800">
                          {document.file_name ||
                            "Unnamed document"}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Document #{document.id || "—"}
                        </p>

                      </td>

                      <td className="px-6 py-5 text-slate-600">
                        {document.document_type ||
                          "OTHER"}
                      </td>

                      <td className="px-6 py-5 text-slate-600">
                        {document.bidder_id || "—"}
                      </td>

                      <td className="px-6 py-5 font-bold">
                        {result?.score ?? "—"}
                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusStyle(
                            resultStatus
                          )}`}
                        >
                          {resultStatus}
                        </span>

                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`font-semibold ${
                            String(
                              result?.risk_level
                            ).toUpperCase() === "HIGH"
                              ? "text-rose-600"
                              : String(
                                  result?.risk_level
                                ).toUpperCase() ===
                                "MEDIUM"
                              ? "text-amber-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {result?.risk_level || "—"}
                        </span>

                      </td>

                    </tr>
                  );
                }
              )}

            </tbody>

          </table>

        </div>

        {filteredDocuments.length === 0 && (
          <div className="p-12 text-center text-sm text-slate-400">
            No documents found.
          </div>
        )}

      </section>

    </div>
  );
}