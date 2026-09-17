import { useEffect, useMemo, useState } from "react";

type ReportsProps = {
  tenders?: any[];
  bidders?: any[];
  documents?: any[];
  verificationResults?: any[];
};

const API =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

function Reports({
  tenders: propTenders = [],
  bidders: propBidders = [],
  documents: propDocuments = [],
  verificationResults: propVerificationResults = [],
}: ReportsProps) {
  const [tenders, setTenders] =
    useState<any[]>(propTenders);

  const [bidders, setBidders] =
    useState<any[]>(propBidders);

  const [documents, setDocuments] =
    useState<any[]>(propDocuments);

  const [verificationResults, setVerificationResults] =
    useState<any[]>(propVerificationResults);

  const [activeReport, setActiveReport] =
    useState("Compliance Reports");

  const [reportType, setReportType] =
    useState("Compliance Overview");

  const [dateRange, setDateRange] =
    useState("Last 30 Days");

  const [generated, setGenerated] =
    useState(false);

  // =====================================================
  // FETCH REAL BACKEND DATA
  // =====================================================

  useEffect(() => {
    const loadReportsData = async () => {
      try {
        const [
          tendersRes,
          biddersRes,
          documentsRes,
          verificationRes,
        ] = await Promise.all([
          fetch(`${API}/tenders`),
          fetch(`${API}/bidders`),
          fetch(`${API}/documents`),
          fetch(`${API}/verification-results`),
        ]);

        const [
          tendersData,
          biddersData,
          documentsData,
          verificationData,
        ] = await Promise.all([
          tendersRes.json(),
          biddersRes.json(),
          documentsRes.json(),
          verificationRes.json(),
        ]);

        setTenders(
          tendersData.tenders || []
        );

        setBidders(
          biddersData.bidders || []
        );

        setDocuments(
          documentsData.documents || []
        );

        setVerificationResults(
          verificationData.verification_results || []
        );
      } catch (error) {
        console.error(
          "Reports data fetch error:",
          error
        );

        // If direct fetch fails, use App props
        setTenders(propTenders);
        setBidders(propBidders);
        setDocuments(propDocuments);
        setVerificationResults(
          propVerificationResults
        );
      }
    };

    loadReportsData();
  }, []);

  // =====================================================
  // LATEST VERIFICATION RESULT FOR EACH DOCUMENT
  // =====================================================

  const latestResults = useMemo(() => {
    const resultMap = new Map<
      string | number,
      any
    >();

    const sorted = [
      ...verificationResults,
    ].sort((a, b) => {
      const dateA = new Date(
        a?.created_at || 0
      ).getTime();

      const dateB = new Date(
        b?.created_at || 0
      ).getTime();

      if (dateA !== dateB) {
        return dateA - dateB;
      }

      return (
        Number(a?.id || 0) -
        Number(b?.id || 0)
      );
    });

    sorted.forEach((result) => {
      if (result?.document_id != null) {
        resultMap.set(
          result.document_id,
          result
        );
      }
    });

    return resultMap;
  }, [verificationResults]);

  // =====================================================
  // REAL METRICS
  // =====================================================

  const metrics = useMemo(() => {
    let compliant = 0;
    let needsReview = 0;
    let nonCompliant = 0;

    documents.forEach((document) => {
      const result = latestResults.get(
        document.id
      );

      const status = String(
        result?.status ||
          document?.status ||
          ""
      ).toUpperCase();

      if (status === "VALID") {
        compliant++;
      } else if (
        status === "NEEDS_REVIEW"
      ) {
        needsReview++;
      } else if (
        status === "INVALID"
      ) {
        nonCompliant++;
      }
    });

    return {
      tenders: tenders.length,

      bidders: bidders.length,

      documents: documents.length,

      verified:
        compliant +
        needsReview +
        nonCompliant,

      compliant,

      needsReview,

      nonCompliant,
    };
  }, [
    tenders,
    bidders,
    documents,
    latestResults,
  ]);

  // =====================================================
  // GRAPH DATA
  // =====================================================

  const chartData = useMemo(() => {
    if (documents.length === 0) {
      return [
        {
          week: "Week 1",
          compliant: 0,
          review: 0,
          nonCompliant: 0,
        },
        {
          week: "Week 2",
          compliant: 0,
          review: 0,
          nonCompliant: 0,
        },
        {
          week: "Week 3",
          compliant: 0,
          review: 0,
          nonCompliant: 0,
        },
        {
          week: "Week 4",
          compliant: 0,
          review: 0,
          nonCompliant: 0,
        },
      ];
    }

    // Sort documents by creation date
    const sortedDocuments = [
      ...documents,
    ].sort((a, b) => {
      return (
        new Date(
          a?.created_at || 0
        ).getTime() -
        new Date(
          b?.created_at || 0
        ).getTime()
      );
    });

    const total =
      sortedDocuments.length;

    const size = Math.ceil(total / 4);

    const groups = [
      sortedDocuments.slice(
        0,
        size
      ),
      sortedDocuments.slice(
        size,
        size * 2
      ),
      sortedDocuments.slice(
        size * 2,
        size * 3
      ),
      sortedDocuments.slice(
        size * 3
      ),
    ];

    return groups.map(
      (group, index) => {
        let compliant = 0;
        let review = 0;
        let nonCompliant = 0;

        group.forEach((document) => {
          const result =
            latestResults.get(
              document.id
            );

          const status = String(
            result?.status ||
              document?.status ||
              ""
          ).toUpperCase();

          if (status === "VALID") {
            compliant++;
          } else if (
            status ===
            "NEEDS_REVIEW"
          ) {
            review++;
          } else if (
            status === "INVALID"
          ) {
            nonCompliant++;
          }
        });

        return {
          week: `Week ${index + 1}`,
          compliant,
          review,
          nonCompliant,
        };
      }
    );
  }, [
    documents,
    latestResults,
  ]);

  // =====================================================
  // GRAPH MAX
  // =====================================================

  const chartMax = useMemo(() => {
    const values =
      chartData.flatMap((item) => [
        item.compliant,
        item.review,
        item.nonCompliant,
      ]);

    const max = Math.max(
      ...values,
      1
    );

    return Math.max(
      5,
      Math.ceil(max / 5) * 5
    );
  }, [chartData]);

  // =====================================================
  // GENERATE REPORT
  // =====================================================

  const generateReport = () => {
    setGenerated(true);

    setTimeout(() => {
      setGenerated(false);
    }, 2000);
  };

  // =====================================================
  // EXPORT
  // =====================================================

  const exportReport = () => {
    const content = `
GeM Verify
Compliance Report

Report Type: ${reportType}
Date Range: ${dateRange}

-----------------------------------

Total Tenders: ${metrics.tenders}
Registered Bidders: ${metrics.bidders}
Total Documents: ${metrics.documents}

Documents Verified: ${metrics.verified}
Compliant: ${metrics.compliant}
Needs Review: ${metrics.needsReview}
Non-Compliant: ${metrics.nonCompliant}

-----------------------------------

Generated from live backend data.
`;

    const blob = new Blob(
      [content],
      {
        type: "text/plain",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "gem-compliance-report.txt";

    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Reports
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Generate insights and compliance reports
        </p>
      </div>

      {/* ================================================= */}
      {/* TOP SUMMARY CARDS */}
      {/* ================================================= */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        {/* TOTAL TENDERS */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-400">
            Total Tenders
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {metrics.tenders}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            From backend
          </p>
        </div>

        {/* REGISTERED BIDDERS */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-400">
            Registered Bidders
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {metrics.bidders}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            From backend
          </p>
        </div>

        {/* TOTAL DOCUMENTS */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-400">
            Total Submitted Documents
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {metrics.documents}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            From backend
          </p>
        </div>
      </div>

      {/* ================================================= */}
      {/* REPORT TABS */}
      {/* ================================================= */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex overflow-x-auto">

          {[
            "Compliance Reports",
            "Tender Reports",
            "Bidder Reports",
            "Verification Reports",
          ].map((tab) => (
            <button
              key={tab}
              onClick={() =>
                setActiveReport(tab)
              }
              className={`whitespace-nowrap px-6 py-4 text-sm font-semibold transition ${
                activeReport === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {tab}
            </button>
          ))}

        </div>
      </div>

      {/* ================================================= */}
      {/* MAIN REPORT SECTION */}
      {/* ================================================= */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[220px_minmax(0,1fr)_250px]">

        {/* ================================================= */}
        {/* LEFT FILTER */}
        {/* ================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <label className="block text-xs font-semibold text-slate-500">
            Report Type
          </label>

          <select
            value={reportType}
            onChange={(e) =>
              setReportType(
                e.target.value
              )
            }
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs text-slate-600 outline-none focus:border-blue-400"
          >
            <option>
              Compliance Overview
            </option>

            <option>
              Compliance Detail
            </option>

            <option>
              Risk Analysis
            </option>

            <option>
              Verification Summary
            </option>
          </select>

          <label className="mt-5 block text-xs font-semibold text-slate-500">
            Date Range
          </label>

          <select
            value={dateRange}
            onChange={(e) =>
              setDateRange(
                e.target.value
              )
            }
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs text-slate-600 outline-none focus:border-blue-400"
          >
            <option>
              Last 7 Days
            </option>

            <option>
              Last 30 Days
            </option>

            <option>
              Last 90 Days
            </option>

            <option>
              All Time
            </option>
          </select>

          <button
            onClick={generateReport}
            className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {generated
              ? "Report Generated ✓"
              : "Generate Report"}
          </button>

          <button
            onClick={exportReport}
            className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            ↓ &nbsp; Export Report
          </button>

        </div>

        {/* ================================================= */}
        {/* GRAPH */}
        {/* ================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-start justify-between">

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Compliance Trend
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Latest verification results per document
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-[11px]">

              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Compliant
              </span>

              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                Needs Review
              </span>

              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                Non-Compliant
              </span>

            </div>
          </div>

          {/* GRAPH AREA */}

          <div className="mt-8 flex h-[300px]">

            {/* Y AXIS */}

            <div className="flex w-8 flex-col justify-between pb-8 text-[10px] text-slate-400">

              <span>
                {chartMax}
              </span>

              <span>
                {Math.round(
                  chartMax * 0.75
                )}
              </span>

              <span>
                {Math.round(
                  chartMax * 0.5
                )}
              </span>

              <span>
                {Math.round(
                  chartMax * 0.25
                )}
              </span>

              <span>0</span>

            </div>

            {/* GRAPH */}

            <div className="relative flex-1">

              {/* GRID */}

              <div className="absolute inset-0 bottom-8 flex flex-col justify-between">

                {[1, 2, 3, 4, 5].map(
                  (line) => (
                    <div
                      key={line}
                      className="border-t border-slate-100"
                    />
                  )
                )}

              </div>

              {/* BARS */}

              <div className="absolute inset-0 bottom-8 flex items-end justify-around px-8">

                {chartData.map(
                  (item) => (
                    <div
                      key={item.week}
                      className="flex h-full items-end gap-2"
                    >

                      {/* GREEN */}

                      <div
                        title={`Compliant: ${item.compliant}`}
                        className="w-7 rounded-t-md bg-emerald-500 transition-all duration-300"
                        style={{
                          height:
                            item.compliant ===
                            0
                              ? "0px"
                              : `${Math.max(
                                  8,
                                  (item.compliant /
                                    chartMax) *
                                    100
                                )}%`,
                        }}
                      />

                      {/* ORANGE */}

                      <div
                        title={`Needs Review: ${item.review}`}
                        className="w-7 rounded-t-md bg-amber-500 transition-all duration-300"
                        style={{
                          height:
                            item.review ===
                            0
                              ? "0px"
                              : `${Math.max(
                                  8,
                                  (item.review /
                                    chartMax) *
                                    100
                                )}%`,
                        }}
                      />

                      {/* RED */}

                      <div
                        title={`Non-Compliant: ${item.nonCompliant}`}
                        className="w-7 rounded-t-md bg-red-500 transition-all duration-300"
                        style={{
                          height:
                            item.nonCompliant ===
                            0
                              ? "0px"
                              : `${Math.max(
                                  8,
                                  (item.nonCompliant /
                                    chartMax) *
                                    100
                                )}%`,
                        }}
                      />

                    </div>
                  )
                )}

              </div>

              {/* X AXIS */}

              <div className="absolute bottom-0 left-0 right-0 flex justify-around text-[10px] text-slate-400">

                {chartData.map(
                  (item) => (
                    <span
                      key={item.week}
                    >
                      {item.week}
                    </span>
                  )
                )}

              </div>

            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* KEY METRICS */}
        {/* ================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <h2 className="text-lg font-bold text-slate-900">
            Key Metrics
          </h2>

          <div className="mt-5 space-y-3">

            {/* VERIFIED */}

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                  ▤
                </div>

                <div>

                  <p className="text-xl font-bold text-slate-900">
                    {metrics.verified}
                  </p>

                  <p className="text-[11px] text-slate-500">
                    Documents Verified
                  </p>

                </div>

              </div>

              <span className="text-xs font-bold text-emerald-500">
                Live
              </span>

            </div>

            {/* COMPLIANT */}

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  ✓
                </div>

                <div>

                  <p className="text-xl font-bold text-slate-900">
                    {metrics.compliant}
                  </p>

                  <p className="text-[11px] text-slate-500">
                    Compliant
                  </p>

                </div>

              </div>

              <span className="text-xs font-bold text-emerald-500">
                VALID
              </span>

            </div>

            {/* REVIEW */}

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  !
                </div>

                <div>

                  <p className="text-xl font-bold text-slate-900">
                    {metrics.needsReview}
                  </p>

                  <p className="text-[11px] text-slate-500">
                    Needs Review
                  </p>

                </div>

              </div>

              <span className="text-xs font-bold text-amber-500">
                REVIEW
              </span>

            </div>

            {/* NON COMPLIANT */}

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  !
                </div>

                <div>

                  <p className="text-xl font-bold text-slate-900">
                    {metrics.nonCompliant}
                  </p>

                  <p className="text-[11px] text-slate-500">
                    Non-Compliant
                  </p>

                </div>

              </div>

              <span className="text-xs font-bold text-red-500">
                INVALID
              </span>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Reports;