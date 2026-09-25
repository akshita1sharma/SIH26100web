import { useMemo, useState } from "react";

type DashboardProps = {
  tenders?: any[];
  bidders?: any[];
  documents?: any[];
  verificationResults?: any[];
  setActivePage?: (page: string) => void;
  onLogout?: () => void;
};
function Dashboard({
  tenders: propTenders = [],
  bidders: propBidders = [],
  documents: propDocuments = [],
  verificationResults: propVerificationResults = [],
  setActivePage,
}: DashboardProps) {
  /*
   * IMPORTANT:
   * App.tsx already loads all backend data and passes it here.
   * Dashboard should NOT make duplicate backend requests.
   */

  const tenders = propTenders;
  const bidders = propBidders;
  const documents = propDocuments;
  const verificationResults = propVerificationResults;

  const [search, setSearch] = useState("");
  const [showProfile, setShowProfile] = useState(false);

  // Same document can have multiple verification attempts.
  // We use the latest result for dashboard-level document statistics.
  const latestVerificationResults = useMemo(() => {
    const latest = new Map<string | number, any>();

    [...verificationResults]
      .sort((a, b) => {
        const aTime = new Date(
          a?.created_at || 0
        ).getTime();

        const bTime = new Date(
          b?.created_at || 0
        ).getTime();

        if (aTime !== bTime) {
          return aTime - bTime;
        }

        return (
          Number(a?.id || 0) -
          Number(b?.id || 0)
        );
      })
      .forEach((result) => {
        if (result?.document_id != null) {
          latest.set(
            result.document_id,
            result
          );
        }
      });

    return Array.from(
      latest.values()
    );
  }, [verificationResults]);

  // ============================================================
  // DASHBOARD STATISTICS
  // ============================================================

  const stats = useMemo(() => {
    const activeTenders =
      tenders.filter((tender) => {
        const status = String(
          tender?.status || ""
        ).toUpperCase();

        return [
          "OPEN",
          "PUBLISHED",
          "ACTIVE",
          "UNDER_EVALUATION",
        ].includes(status);
      }).length;

    const verificationCompleted =
      latestVerificationResults.filter(
        (result) =>
          String(
            result?.status || ""
          ).toUpperCase() === "VALID"
      ).length;

    const highRiskCases =
      latestVerificationResults.filter(
        (result) => {
          const risk = String(
            result?.risk_level || ""
          ).toUpperCase();

          return (
            risk === "HIGH" ||
            risk === "CRITICAL"
          );
        }
      ).length;

    const needsReview =
      latestVerificationResults.filter(
        (result) =>
          String(
            result?.status || ""
          ).toUpperCase() ===
          "NEEDS_REVIEW"
      ).length;

    const invalid =
      latestVerificationResults.filter(
        (result) =>
          String(
            result?.status || ""
          ).toUpperCase() === "INVALID"
      ).length;

    return {
      activeTenders,
      totalBidders:
        bidders.length,
      documentsSubmitted:
        documents.length,
      verificationCompleted,
      highRiskCases,
      needsReview,
      invalid,
    };
  }, [
    tenders,
    bidders,
    documents,
    latestVerificationResults,
  ]);

  // ============================================================
  // VERIFICATION DISTRIBUTION
  // ============================================================

  const verificationDistribution =
    useMemo(() => {
      const valid =
        latestVerificationResults.filter(
          (result) =>
            String(
              result?.status || ""
            ).toUpperCase() ===
            "VALID"
        ).length;

      const review =
        latestVerificationResults.filter(
          (result) =>
            String(
              result?.status || ""
            ).toUpperCase() ===
            "NEEDS_REVIEW"
        ).length;

      const invalid =
        latestVerificationResults.filter(
          (result) =>
            String(
              result?.status || ""
            ).toUpperCase() ===
            "INVALID"
        ).length;

      const total =
        valid + review + invalid;

      return {
        valid,
        review,
        invalid,
        total,
        validPercent: total
          ? (valid / total) * 100
          : 0,
        reviewPercent: total
          ? (review / total) * 100
          : 0,
        invalidPercent: total
          ? (invalid / total) * 100
          : 0,
      };
    }, [latestVerificationResults]);

  // ============================================================
  // PROCUREMENT ACTIVITY
  // ============================================================

  const activity = useMemo(() => {
    const allItems = [
      ...tenders.map((item) => ({
        date: item?.created_at,
      })),

      ...bidders.map((item) => ({
        date: item?.created_at,
      })),

      ...documents.map((item) => ({
        date: item?.created_at,
      })),

      ...verificationResults.map(
        (item) => ({
          date: item?.created_at,
        })
      ),
    ];

    const grouped =
      new Map<string, number>();

    allItems.forEach((item) => {
      if (!item.date) return;

      const date = new Date(
        item.date
      );

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return;
      }

      const key =
        date.toLocaleDateString(
          "en-GB",
          {
            day: "2-digit",
            month: "short",
          }
        );

      grouped.set(
        key,
        (grouped.get(key) || 0) + 1
      );
    });

    return Array.from(
      grouped.entries()
    )
      .slice(-7)
      .map(
        ([date, count]) => ({
          date,
          count,
        })
      );
  }, [
    tenders,
    bidders,
    documents,
    verificationResults,
  ]);

  // ============================================================
  // SEARCH
  // ============================================================

  const filteredTenders =
    useMemo(() => {
      if (!search.trim()) {
        return tenders;
      }

      const query =
        search.toLowerCase();

      return tenders.filter(
        (tender) =>
          [
            tender?.tender_number,
            tender?.title,
            tender?.description,
            tender?.status,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(query)
      );
    }, [tenders, search]);

  const maxActivity = Math.max(
    ...activity.map(
      (item) => item.count
    ),
    1
  );

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="space-y-8">

      {/* ======================================================
          TOP TOOLBAR
      ====================================================== */}

      <div className="flex items-center justify-between">

        <div className="relative w-[420px]">

          <svg
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
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
              setSearch(
                e.target.value
              )
            }
            placeholder="Search tenders, bidders, documents..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />

        </div>

        <div className="relative">

          <button
            onClick={() =>
              setShowProfile(
                (value) => !value
              )
            }
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm"
          >

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              AS
            </div>

            <div className="text-left">

              <p className="text-sm font-semibold text-slate-800">
                Amit Sharma
              </p>

              <p className="text-xs text-slate-500">
                Procurement Officer
              </p>

            </div>

            <svg
              className="h-4 w-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m6 9 6 6 6-6"
              />
            </svg>

          </button>

          {showProfile && (
            <div className="absolute right-0 top-14 z-20 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">

              <button
                onClick={() => {
                  setShowProfile(
                    false
                  );

                  setActivePage?.(
                    "Profile & Settings"
                  );
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                Profile & Settings
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("gem_verify_current_user");
                  localStorage.removeItem("gem_verify_remember");
                  window.location.reload();
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
              <button
                onClick={() =>
                  setShowProfile(
                    false
                  )
                }
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>

            </div>
          )}

        </div>

      </div>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div>

        <p className="mb-2 text-sm font-medium text-blue-600">
          Procurement Command Center
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Welcome back, Amit
        </h1>

        <p className="mt-2 text-slate-500">
          Monitor GeM procurement,
          bidder compliance and
          verification activity.
        </p>

      </div>

      {/* ======================================================
          KPI CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">

        {/* ACTIVE TENDERS */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 7h18M5 7v12h14V7M8 4h8v3H8V4Z"
                />
              </svg>

            </div>

            <span className="text-xs font-medium text-slate-400">
              Live
            </span>

          </div>

          <p className="mt-5 text-3xl font-bold text-slate-900">
            {stats.activeTenders}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Active Tenders
          </p>

        </div>

        {/* BIDDERS */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">

              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
                />
              </svg>

            </div>

            <span className="text-xs font-medium text-slate-400">
              Total
            </span>

          </div>

          <p className="mt-5 text-3xl font-bold text-slate-900">
            {stats.totalBidders}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Registered Bidders
          </p>

        </div>

        {/* DOCUMENTS */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">

              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 3h8l4 4v14H7V3Zm8 0v5h4M10 13h6M10 17h6"
                />
              </svg>

            </div>

            <span className="text-xs font-medium text-slate-400">
              Uploaded
            </span>

          </div>

          <p className="mt-5 text-3xl font-bold text-slate-900">
            {stats.documentsSubmitted}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Documents Submitted
          </p>

        </div>

        {/* VERIFICATION */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">

              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m5 12 4 4L19 6"
                />
              </svg>

            </div>

            <span className="text-xs font-medium text-emerald-600">
              VALID
            </span>

          </div>

          <p className="mt-5 text-3xl font-bold text-slate-900">
            {stats.verificationCompleted}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Verification Completed
          </p>

        </div>

        {/* RISK */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">

              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v4M12 17h.01M10.29 3.86 2.82 17a2 2 0 0 0 1.74 3h14.88a2 2 0 0 0 1.74-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                />
              </svg>

            </div>

            <span className="text-xs font-medium text-rose-600">
              HIGH / CRITICAL
            </span>

          </div>

          <p className="mt-5 text-3xl font-bold text-slate-900">
            {stats.highRiskCases}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            High Risk Cases
          </p>

        </div>

      </div>

      {/* ======================================================
          PROCUREMENT ACTIVITY + VERIFICATION DISTRIBUTION
      ====================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* ACTIVITY */}

        <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-lg font-bold text-slate-900">
                Procurement Activity
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Recent activity from your backend data
              </p>

            </div>

            <button
              onClick={() =>
                setActivePage?.(
                  "Tenders"
                )
              }
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              View Tenders
            </button>

          </div>

          <div className="mt-8 flex h-64 items-end gap-4">

            {activity.length === 0 ? (

              <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                No activity data available
              </div>

            ) : (

              activity.map(
                (item) => (

                  <div
                    key={item.date}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-3"
                  >

                    <span className="text-xs font-semibold text-slate-600">
                      {item.count}
                    </span>

                    <div
                      className="w-full max-w-[48px] rounded-t-lg bg-blue-500 transition-all"
                      style={{
                        height: `${Math.max(
                          (item.count /
                            maxActivity) *
                            190,
                          12
                        )}px`,
                      }}
                    />

                    <span className="text-xs text-slate-400">
                      {item.date}
                    </span>

                  </div>

                )
              )

            )}

          </div>

          {filteredTenders.length >
            0 &&
            search.trim() && (

              <div className="mt-6 rounded-xl bg-slate-50 p-4">

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Search result
                </p>

                <p className="mt-1 text-sm font-medium text-slate-700">

                  {
                    filteredTenders.length
                  }{" "}
                  tender
                  {filteredTenders.length !==
                  1
                    ? "s"
                    : ""}{" "}
                  found

                </p>

              </div>

            )}

        </div>

        {/* VERIFICATION DISTRIBUTION */}

        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

          <div>

            <h2 className="text-lg font-bold text-slate-900">
              Verification Distribution
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest result per document
            </p>

          </div>

          <div className="mt-8 flex items-center justify-center">

            <div
              className="relative flex h-48 w-48 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(
                  #10b981 0% ${verificationDistribution.validPercent}%,
                  #f59e0b ${verificationDistribution.validPercent}% ${
                    verificationDistribution.validPercent +
                    verificationDistribution.reviewPercent
                  }%,
                  #ef4444 ${
                    verificationDistribution.validPercent +
                    verificationDistribution.reviewPercent
                  }% 100%
                )`,
              }}
            >

              <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white">

                <span className="text-3xl font-bold text-slate-900">
                  {
                    verificationDistribution.total
                  }
                </span>

                <span className="text-xs text-slate-500">
                  Verified Docs
                </span>

              </div>

            </div>

          </div>

          <div className="mt-8 space-y-4">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">

                <span className="h-3 w-3 rounded-full bg-emerald-500" />

                <span className="text-sm text-slate-600">
                  Valid
                </span>

              </div>

              <span className="text-sm font-semibold text-slate-800">
                {
                  verificationDistribution.valid
                }
              </span>

            </div>

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">

                <span className="h-3 w-3 rounded-full bg-amber-500" />

                <span className="text-sm text-slate-600">
                  Needs Review
                </span>

              </div>

              <span className="text-sm font-semibold text-slate-800">
                {
                  verificationDistribution.review
                }
              </span>

            </div>

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">

                <span className="h-3 w-3 rounded-full bg-red-500" />

                <span className="text-sm text-slate-600">
                  Invalid
                </span>

              </div>

              <span className="text-sm font-semibold text-slate-800">
                {
                  verificationDistribution.invalid
                }
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* ======================================================
          BOTTOM PANELS
      ====================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* PENDING ACTIONS */}

        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

          <h2 className="text-lg font-bold text-slate-900">
            Pending Actions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Items requiring officer attention
          </p>

          <div className="mt-6 space-y-3">

            <button
              onClick={() =>
                setActivePage?.(
                  "Verification"
                )
              }
              className="flex w-full items-center justify-between rounded-xl border border-slate-100 p-4 text-left transition hover:bg-slate-50"
            >

              <div>

                <p className="text-sm font-semibold text-slate-800">
                  High-risk verifications
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  HIGH or CRITICAL risk
                </p>

              </div>

              <span className="rounded-full bg-rose-50 px-3 py-1 text-sm font-bold text-rose-600">
                {
                  stats.highRiskCases
                }
              </span>

            </button>

            <button
              onClick={() =>
                setActivePage?.(
                  "Verification"
                )
              }
              className="flex w-full items-center justify-between rounded-xl border border-slate-100 p-4 text-left transition hover:bg-slate-50"
            >

              <div>

                <p className="text-sm font-semibold text-slate-800">
                  Needs review
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Awaiting human decision
                </p>

              </div>

              <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-600">
                {
                  stats.needsReview
                }
              </span>

            </button>

            <button
              onClick={() =>
                setActivePage?.(
                  "Bidders"
                )
              }
              className="flex w-full items-center justify-between rounded-xl border border-slate-100 p-4 text-left transition hover:bg-slate-50"
            >

              <div>

                <p className="text-sm font-semibold text-slate-800">
                  Registered bidders
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Total bidder records
                </p>

              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-600">
                {
                  stats.totalBidders
                }
              </span>

            </button>

          </div>

        </div>

        {/* AI INSIGHT */}

        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 3a6 6 0 0 0-6 6c0 2.22 1.2 4.16 3 5.2V17h6v-2.8c1.8-1.04 3-2.98 3-5.2a6 6 0 0 0-6-6ZM9 21h6M10 18h4"
                />
              </svg>

            </div>

            <div>

              <h2 className="text-lg font-bold text-slate-900">
                AI Insight
              </h2>

              <p className="text-sm text-slate-500">
                Based on current verification data
              </p>

            </div>

          </div>

          <div className="mt-6 rounded-xl bg-blue-50 p-5">

            <p className="text-sm leading-6 text-slate-700">

              {stats.highRiskCases >
              0
                ? `${stats.highRiskCases} high-risk or critical verification cases currently require attention.`
                : stats.needsReview >
                  0
                ? `${stats.needsReview} verification cases are waiting for human review.`
                : "No high-risk verification cases are currently detected."}

            </p>

          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">

            <div className="rounded-xl border border-slate-100 p-4">

              <p className="text-xs text-slate-500">
                Valid
              </p>

              <p className="mt-1 text-xl font-bold text-emerald-600">
                {
                  verificationDistribution.valid
                }
              </p>

            </div>

            <div className="rounded-xl border border-slate-100 p-4">

              <p className="text-xs text-slate-500">
                Invalid
              </p>

              <p className="mt-1 text-xl font-bold text-red-600">
                {
                  verificationDistribution.invalid
                }
              </p>

            </div>

          </div>

        </div>

        {/* PROCUREMENT SNAPSHOT */}

        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

          <h2 className="text-lg font-bold text-slate-900">
            Procurement Snapshot
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Current backend records
          </p>

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">

              <span className="text-sm text-slate-600">
                Tenders
              </span>

              <span className="text-lg font-bold text-slate-900">
                {tenders.length}
              </span>

            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">

              <span className="text-sm text-slate-600">
                Bidders
              </span>

              <span className="text-lg font-bold text-slate-900">
                {bidders.length}
              </span>

            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">

              <span className="text-sm text-slate-600">
                Documents
              </span>

              <span className="text-lg font-bold text-slate-900">
                {documents.length}
              </span>

            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">

              <span className="text-sm text-slate-600">
                Verification Records
              </span>

              <span className="text-lg font-bold text-slate-900">
                {
                  verificationResults.length
                }
              </span>

            </div>

          </div>

          <button
            onClick={() =>
              setActivePage?.(
                "Reports"
              )
            }
            className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Open Reports
          </button>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;