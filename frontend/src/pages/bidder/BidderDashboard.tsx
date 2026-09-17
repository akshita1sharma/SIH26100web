import { useEffect, useState } from "react";

type BidderDashboardProps = {
  setActivePage: (page: string) => void;
};

const BidderDashboard = ({
  setActivePage,
}: BidderDashboardProps) => {
  const [tenders, setTenders] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [verificationResults, setVerificationResults] =
    useState<any[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/tenders")
      .then((res) => res.json())
      .then((data) => setTenders(data.tenders || []))
      .catch(() => setTenders([]));

    fetch("http://127.0.0.1:8000/documents")
      .then((res) => res.json())
      .then((data) => setDocuments(data.documents || []))
      .catch(() => setDocuments([]));

    fetch("http://127.0.0.1:8000/verification-results")
      .then((res) => res.json())
      .then((data) =>
        setVerificationResults(
          data.verification_results || []
        )
      )
      .catch(() => setVerificationResults([]));
  }, []);

  const validDocuments = verificationResults.filter(
    (item) =>
      item.verification_status === "VALID"
  ).length;

  const reviewDocuments = verificationResults.filter(
    (item) =>
      item.verification_status === "NEEDS_REVIEW"
  ).length;

  const issueDocuments = verificationResults.filter(
    (item) =>
      item.verification_status === "INVALID"
  ).length;

  const totalVerification =
    verificationResults.length;

  const complianceScore =
    totalVerification > 0
      ? Math.round(
          (validDocuments / totalVerification) * 100
        )
      : 0;

  const openTenders = tenders.filter(
    (tender) => tender.status === "OPEN"
  );

  return (
    <div className="min-h-screen space-y-6 pb-10">

      {/* HEADER */}

      <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Bidder Portal
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Welcome back!
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track your tenders, submissions and compliance documents.
          </p>
        </div>

        <div className="flex items-center gap-3">

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 shadow-sm">
            Today
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">

            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

            <span className="text-sm font-medium text-slate-700">
              System Operational
            </span>

          </div>

        </div>

      </header>


      {/* KPI CARDS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Available Tenders */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-start justify-between">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600">
              ▣
            </div>

            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
              OPEN
            </span>

          </div>

          <p className="mt-5 text-sm text-slate-500">
            Available Tenders
          </p>

          <p className="mt-1 text-3xl font-bold text-slate-950">
            {openTenders.length}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            New opportunities open for bidding
          </p>

        </div>


        {/* My Bids */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-start justify-between">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-xl text-violet-600">
              ♙
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              LIVE
            </span>

          </div>

          <p className="mt-5 text-sm text-slate-500">
            My Bids
          </p>

          <p className="mt-1 text-3xl font-bold text-slate-950">
            0
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Bids submitted by you
          </p>

        </div>


        {/* Documents */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-start justify-between">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl text-emerald-600">
              ▤
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              LIVE
            </span>

          </div>

          <p className="mt-5 text-sm text-slate-500">
            My Documents
          </p>

          <p className="mt-1 text-3xl font-bold text-slate-950">
            {documents.length}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Documents uploaded
          </p>

        </div>


        {/* Compliance */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-start justify-between">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-xl text-amber-600">
              ◈
            </div>

            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                complianceScore >= 80
                  ? "bg-emerald-50 text-emerald-600"
                  : complianceScore > 0
                  ? "bg-amber-50 text-amber-600"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {complianceScore > 0
                ? "ACTIVE"
                : "PENDING"}
            </span>

          </div>

          <p className="mt-5 text-sm text-slate-500">
            Compliance Score
          </p>

          <p className="mt-1 text-3xl font-bold text-blue-600">
            {complianceScore > 0
              ? `${complianceScore}%`
              : "Pending"}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Based on verification results
          </p>

        </div>

      </div>


      {/* ACTIVITY + COMPLIANCE */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.55fr_0.9fr]">

        {/* Bidding Activity */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-lg font-bold text-slate-950">
                Bidding Activity
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Overview of your bidding and document activity.
              </p>

            </div>

            <span className="text-xs font-medium text-slate-400">
              Last 30 days
            </span>

          </div>

          <div className="mt-8 flex h-52 items-end gap-4 rounded-xl bg-slate-50 p-5">

            {[30, 55, 42, 70, 48, 78, 62, 88, 52, 68, 45, 75].map(
              (height, index) => (
                <div
                  key={index}
                  className="flex h-full flex-1 items-end"
                >
                  <div
                    className="w-full rounded-t-md bg-blue-500 transition hover:bg-blue-600"
                    style={{
                      height: `${height}%`,
                    }}
                  />
                </div>
              )
            )}

          </div>

          <div className="mt-4 flex justify-between text-[10px] text-slate-400">
            <span>18 Aug</span>
            <span>25 Aug</span>
            <span>1 Sep</span>
            <span>8 Sep</span>
            <span>15 Sep</span>
          </div>

        </section>


        {/* Compliance Status */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-lg font-bold text-slate-950">
                Compliance Status
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Current document verification.
              </p>

            </div>

            <button
              onClick={() =>
                setActivePage("VerificationStatus")
              }
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View Details →
            </button>

          </div>


          <div className="mt-5 flex items-center gap-5">

            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-[10px] border-blue-100">

              <div className="text-center">

                <p className="text-2xl font-bold text-slate-950">
                  {complianceScore}%
                </p>

                <p className="text-[10px] text-slate-400">
                  Overall Score
                </p>

              </div>

            </div>


            <div className="flex-1 space-y-3">

              <div className="flex items-center justify-between">

                <span className="text-xs text-slate-500">
                  ✓ Verified Documents
                </span>

                <span className="text-sm font-bold text-emerald-600">
                  {validDocuments}
                </span>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-xs text-slate-500">
                  ◷ Under Review
                </span>

                <span className="text-sm font-bold text-amber-600">
                  {reviewDocuments}
                </span>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-xs text-slate-500">
                  ! Issues Found
                </span>

                <span className="text-sm font-bold text-rose-600">
                  {issueDocuments}
                </span>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-xs text-slate-500">
                  ▤ Total Documents
                </span>

                <span className="text-sm font-bold text-slate-700">
                  {documents.length}
                </span>

              </div>

            </div>

          </div>


          <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 p-3">

            <p className="text-xs font-bold text-amber-800">
              {issueDocuments > 0
                ? `${issueDocuments} document${
                    issueDocuments > 1 ? "s" : ""
                  } require attention`
                : "Document verification status"}
            </p>

            <p className="mt-1 text-[11px] text-amber-700">
              Review your verification status before submitting bids.
            </p>

          </div>

        </section>

      </div>


      {/* QUICK ACTIONS */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div>

          <h2 className="text-lg font-bold text-slate-950">
            Quick Actions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Common tasks for bidders.
          </p>

        </div>


        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">

          <button
            onClick={() => setActivePage("MyTenders")}
            className="group flex items-center gap-4 rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50"
          >

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600">
              ▣
            </div>

            <div className="flex-1">

              <p className="text-sm font-bold text-slate-800">
                Browse Tenders
              </p>

              <p className="mt-1 text-xs text-slate-400">
                View new opportunities
              </p>

            </div>

            <span className="text-blue-500">
              →
            </span>

          </button>


          <button
            onClick={() => setActivePage("UploadDocuments")}
            className="group flex items-center gap-4 rounded-xl border border-slate-200 p-4 text-left transition hover:border-emerald-200 hover:bg-emerald-50"
          >

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl text-emerald-600">
              ↑
            </div>

            <div className="flex-1">

              <p className="text-sm font-bold text-slate-800">
                Upload Documents
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Submit required documents
              </p>

            </div>

            <span className="text-emerald-500">
              →
            </span>

          </button>


          <button
            onClick={() => setActivePage("MyBids")}
            className="group flex items-center gap-4 rounded-xl border border-slate-200 p-4 text-left transition hover:border-violet-200 hover:bg-violet-50"
          >

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-xl text-violet-600">
              ♙
            </div>

            <div className="flex-1">

              <p className="text-sm font-bold text-slate-800">
                My Bids
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Track submitted bids
              </p>

            </div>

            <span className="text-violet-500">
              →
            </span>

          </button>


          <button
            onClick={() =>
              setActivePage("VerificationStatus")
            }
            className="group flex items-center gap-4 rounded-xl border border-slate-200 p-4 text-left transition hover:border-amber-200 hover:bg-amber-50"
          >

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-xl text-amber-600">
              ✓
            </div>

            <div className="flex-1">

              <p className="text-sm font-bold text-slate-800">
                Verification Status
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Check your documents
              </p>

            </div>

            <span className="text-amber-500">
              →
            </span>

          </button>

        </div>

      </section>


      {/* RECENT TENDERS */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

          <div>

            <h2 className="text-lg font-bold text-slate-950">
              Recent Tenders
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest procurement opportunities.
            </p>

          </div>

          <button
            onClick={() => setActivePage("MyTenders")}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            View All →
          </button>

        </div>


        {openTenders.length === 0 ? (

          <div className="px-6 py-12 text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xl text-slate-400">
              ▣
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-700">
              No open tenders
            </p>

            <p className="mt-1 text-xs text-slate-400">
              New procurement opportunities will appear here.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[700px]">

              <thead className="bg-slate-50">

                <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">

                  <th className="px-6 py-3">
                    Tender ID
                  </th>

                  <th className="px-6 py-3">
                    Title
                  </th>

                  <th className="px-6 py-3">
                    Deadline
                  </th>

                  <th className="px-6 py-3">
                    Status
                  </th>

                  <th className="px-6 py-3">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {openTenders.slice(0, 5).map(
                  (tender, index) => (

                    <tr
                      key={tender.id ?? index}
                      className="transition hover:bg-slate-50"
                    >

                      <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                        {tender.tender_number}
                      </td>

                      <td className="px-6 py-4">

                        <p className="text-sm font-medium text-slate-800">
                          {tender.title}
                        </p>

                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {tender.submission_deadline || "—"}
                      </td>

                      <td className="px-6 py-4">

                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                          OPEN
                        </span>

                      </td>

                      <td className="px-6 py-4">

                        <button
                          onClick={() =>
                            setActivePage("MyTenders")
                          }
                          className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"
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

    </div>
  );
};

export default BidderDashboard;