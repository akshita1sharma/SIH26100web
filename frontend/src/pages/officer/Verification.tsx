import { useEffect, useMemo, useState } from "react";

type VerificationProps = {
  bidders?: any[];
  documents?: any[];
  verificationResults?: any[];
  selectedBidderId?: string;
  setSelectedBidderId?: (id: string) => void;
};

const API =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function Verification({
  bidders: propBidders = [],
  documents: propDocuments = [],
  verificationResults: propVerificationResults = [],
  selectedBidderId = "",
  setSelectedBidderId,
}: VerificationProps) {
  const [bidders, setBidders] = useState<any[]>(propBidders);
  const [documents, setDocuments] = useState<any[]>(propDocuments);
  const [verificationResults, setVerificationResults] =
    useState<any[]>(propVerificationResults);

  const [selectedDocumentId, setSelectedDocumentId] = useState<
    string | number | null
  >(null);

  const [documentTypeFilter, setDocumentTypeFilter] =
    useState("All Types");

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("Overview");
  const [runningVerification, setRunningVerification] = useState(false);

  // =========================
  // FETCH BACKEND DATA
  // =========================

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const [biddersRes, documentsRes, verificationRes] =
          await Promise.all([
            fetch(`${API}/bidders`),
            fetch(`${API}/documents`),
            fetch(`${API}/verification-results`),
          ]);

        if (
          !biddersRes.ok ||
          !documentsRes.ok ||
          !verificationRes.ok
        ) {
          throw new Error("Unable to load verification data");
        }

        const [biddersData, documentsData, verificationData] =
          await Promise.all([
            biddersRes.json(),
            documentsRes.json(),
            verificationRes.json(),
          ]);

        if (cancelled) return;

        setBidders(biddersData.bidders || []);
        setDocuments(documentsData.documents || []);
        setVerificationResults(
          verificationData.verification_results || []
        );
      } catch (error) {
        console.error(
          "Verification page fetch error:",
          error
        );

        if (propBidders.length) {
          setBidders(propBidders);
        }

        if (propDocuments.length) {
          setDocuments(propDocuments);
        }

        if (propVerificationResults.length) {
          setVerificationResults(propVerificationResults);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  // =========================
  // SYNC APP PROPS
  // =========================

  useEffect(() => {
    if (propBidders.length) {
      setBidders(propBidders);
    }
  }, [propBidders]);

  useEffect(() => {
    if (propDocuments.length) {
      setDocuments(propDocuments);
    }
  }, [propDocuments]);

  useEffect(() => {
    if (propVerificationResults.length) {
      setVerificationResults(propVerificationResults);
    }
  }, [propVerificationResults]);

  // =========================
  // LATEST RESULT PER DOCUMENT
  // =========================

  const latestResults = useMemo(() => {
    const map = new Map<string | number, any>();

    [...verificationResults]
      .sort((a, b) => {
        const at = new Date(
          a?.created_at || 0
        ).getTime();

        const bt = new Date(
          b?.created_at || 0
        ).getTime();

        if (at !== bt) {
          return at - bt;
        }

        return (
          Number(a?.id || 0) -
          Number(b?.id || 0)
        );
      })
      .forEach((result) => {
        if (result?.document_id != null) {
          map.set(result.document_id, result);
        }
      });

    return map;
  }, [verificationResults]);

  // =========================
  // BIDDER MAP
  // =========================

  const bidderMap = useMemo(() => {
    const map = new Map<string, any>();

    bidders.forEach((bidder) => {
      map.set(String(bidder.id), bidder);
    });

    return map;
  }, [bidders]);

  // =========================
  // HELPERS
  // =========================

  const getResult = (document: any) => {
    return latestResults.get(document?.id);
  };

  const getType = (document: any) => {
    return String(
      document?.document_type ||
        document?.type ||
        "OTHER"
    ).toUpperCase();
  };

  const getStatus = (document: any) => {
    const result = getResult(document);

    const status = String(
      result?.status ||
        document?.status ||
        ""
    ).toUpperCase();

    if (status === "VALID") {
      return "Compliant";
    }

    if (status === "INVALID") {
      return "Non-Compliant";
    }

    if (status === "NEEDS_REVIEW") {
      return "Needs Review";
    }

    return "Pending";
  };

  const getRisk = (document: any) => {
    const risk = String(
      getResult(document)?.risk_level || ""
    ).toUpperCase();

    if (risk === "CRITICAL") {
      return "Critical";
    }

    if (risk === "HIGH") {
      return "High";
    }

    if (risk === "MEDIUM") {
      return "Medium";
    }

    if (risk === "LOW") {
      return "Low";
    }

    return "Unknown";
  };

  const getBidder = (document: any) => {
    return bidderMap.get(
      String(document?.bidder_id)
    );
  };

  const getBidderName = (document: any) => {
    return (
      getBidder(document)?.company_name ||
      `Bidder #${document?.bidder_id || "—"}`
    );
  };

  // =========================
  // FILTER DOCUMENTS
  // =========================

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return documents.filter((document) => {
      const type = getType(document);
      const bidderName = getBidderName(document);

      const matchesBidder =
        !selectedBidderId ||
        String(document?.bidder_id) ===
          String(selectedBidderId);

      const matchesType =
        documentTypeFilter === "All Types" ||
        type === documentTypeFilter;

      const matchesSearch =
        !query ||
        [
          document?.file_name,
          document?.document_name,
          document?.file_path,
          document?.document_type,
          bidderName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);

      return (
        matchesBidder &&
        matchesType &&
        matchesSearch
      );
    });
  }, [
    documents,
    selectedBidderId,
    documentTypeFilter,
    search,
    bidderMap,
  ]);

  // =========================
  // AUTO SELECT DOCUMENT
  // =========================

  useEffect(() => {
    if (!filteredDocuments.length) {
      setSelectedDocumentId(null);
      return;
    }

    const stillExists =
      filteredDocuments.some(
        (document) =>
          String(document.id) ===
          String(selectedDocumentId)
      );

    if (!stillExists) {
      setSelectedDocumentId(
        filteredDocuments[0].id
      );
    }
  }, [
    filteredDocuments,
    selectedDocumentId,
  ]);

  const selectedDocument = useMemo(() => {
    return filteredDocuments.find(
      (document) =>
        String(document.id) ===
        String(selectedDocumentId)
    );
  }, [
    filteredDocuments,
    selectedDocumentId,
  ]);

  const selectedResult = selectedDocument
    ? getResult(selectedDocument)
    : null;

  const selectedBidder = selectedDocument
    ? getBidder(selectedDocument)
    : null;

  // =========================
  // SCORE
  // =========================

  const score =
    selectedResult?.score != null
      ? Number(selectedResult.score)
      : selectedResult?.match_score != null
      ? Number(selectedResult.match_score)
      : 0;

  const confidenceLabel =
    score >= 85
      ? "High Confidence"
      : score >= 60
      ? "Medium Confidence"
      : "Low Confidence";

  const resultStatus = selectedDocument
    ? getStatus(selectedDocument)
    : "Pending";

  const scoreRing = Math.max(
    0,
    Math.min(score, 100)
  );

  // =========================
  // VERIFIED DATE
  // =========================

  const verifiedOn = selectedResult?.created_at
    ? new Date(
        selectedResult.created_at
      ).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not verified yet";

  // =========================
  // ISSUE
  // =========================

  const issue =
    selectedResult?.issue_code ||
    selectedResult?.reason ||
    selectedResult?.message ||
    "";

  // =========================
  // CHECKS
  // =========================

  const checks = useMemo(
    (): Array<{
      label: string;
      passed: boolean;
    }> => {
      if (!selectedDocument) {
        return [];
      }

      const status =
        getStatus(selectedDocument);

      const risk =
        getRisk(selectedDocument);

      if (status === "Compliant") {
        return [
          {
            label: "Document verified",
            passed: true,
          },
          {
            label: `Risk level: ${risk}`,
            passed: risk === "Low",
          },
          {
            label:
              "Verification result is valid",
            passed: true,
          },
          {
            label:
              "No blocking issue detected",
            passed: !issue,
          },
        ];
      }

      if (status === "Needs Review") {
        return [
          {
            label: "Document uploaded",
            passed: true,
          },
          {
            label:
              "Verification requires officer review",
            passed: false,
          },
          {
            label: `Risk level: ${risk}`,
            passed: risk === "Low",
          },
          {
            label: issue
              ? `Issue: ${issue.replaceAll(
                  "_",
                  " "
                )}`
              : "Review required",
            passed: false,
          },
        ];
      }

      if (status === "Non-Compliant") {
        return [
          {
            label: "Document received",
            passed: true,
          },
          {
            label:
              "Compliance verification failed",
            passed: false,
          },
          {
            label: `Risk level: ${risk}`,
            passed: risk === "Low",
          },
          {
            label: issue
              ? `Issue: ${issue.replaceAll(
                  "_",
                  " "
                )}`
              : "Verification issue detected",
            passed: false,
          },
        ];
      }

      return [
        {
          label: "Document uploaded",
          passed: true,
        },
        {
          label:
            "Verification not completed",
          passed: false,
        },
        {
          label:
            "Awaiting verification result",
          passed: false,
        },
      ];
    },
    [selectedDocument, issue]
  );

  // =========================
  // STATUS COLORS
  // =========================

  const statusClasses =
    resultStatus === "Compliant"
      ? "bg-emerald-50 text-emerald-600"
      : resultStatus === "Non-Compliant"
      ? "bg-red-50 text-red-600"
      : resultStatus === "Needs Review"
      ? "bg-amber-50 text-amber-600"
      : "bg-slate-100 text-slate-500";

  // =========================
  // RUN VERIFICATION
  // =========================

  const runVerification = async () => {
    if (!selectedDocument) {
      alert("Please select a document.");
      return;
    }

    try {
      setRunningVerification(true);

      const type = getType(
        selectedDocument
      );

      let endpoint = "";

      if (type === "GST") {
        endpoint = "/documents/verify-gst";
      } else if (type === "PAN") {
        endpoint = "/documents/verify-pan";
      } else if (type === "UDYAM") {
        endpoint = "/documents/verify-udyam";
      } else if (type === "ITR") {
        endpoint = "/documents/verify-itr";
      }

      if (!endpoint) {
        alert(
          "This document type does not have a dedicated verification endpoint yet."
        );
        return;
      }

      const formData = new FormData();

      formData.append(
        "document_id",
        String(selectedDocument.id)
      );

      const response = await fetch(
        `${API}${endpoint}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Verification request failed"
        );
      }

      alert(
        "Verification completed successfully."
      );

      window.location.reload();
    } catch (error: any) {
      console.error(
        "Verification error:",
        error
      );

      alert(
        error?.message ||
          "Verification failed."
      );
    } finally {
      setRunningVerification(false);
    }
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="space-y-5">
      {/* HEADER */}

      <div>
        <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-900">
          <span className="text-blue-600">
            ✓
          </span>

          Verification
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          AI-assisted document verification
        </p>
      </div>

      {/* MAIN WORKSPACE */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[280px_minmax(0,1fr)_300px]">
        {/* ================= LEFT ================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Select Document
              </h2>

              <span className="text-xs text-slate-400">
                {filteredDocuments.length}
              </span>
            </div>

            {/* BIDDER */}

            <label className="mt-5 block text-xs font-semibold text-slate-500">
              Bidder
            </label>

            <select
              value={selectedBidderId}
              onChange={(e) =>
                setSelectedBidderId?.(
                  e.target.value
                )
              }
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600 outline-none focus:border-blue-400"
            >
              <option value="">
                All Bidders
              </option>

              {bidders.map((bidder) => (
                <option
                  key={bidder.id}
                  value={bidder.id}
                >
                  {bidder.company_name ||
                    bidder.bidder_code}
                </option>
              ))}
            </select>

            {/* DOCUMENT TYPE */}

            <label className="mt-4 block text-xs font-semibold text-slate-500">
              Document Type
            </label>

            <select
              value={documentTypeFilter}
              onChange={(e) =>
                setDocumentTypeFilter(
                  e.target.value
                )
              }
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600 outline-none focus:border-blue-400"
            >
              <option>
                All Types
              </option>

              <option>GST</option>
              <option>PAN</option>
              <option>UDYAM</option>
              <option>ITR</option>
              <option>LEGAL</option>
              <option>FINANCIAL</option>
              <option>EXPERIENCE</option>
              <option>OTHER</option>
            </select>

            {/* SEARCH */}

            <div className="relative mt-4">
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
                />
              </svg>

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search documents..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-xs outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* DOCUMENT LIST */}

          <div className="max-h-[590px] overflow-y-auto">
            {filteredDocuments.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No documents found.
              </div>
            ) : (
              filteredDocuments.map(
                (document) => {
                  const status =
                    getStatus(document);

                  const selected =
                    String(
                      document.id
                    ) ===
                    String(
                      selectedDocumentId
                    );

                  return (
                    <button
                      key={document.id}
                      onClick={() =>
                        setSelectedDocumentId(
                          document.id
                        )
                      }
                      className={`flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition ${
                        selected
                          ? "bg-blue-50"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                          status ===
                          "Compliant"
                            ? "bg-blue-50 text-blue-600"
                            : status ===
                              "Non-Compliant"
                            ? "bg-red-50 text-red-500"
                            : "bg-amber-50 text-amber-500"
                        }`}
                      >
                        {status ===
                        "Compliant"
                          ? "✓"
                          : "▤"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-slate-700">
                          {document.file_name ||
                            document.document_name ||
                            `Document #${document.id}`}
                        </p>

                        <p className="mt-1 truncate text-[11px] text-slate-400">
                          {getBidderName(
                            document
                          )}
                        </p>
                      </div>
                    </button>
                  );
                }
              )
            )}
          </div>
        </div>

        {/* ================= CENTER ================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-slate-900">
                  Verification Results
                </h2>

                <p className="mt-1 truncate text-xs text-slate-500">
                  Document:{" "}
                  {selectedDocument?.file_name ||
                    selectedDocument?.document_name ||
                    "No document selected"}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-xl px-3 py-2 text-xs font-semibold ${statusClasses}`}
              >
                {resultStatus}
              </span>
            </div>

            {/* TABS */}

            <div className="mt-5 flex border-b border-slate-100">
              {[
                "Overview",
                "AI Analysis",
                "Risk Factors",
                "History",
              ].map((tab) => (
                <button
                  key={tab}
                  onClick={() =>
                    setActiveTab(tab)
                  }
                  className={`px-4 py-3 text-xs font-semibold transition ${
                    activeTab === tab
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {!selectedDocument ? (
              <div className="flex min-h-[430px] items-center justify-center text-sm text-slate-400">
                Select a document to view
                verification results.
              </div>
            ) : activeTab ===
              "Overview" ? (
              <div className="space-y-5">
                {[
                  [
                    "Document Type",
                    getType(
                      selectedDocument
                    ),
                  ],
                  [
                    "Organization",
                    selectedBidder?.company_name ||
                      getBidderName(
                        selectedDocument
                      ),
                  ],
                  [
                    "GST Number",
                    selectedBidder?.gstin ||
                      "—",
                  ],
                  [
                    "PAN",
                    selectedBidder?.pan ||
                      "—",
                  ],
                  [
                    "Match Score",
                    selectedResult?.score !=
                    null
                      ? `${selectedResult.score}%`
                      : "—",
                  ],
                  [
                    "Verified On",
                    verifiedOn,
                  ],
                  [
                    "Verified By",
                    selectedResult
                      ? "AI Engine + Officer Review"
                      : "Pending",
                  ],
                ].map(
                  ([label, value]) => (
                    <div
                      key={label}
                      className="grid grid-cols-[150px_1fr] border-b border-slate-100 py-3"
                    >
                      <span className="text-xs font-medium text-slate-400">
                        {label}
                      </span>

                      <span
                        className={`break-all text-xs font-semibold ${
                          label ===
                            "Match Score" &&
                          score >= 80
                            ? "text-emerald-600"
                            : "text-slate-700"
                        }`}
                      >
                        {value}
                      </span>
                    </div>
                  )
                )}

                {issue && (
                  <div className="rounded-xl bg-red-50 p-4">
                    <p className="text-xs font-semibold text-red-600">
                      Verification Issue
                    </p>

                    <p className="mt-1 text-xs leading-5 text-red-500">
                      {issue.replaceAll(
                        "_",
                        " "
                      )}
                    </p>
                  </div>
                )}
              </div>
            ) : activeTab ===
              "AI Analysis" ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-blue-50 p-5">
                  <p className="text-sm font-bold text-slate-800">
                    AI Analysis
                  </p>

                  <p className="mt-2 text-xs leading-6 text-slate-600">
                    The selected document was
                    evaluated using the
                    verification result generated
                    by the backend.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-100 p-4">
                    <p className="text-xs text-slate-400">
                      Score
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      {score}/100
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 p-4">
                    <p className="text-xs text-slate-400">
                      Risk
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      {getRisk(
                        selectedDocument
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ) : activeTab ===
              "Risk Factors" ? (
              <div className="space-y-3">
                {checks.map((check) => (
                  <div
                    key={check.label}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 p-4"
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        check.passed
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-red-50 text-red-500"
                      }`}
                    >
                      {check.passed
                        ? "✓"
                        : "!"}
                    </span>

                    <span className="text-xs font-medium text-slate-700">
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-100 p-5">
                  <p className="text-xs font-semibold text-slate-400">
                    Latest verification
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {selectedResult
                      ? `${selectedResult.status} • ${verifiedOn}`
                      : "No verification history available"}
                  </p>
                </div>

                <p className="text-xs leading-6 text-slate-500">
                  The latest verification result
                  is shown for the selected document.
                </p>
              </div>
            )}

            {/* RUN VERIFICATION */}

            <div className="mt-7">
              <button
                onClick={runVerification}
                disabled={
                  runningVerification ||
                  !selectedDocument ||
                  ![
                    "GST",
                    "PAN",
                    "UDYAM",
                    "ITR",
                  ].includes(
                    getType(
                      selectedDocument
                    )
                  )
                }
                className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {runningVerification
                  ? "Running Verification..."
                  : "Run / Re-run Verification"}
              </button>
            </div>
          </div>
        </div>

        {/* ================= RIGHT ================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900">
            Verification Summary
          </h2>

          {/* SCORE RING */}

          <div className="mt-7 flex flex-col items-center">
            <div
              className="relative flex h-32 w-32 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(#10b981 0% ${scoreRing}%, #e2e8f0 ${scoreRing}% 100%)`,
              }}
            >
              <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white">
                <span className="text-2xl font-bold text-slate-900">
                  {selectedResult
                    ? `${score}%`
                    : "—"}
                </span>

                <span className="text-[10px] text-slate-400">
                  Match Score
                </span>
              </div>
            </div>

            <p className="mt-5 text-sm font-bold text-emerald-600">
              {selectedResult
                ? confidenceLabel
                : "Awaiting Result"}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {selectedResult
                ? resultStatus ===
                  "Compliant"
                  ? "Document is compliant"
                  : "Review the verification result"
                : "Document has not been verified"}
            </p>
          </div>

          {/* CHECK LIST */}

          <div className="mt-7 space-y-3">
            {checks.map((check) => (
              <div
                key={check.label}
                className="flex items-start gap-3"
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    check.passed
                      ? "bg-emerald-500 text-white"
                      : "bg-amber-100 text-amber-600"
                  }`}
                >
                  {check.passed
                    ? "✓"
                    : "!"}
                </span>

                <span className="text-xs leading-5 text-slate-600">
                  {check.label}
                </span>
              </div>
            ))}
          </div>

          {/* FULL REPORT */}

          <div className="mt-7">
            <button
              onClick={() =>
                alert(
                  "Full report can be connected to the Reports page."
                )
              }
              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              View Full Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Verification;