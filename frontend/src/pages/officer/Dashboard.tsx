type DashboardProps = {
  tenders: any[];
  bidders: any[];
  verificationResults: any[];
  documents: any[];
  setActivePage: (page: string) => void;
};

function Dashboard({
  tenders,
  bidders,
  verificationResults,
  documents,
  setActivePage,
}: DashboardProps) {
  const compliant = verificationResults.filter(
    (result) => result.verification_status === "VALID"
  ).length;

  const needsReview = verificationResults.filter(
    (result) => result.verification_status === "NEEDS_REVIEW"
  ).length;

  const nonCompliant = verificationResults.filter(
    (result) => result.verification_status === "INVALID"
  ).length;

  const totalResults =
    compliant + needsReview + nonCompliant;

  const complianceRate =
    totalResults > 0
      ? Math.round((compliant / totalResults) * 100)
      : 0;

  const riskHigh = verificationResults.filter(
    (result) =>
      result.risk_level === "HIGH" ||
      result.risk_level === "CRITICAL"
  ).length;

  const recentResults = verificationResults
    .filter((result) => result.score !== null)
    .slice(0, 5);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">
            PROCUREMENT CONTROL CENTER
          </p>

          <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Compliance Dashboard
          </h2>

          <p className="mt-1 text-slate-500">
            Monitor tenders, bidders and AI-powered compliance verification
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
          <span className="text-sm font-medium text-slate-600">
            System Operational
          </span>
        </div>
      </div>


      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
              ◫
            </div>

            <span className="text-xs font-semibold text-blue-600">
              ACTIVE
            </span>
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Active Tenders
          </p>

          <p className="mt-1 text-3xl font-bold">
            {tenders.length}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Procurement opportunities currently open
          </p>
        </div>


        <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-xl">
              ♙
            </div>

            <span className="text-xs font-semibold text-violet-600">
              REGISTERED
            </span>
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Total Bidders
          </p>

          <p className="mt-1 text-3xl font-bold">
            {bidders.length}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Bidders registered for verification
          </p>
        </div>


        <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-xl">
              ✓
            </div>

            <span className="text-xs font-semibold text-green-600">
              VERIFIED
            </span>
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Documents Verified
          </p>

          <p className="mt-1 text-3xl font-bold">
            {
              verificationResults.filter(
                (result) => result.score !== null
              ).length
            }
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Documents processed by verification engine
          </p>
        </div>


        <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-xl">
              ⚠
            </div>

            <span className="text-xs font-semibold text-red-600">
              ATTENTION
            </span>
          </div>

          <p className="mt-5 text-sm text-slate-500">
            High Risk Cases
          </p>

          <p className="mt-1 text-3xl font-bold text-red-600">
            {riskHigh}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Require procurement officer attention
          </p>
        </div>

      </div>


      {/* Compliance Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        <div className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">
                Compliance Overview
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Current verification distribution
              </p>
            </div>

            <div className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold">
              {complianceRate}% valid
            </div>
          </div>


          <div className="mt-7 space-y-5">

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium text-slate-600">
                  Compliant
                </span>

                <span className="font-semibold text-green-600">
                  {compliant}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-green-500"
                  style={{
                    width: `${
                      totalResults
                        ? (compliant / totalResults) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>


            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium text-slate-600">
                  Needs Review
                </span>

                <span className="font-semibold text-yellow-600">
                  {needsReview}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-yellow-400"
                  style={{
                    width: `${
                      totalResults
                        ? (needsReview / totalResults) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>


            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium text-slate-600">
                  Non-Compliant
                </span>

                <span className="font-semibold text-red-600">
                  {nonCompliant}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-red-500"
                  style={{
                    width: `${
                      totalResults
                        ? (nonCompliant / totalResults) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

          </div>
        </div>


        {/* Verification Health */}
        <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">

          <p className="text-sm font-medium text-slate-400">
            Verification Health
          </p>

          <h3 className="mt-2 text-2xl font-bold">
            {complianceRate >= 80
              ? "Healthy"
              : complianceRate >= 50
              ? "Needs Attention"
              : "Critical"}
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Based on the current distribution of bidder
            verification results.
          </p>

          <div className="mt-7 border-t border-slate-700 pt-5">

            <div className="flex justify-between">
              <span className="text-sm text-slate-400">
                Verified Results
              </span>

              <span className="font-semibold">
                {totalResults}
              </span>
            </div>

            <div className="mt-4 flex justify-between">
              <span className="text-sm text-slate-400">
                High Risk
              </span>

              <span className="font-semibold text-red-400">
                {riskHigh}
              </span>
            </div>

          </div>
        </div>

      </div>


      {/* Recent Verification */}
      <div className="rounded-2xl bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-slate-100 p-6">

          <div>
            <h3 className="text-lg font-bold">
              Recent Verification Activity
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Latest processed compliance documents
            </p>
          </div>

          <button
            onClick={() => setActivePage("Verification")}
            className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
          >
            View All
          </button>

        </div>


        {recentResults.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No verification activity available.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">

            {recentResults.map((result: any) => {

              const document = documents.find(
                (item) =>
                  String(item.id) ===
                  String(result.document_id)
              );

              return (
                <div
                  key={result.id}
                  className="flex flex-col gap-4 p-5 transition hover:bg-slate-50 md:flex-row md:items-center md:justify-between"
                >

                  <div className="flex items-center gap-4">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                      📄
                    </div>

                    <div>
                      <p className="font-semibold">
                        {document?.file_name ||
                          `Document #${result.document_id}`}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {document?.document_type ||
                          "Verification"}
                      </p>
                    </div>

                  </div>


                  <div className="flex items-center gap-6">

                    <div>
                      <p className="text-xs text-slate-400">
                        SCORE
                      </p>

                      <p className="mt-1 font-semibold">
                        {result.score}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                        result.verification_status === "VALID"
                          ? "bg-green-100 text-green-700"
                          : result.verification_status === "NEEDS_REVIEW"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {result.verification_status}
                    </span>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>


      {/* Verification Modules */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">

        <div className="mb-5">

          <h3 className="text-lg font-bold">
            Verification Modules
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Automated compliance checks supported by GeM Verify
          </p>

        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

          {[
            "GST",
            "PAN",
            "Udyam / MSME",
            "Income Tax",
            "EPFO / ESIC",
            "Startup India",
            "Make in India",
            "OEM Authorization",
          ].map((module) => (

            <div
              key={module}
              className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50"
            >

              <div className="flex items-center justify-between">

                <p className="text-sm font-semibold">
                  {module}
                </p>

                <span className="h-2 w-2 rounded-full bg-green-500" />

              </div>

              <p className="mt-2 text-xs text-slate-400">
                Verification module
              </p>

            </div>

          ))}

        </div>
      </div>

    </div>
  );
}

export default Dashboard;