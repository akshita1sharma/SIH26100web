import { useEffect, useMemo, useState } from "react";

const API =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

type Verification = {
  verification_status?: string;
  score?: number;
  risk_level?: string;
  issues?: string;
  ai_recommendation?: string;
};

type Document = {
  id: number;
  created_at?: string;
  bidder_id: string | number;
  document_type?: string;
  file_name?: string;
  version_number?: number;
  is_current?: boolean;
  valid_from?: string | null;
  valid_until?: string | null;
  validity_status?: string;
  verification?: Verification | null;
};

export default function DocumentVault() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [type, setType] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedType, setExpandedType] = useState<string | null>(null);

  const bidderId = 5;

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API}/bidders/${bidderId}/document-vault`
      );

      if (!response.ok) {
        throw new Error("Unable to load document vault.");
      }

      const data = await response.json();

      setDocuments(data.documents || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load documents.");
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = useMemo(() => {
    return documents.filter((document) => {
      const verification = document.verification;

      const text = `
        ${document.file_name || ""}
        ${document.document_type || ""}
        ${verification?.verification_status || ""}
        ${verification?.risk_level || ""}
      `.toLowerCase();

      const matchesSearch = text.includes(
        search.toLowerCase()
      );

      const verificationStatus = String(
        verification?.verification_status ||
          "PENDING"
      ).toUpperCase();

      const matchesStatus =
        status === "ALL" ||
        verificationStatus === status;

      const documentType = String(
        document.document_type || "OTHER"
      ).toUpperCase();

      const matchesType =
        type === "ALL" ||
        documentType === type;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType
      );
    });
  }, [documents, search, status, type]);

  const types = Array.from(
    new Set(
      documents.map((document) =>
        String(
          document.document_type || "OTHER"
        ).toUpperCase()
      )
    )
  );

  const currentDocuments = documents.filter(
    (document) => document.is_current === true
  );
const getVersionHistory = (documentType: string) => {
  return documents
    .filter(
      (document) =>
        String(document.document_type || "").toUpperCase() ===
        documentType.toUpperCase()
    )
    .sort(
      (a, b) =>
        (b.version_number || 0) -
        (a.version_number || 0)
    );
};
  const verifiedCount = documents.filter(
    (document) =>
      ["VALID", "VERIFIED", "COMPLIANT"].includes(
        String(
          document.verification?.verification_status
        ).toUpperCase()
      )
  ).length;

  const highRiskCount = documents.filter(
    (document) =>
      ["HIGH", "CRITICAL"].includes(
        String(
          document.verification?.risk_level
        ).toUpperCase()
      )
  ).length;

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

  const riskStyle = (risk?: string) => {
    const value = String(risk || "").toUpperCase();

    if (["HIGH", "CRITICAL"].includes(value)) {
      return "text-rose-600";
    }

    if (value === "MEDIUM") {
      return "text-amber-600";
    }

    if (value === "LOW") {
      return "text-emerald-600";
    }

    return "text-slate-400";
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
          Bidder Portal
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Document Vault
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage reusable procurement documents,
          versions and verification results.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">
            Loading document vault...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
          <p className="font-semibold text-rose-700">
            {error}
          </p>

          <button
            onClick={loadDocuments}
            className="mt-3 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main */}
      {!loading && !error && (
        <>
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Total Versions
              </p>
              <p className="mt-2 text-3xl font-bold">
                {documents.length}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Current Documents
              </p>
              <p className="mt-2 text-3xl font-bold text-blue-600">
                {currentDocuments.length}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Verified
              </p>
              <p className="mt-2 text-3xl font-bold text-emerald-600">
                {verifiedCount}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                High Risk
              </p>
              <p className="mt-2 text-3xl font-bold text-rose-600">
                {highRiskCount}
              </p>
            </div>

          </div>

          {/* Filters */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 p-5">

              <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search documents..."
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />

                <select
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value)
                  }
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
                >
                  <option value="ALL">
                    All Types
                  </option>

                  {types.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value)
                  }
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
                >
                  <option value="ALL">
                    All Status
                  </option>
                  <option value="VALID">
                    Valid
                  </option>
                  <option value="NEEDS_REVIEW">
                    Needs Review
                  </option>
                  <option value="INVALID">
                    Invalid
                  </option>
                  <option value="PENDING">
                    Pending
                  </option>
                </select>

              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">

              <table className="min-w-full text-left text-sm">

                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                
                <tr>
                  <th className="px-6 py-4">Document</th>
                  <th className="px-6 py-4">Version</th>
                  <th className="px-6 py-4">Verification</th>
                  <th className="px-6 py-4">Validity</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Risk</th>
                  <th className="px-6 py-4">History</th>
                </tr>
                
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredDocuments.map((document) => {
  const verification = document.verification;

  const verificationStatus = String(
    verification?.verification_status || "PENDING"
  ).toUpperCase();

  const validityStatus = String(
    document.validity_status || "NOT_AVAILABLE"
  ).toUpperCase();

  const documentType = String(
    document.document_type || "OTHER"
  ).toUpperCase();

  const isExpanded = expandedType === documentType;

  const versionHistory = getVersionHistory(documentType);

  return (
    <>
      {/* Current document row */}
      <tr
        key={document.id}
        className="hover:bg-slate-50"
      >
        {/* Document */}
        <td className="px-6 py-5">
          <p className="font-semibold text-slate-800">
            {document.document_type || "OTHER"}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {document.file_name || "Unnamed document"}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Document #{document.id}
          </p>
        </td>

        {/* Version */}
        <td className="px-6 py-5">
          <span className="font-semibold">
            v{document.version_number ?? "—"}
          </span>

          {document.is_current && (
            <span className="ml-2 rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
              CURRENT
            </span>
          )}
        </td>

        {/* Verification */}
        <td className="px-6 py-5">
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusStyle(
              verificationStatus
            )}`}
          >
            {verificationStatus}
          </span>
        </td>

        {/* Validity */}
        <td className="px-6 py-5">
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
            {validityStatus.replace("_", " ")}
          </span>
        </td>

        {/* Score */}
        <td className="px-6 py-5 font-bold">
          {verification?.score ?? "—"}
        </td>

        {/* Risk */}
        <td className="px-6 py-5">
          <span
            className={`font-semibold ${riskStyle(
              verification?.risk_level
            )}`}
          >
            {verification?.risk_level || "—"}
          </span>
        </td>

        {/* Version History */}
        <td className="px-6 py-5">
          {document.is_current && (
            <button
              type="button"
              onClick={() =>
                setExpandedType(
                  isExpanded ? null : documentType
                )
              }
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {isExpanded
                ? "Hide History"
                : "Version History"}
            </button>
          )}
        </td>
      </tr>

      {/* Version history */}
      {document.is_current && isExpanded && (
        <tr>
          <td
            colSpan={7}
            className="bg-slate-50 px-6 py-5"
          >
            <div className="rounded-xl border border-slate-200 bg-white p-4">

              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">
                    {documentType} Version History
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Previous versions of this document
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                  {versionHistory.length} versions
                </span>
              </div>

              <div className="space-y-2">

                {versionHistory.map((version) => {
                  const versionVerification =
                    version.verification;

                  const versionStatus = String(
                    versionVerification?.verification_status ||
                      "PENDING"
                  ).toUpperCase();

                  return (
                    <div
                      key={version.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3"
                    >
                      <div className="flex items-center gap-4">

                        <span className="font-bold text-slate-800">
                          v{version.version_number}
                        </span>

                        {version.is_current && (
                          <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">
                            CURRENT
                          </span>
                        )}

                        <span className="text-sm text-slate-500">
                          {version.file_name}
                        </span>

                      </div>

                      <div className="flex items-center gap-4">

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyle(
                            versionStatus
                          )}`}
                        >
                          {versionStatus}
                        </span>

                        <span className="text-xs font-semibold text-slate-500">
                          Score:{" "}
                          {versionVerification?.score ?? "—"}
                        </span>

                        <span
                          className={`text-xs font-semibold ${riskStyle(
                            versionVerification?.risk_level
                          )}`}
                        >
                          {versionVerification?.risk_level || "—"}
                        </span>

                      </div>
                    </div>
                  );
                })}

              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
})}

                </tbody>
              </table>
            </div>

            {filteredDocuments.length === 0 && (
              <div className="p-12 text-center text-sm text-slate-400">
                No documents found.
              </div>
            )}

          </section>
        </>
      )}
    </div>
  );
}