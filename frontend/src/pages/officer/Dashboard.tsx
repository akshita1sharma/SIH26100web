type DashboardProps = {
  tenders: any[];
  bidders: any[];
  verificationResults: any[];
  setActivePage: (page: string) => void;
};

const Dashboard = ({
  tenders,
  bidders,
  verificationResults,
  setActivePage,
}: DashboardProps) => {

  const valid = verificationResults.filter(
    (r) => r.verification_status === "VALID"
  ).length;

  const review = verificationResults.filter(
    (r) => r.verification_status === "NEEDS_REVIEW"
  ).length;

  const invalid = verificationResults.filter(
    (r) => r.verification_status === "INVALID"
  ).length;

  const highRisk = verificationResults.filter(
    (r) =>
      r.risk_level === "HIGH" ||
      r.risk_level === "CRITICAL"
  ).length;

  const totalResults = verificationResults.length;

  const compliancePercent =
    totalResults > 0
      ? Math.round((valid / totalResults) * 100)
      : 0;

  const recentResults = [...verificationResults]
    .slice(-5)
    .reverse();

  const statCards = [
    {
      title: "Active Tenders",
      value: tenders.filter((t) => t.status === "OPEN").length,
      subtitle: "Currently accepting bids",
      icon: "◫",
      accent: "blue",
    },
    {
      title: "Registered Bidders",
      value: bidders.length,
      subtitle: "Organizations in system",
      icon: "♙",
      accent: "violet",
    },
    {
      title: "Verified Documents",
      value: verificationResults.length,
      subtitle: "Processed by verification engine",
      icon: "✓",
      accent: "emerald",
    },
    {
      title: "High Risk Cases",
      value: highRisk,
      subtitle: "Require officer attention",
      icon: "!",
      accent: "rose",
    },
  ];

  const accentStyles: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
  };

  const statusClass = (status: string) => {
    if (status === "VALID")
      return "bg-emerald-50 text-emerald-700 border-emerald-100";

    if (status === "NEEDS_REVIEW")
      return "bg-amber-50 text-amber-700 border-amber-100";

    return "bg-rose-50 text-rose-700 border-rose-100";
  };

  return (
    <div className="min-h-screen space-y-7 pb-10">

      {/* Header */}
      <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Procurement Control Center
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Compliance Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor tenders, bidders and AI-assisted compliance verification.
          </p>
        </div>

        <div className="flex items-center gap-3">

          <button className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm md:block">
            Today
          </button>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium text-slate-700">
              System Operational
            </span>
          </div>

        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {statCards.map((card) => (
          <div
            key={card.title}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between">

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold ${accentStyles[card.accent]}`}
              >
                {card.icon}
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Live
              </span>

            </div>

            <p className="mt-5 text-sm text-slate-500">
              {card.title}
            </p>

            <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              {card.value}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {card.subtitle}
            </p>
          </div>
        ))}

      </div>

      {/* Main analytics */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.65fr_0.85fr]">

        {/* Compliance */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-start justify-between">

            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Compliance Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current verification distribution across submitted documents.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 px-3 py-2 text-right">
              <p className="text-xs text-slate-400">
                Valid rate
              </p>

              <p className="text-lg font-bold text-slate-900">
                {compliancePercent}%
              </p>
            </div>

          </div>

          <div className="mt-7 space-y-6">

            {[
              {
                label: "Compliant",
                value: valid,
                percent:
                  totalResults > 0
                    ? (valid / totalResults) * 100
                    : 0,
                text: "text-emerald-600",
                bar: "bg-emerald-500",
              },
              {
                label: "Needs Review",
                value: review,
                percent:
                  totalResults > 0
                    ? (review / totalResults) * 100
                    : 0,
                text: "text-amber-600",
                bar: "bg-amber-400",
              },
              {
                label: "Non-Compliant",
                value: invalid,
                percent:
                  totalResults > 0
                    ? (invalid / totalResults) * 100
                    : 0,
                text: "text-rose-600",
                bar: "bg-rose-500",
              },
            ].map((item) => (
              <div key={item.label}>

                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium text-slate-600">
                    {item.label}
                  </span>

                  <span className={`font-bold ${item.text}`}>
                    {item.value}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all ${item.bar}`}
                    style={{
                      width: `${item.percent}%`,
                    }}
                  />
                </div>

              </div>
            ))}

          </div>

        </section>

        {/* Health */}
        <section className="rounded-2xl bg-[#0b1730] p-6 text-white shadow-xl">

          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-blue-200">
              Verification Health
            </p>

            <span className="rounded-lg bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase">
              Live
            </span>
          </div>

          <div className="mt-7">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/15 text-2xl">
              ✓
            </div>

            <h2 className="mt-5 text-2xl font-bold">
              {totalResults === 0
                ? "No Data"
                : highRisk > 0
                ? "Attention Required"
                : "Healthy"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Based on the current distribution of bidder verification results.
            </p>

          </div>

          <div className="mt-7 border-t border-white/10 pt-5">

            <div className="flex justify-between py-2">
              <span className="text-sm text-slate-400">
                Verified Results
              </span>

              <span className="font-bold">
                {valid}
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-sm text-slate-400">
                Needs Review
              </span>

              <span className="font-bold text-amber-400">
                {review}
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-sm text-slate-400">
                High Risk
              </span>

              <span className="font-bold text-rose-400">
                {highRisk}
              </span>
            </div>

          </div>

        </section>

      </div>

      {/* Bottom */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.5fr_1fr]">

        {/* Recent activity */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Recent Verification Activity
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Latest document verification results
              </p>
            </div>

            <button
              onClick={() => setActivePage("Documents")}
              className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
            >
              View All
            </button>

          </div>

          {recentResults.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xl">
                ▤
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-700">
                No verification activity
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Verification results will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">

              {recentResults.map((result, index) => (
                <div
                  key={result.id ?? index}
                  className="flex items-center justify-between px-6 py-4 transition hover:bg-slate-50"
                >

                  <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">
                      {String(result.document_id || "D").slice(0, 1)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        Document #{result.document_id}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        Verification result #{result.id}
                      </p>
                    </div>

                  </div>

                  <div className="flex items-center gap-4">

                    <span className="hidden text-sm font-bold text-slate-700 sm:block">
                      {result.score ?? "—"}
                    </span>

                    <span
                      className={`rounded-full border px-3 py-1 text-[10px] font-bold ${statusClass(
                        result.verification_status
                      )}`}
                    >
                      {result.verification_status}
                    </span>

                  </div>

                </div>
              ))}

            </div>
          )}

        </section>

        {/* Quick actions */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-bold text-slate-950">
            Quick Actions
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Common procurement workflows
          </p>

          <div className="mt-5 space-y-3">

            <button
              onClick={() => setActivePage("Verification")}
              className="flex w-full items-center gap-4 rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                ✓
              </span>

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Review Verification
                </p>

                <p className="text-xs text-slate-400">
                  Inspect bidder compliance
                </p>
              </div>

              <span className="ml-auto text-slate-300">
                →
              </span>
            </button>

            <button
              onClick={() => setActivePage("Bidders")}
              className="flex w-full items-center gap-4 rounded-xl border border-slate-200 p-4 text-left transition hover:border-violet-200 hover:bg-violet-50"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                ♙
              </span>

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  View Bidders
                </p>

                <p className="text-xs text-slate-400">
                  Manage registered bidders
                </p>
              </div>

              <span className="ml-auto text-slate-300">
                →
              </span>
            </button>

            <button
              onClick={() => setActivePage("Tenders")}
              className="flex w-full items-center gap-4 rounded-xl border border-slate-200 p-4 text-left transition hover:border-emerald-200 hover:bg-emerald-50"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                ◫
              </span>

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Manage Tenders
                </p>

                <p className="text-xs text-slate-400">
                  Review procurement opportunities
                </p>
              </div>

              <span className="ml-auto text-slate-300">
                →
              </span>
            </button>

          </div>

        </section>

      </div>

    </div>
  );
};

export default Dashboard;