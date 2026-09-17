import { useMemo, useState } from "react";

type BiddersProps = {
  bidders?: any[];
  documents?: any[];
  verificationResults?: any[];
  setActivePage?: (page: string) => void;
  setSelectedBidderId?: (id: string) => void;
};

const API =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function Bidders({
  bidders = [],
  documents = [],
  verificationResults = [],
  setActivePage,
  setSelectedBidderId,
}: BiddersProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [location, setLocation] = useState("All Locations");
  const [complianceFilter, setComplianceFilter] = useState("All Status");
  const [activeTab, setActiveTab] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [selectedBidder, setSelectedBidder] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    bidder_code: "",
    company_name: "",
    gstin: "",
    pan: "",
    udyam_number: "",
  });

  // Latest verification result for each document.
  const latestResults = useMemo(() => {
    const map = new Map<string | number, any>();

    [...verificationResults]
      .sort((a, b) => {
        const at = new Date(a?.created_at || 0).getTime();
        const bt = new Date(b?.created_at || 0).getTime();

        if (at !== bt) return at - bt;
        return Number(a?.id || 0) - Number(b?.id || 0);
      })
      .forEach((result) => {
        if (result?.document_id != null) {
          map.set(result.document_id, result);
        }
      });

    return map;
  }, [verificationResults]);

  // Calculate bidder compliance from the bidder's documents.
  const bidderStats = useMemo(() => {
    const result = new Map<string | number, any>();

    bidders.forEach((bidder) => {
      const bidderDocuments = documents.filter(
        (doc) => String(doc?.bidder_id) === String(bidder?.id)
      );

      const bidderResults = bidderDocuments
        .map((doc) => latestResults.get(doc?.id))
        .filter(Boolean);

      const total = bidderResults.length;

      const valid = bidderResults.filter(
        (item) =>
          String(item?.status || "").toUpperCase() === "VALID"
      ).length;

      const invalid = bidderResults.filter(
        (item) =>
          String(item?.status || "").toUpperCase() === "INVALID"
      ).length;

      const review = bidderResults.filter(
        (item) =>
          String(item?.status || "").toUpperCase() === "NEEDS_REVIEW"
      ).length;

      const highRisk = bidderResults.filter((item) => {
        const risk = String(item?.risk_level || "").toUpperCase();
        return risk === "HIGH" || risk === "CRITICAL";
      }).length;

      const averageScore =
        bidderResults.length > 0
          ? Math.round(
              bidderResults.reduce(
                (sum, item) => sum + Number(item?.score || 0),
                0
              ) / bidderResults.length
            )
          : 0;

      result.set(bidder.id, {
        total,
        valid,
        invalid,
        review,
        highRisk,
        averageScore,
      });
    });

    return result;
  }, [bidders, documents, latestResults]);

  const getBidderInfo = (bidder: any) => {
    return (
      bidderStats.get(bidder?.id) || {
        total: 0,
        valid: 0,
        invalid: 0,
        review: 0,
        highRisk: 0,
        averageScore: 0,
      }
    );
  };

  const getCompliance = (bidder: any) => {
    const info = getBidderInfo(bidder);

    // If verification exists, use its average score.
    // Otherwise show 0 instead of inventing a compliance score.
    return info.total > 0 ? info.averageScore : 0;
  };

  const getStatus = (bidder: any) => {
    const info = getBidderInfo(bidder);

    if (info.highRisk > 0) return "High Risk";
    if (info.review > 0) return "Under Review";
    if (info.total > 0 && info.invalid === 0) return "Verified";
    if (info.invalid > 0) return "Under Review";

    return "Not Verified";
  };

  const filteredBidders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bidders.filter((bidder) => {
      const status = getStatus(bidder);

      const matchesSearch =
        !query ||
        [
          bidder?.company_name,
          bidder?.bidder_code,
          bidder?.gstin,
          bidder?.pan,
          bidder?.udyam_number,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        category === "All Categories" || category === "General";

      const matchesLocation = location === "All Locations";

      const matchesCompliance =
        complianceFilter === "All Status" ||
        (complianceFilter === "Verified" && status === "Verified") ||
        (complianceFilter === "Under Review" &&
          status === "Under Review") ||
        (complianceFilter === "High Risk" &&
          status === "High Risk");

      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Verified" && status === "Verified") ||
        (activeTab === "Under Review" && status === "Under Review") ||
        (activeTab === "High Risk" && status === "High Risk");

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLocation &&
        matchesCompliance &&
        matchesTab
      );
    });
  }, [
    bidders,
    search,
    category,
    location,
    complianceFilter,
    activeTab,
    bidderStats,
  ]);

  const counts = useMemo(() => {
    let verified = 0;
    let review = 0;
    let highRisk = 0;

    bidders.forEach((bidder) => {
      const status = getStatus(bidder);

      if (status === "Verified") verified++;
      if (status === "Under Review") review++;
      if (status === "High Risk") highRisk++;
    });

    return {
      all: bidders.length,
      verified,
      review,
      highRisk,
    };
  }, [bidders, bidderStats]);

  const resetFilters = () => {
    setSearch("");
    setCategory("All Categories");
    setLocation("All Locations");
    setComplianceFilter("All Status");
    setActiveTab("All");
  };

  const openReview = (bidder: any) => {
    setSelectedBidderId?.(String(bidder.id));
    setActivePage?.("Verification");
  };

  const createBidder = async () => {
    if (!form.bidder_code.trim() || !form.company_name.trim()) {
      alert("Bidder Code and Company Name are required.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API}/bidders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bidder_code: form.bidder_code.trim(),
          company_name: form.company_name.trim(),
          gstin: form.gstin.trim() || "",
          pan: form.pan.trim() || "",
          udyam_number: form.udyam_number.trim() || "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || "Unable to create bidder"
        );
      }

      alert("Bidder added successfully.");
      setShowModal(false);

      setForm({
        bidder_code: "",
        company_name: "",
        gstin: "",
        pan: "",
        udyam_number: "",
      });

      // App.tsx currently owns the main bidder array.
      // Refreshing the page makes the new record immediately visible.
      window.location.reload();
    } catch (error: any) {
      console.error("Create bidder error:", error);
      alert(error?.message || "Failed to add bidder.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-900">
            <span className="text-blue-600">♙</span>
            Bidders
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View and manage registered bidders
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          + &nbsp;Add Bidder
        </button>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bidders by name, GST, PAN or keyword..."
            className="w-full rounded-xl border border-slate-200 py-3 pl-12 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto p-2">
          {[
            ["All", `All (${counts.all})`],
            ["Verified", `Verified (${counts.verified})`],
            ["Under Review", `Under Review (${counts.review})`],
            ["High Risk", `High Risk (${counts.highRisk})`],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              className={`whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-medium transition ${
                activeTab === value
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-500">
              Category
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 outline-none"
            >
              <option>All Categories</option>
              <option>General</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-500">
              Location
            </label>

            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 outline-none"
            >
              <option>All Locations</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-500">
              Compliance
            </label>

            <select
              value={complianceFilter}
              onChange={(e) => setComplianceFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 outline-none"
            >
              <option>All Status</option>
              <option>Verified</option>
              <option>Under Review</option>
              <option>High Risk</option>
            </select>
          </div>

          <div className="flex items-end gap-3">
            <button
              onClick={resetFilters}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Reset
            </button>

            <button
              onClick={() => {}}
              className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Registered Bidders
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {filteredBidders.length} bidders displayed
            </p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead className="bg-slate-50">
              <tr className="text-[11px] uppercase tracking-wide text-slate-500">
                <th className="px-5 py-4">#</th>
                <th className="px-5 py-4">Organization Name</th>
                <th className="px-5 py-4">GST Number</th>
                <th className="px-5 py-4">PAN</th>
                <th className="px-5 py-4">Documents</th>
                <th className="px-5 py-4">Compliance</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredBidders.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-16 text-center text-sm text-slate-400"
                  >
                    No bidders found.
                  </td>
                </tr>
              ) : (
                filteredBidders.map((bidder, index) => {
                  const info = getBidderInfo(bidder);
                  const compliance = getCompliance(bidder);
                  const status = getStatus(bidder);

                  return (
                    <tr
                      key={bidder.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-5 text-sm text-slate-400">
                        {index + 1}
                      </td>

                      <td className="px-5 py-5">
                        <p className="text-sm font-semibold text-slate-800">
                          {bidder.company_name || "—"}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {bidder.bidder_code || "No bidder code"}
                        </p>
                      </td>

                      <td className="px-5 py-5 text-sm text-slate-600">
                        {bidder.gstin || "—"}
                      </td>

                      <td className="px-5 py-5 text-sm text-slate-600">
                        {bidder.pan || "—"}
                      </td>

                      <td className="px-5 py-5 text-sm text-slate-600">
                        {info.total}
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`text-sm font-bold ${
                            compliance >= 80
                              ? "text-emerald-500"
                              : compliance >= 60
                              ? "text-amber-500"
                              : compliance > 0
                              ? "text-red-500"
                              : "text-slate-400"
                          }`}
                        >
                          {compliance > 0 ? `${compliance}%` : "—"}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-semibold ${
                            status === "Verified"
                              ? "bg-emerald-50 text-emerald-600"
                              : status === "High Risk"
                              ? "bg-red-50 text-red-600"
                              : status === "Under Review"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <button
                          onClick={() => setSelectedBidder(bidder)}
                          className="rounded-lg border border-blue-200 px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Bidder Modal */}
      {selectedBidder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {selectedBidder.company_name}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Bidder Code: {selectedBidder.bidder_code || "—"}
                </p>
              </div>

              <button
                onClick={() => setSelectedBidder(null)}
                className="rounded-lg px-3 py-2 text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
              {[
                ["GST Number", selectedBidder.gstin],
                ["PAN", selectedBidder.pan],
                ["Udyam Number", selectedBidder.udyam_number],
                [
                  "Documents",
                  String(getBidderInfo(selectedBidder).total),
                ],
                [
                  "Compliance",
                  getCompliance(selectedBidder)
                    ? `${getCompliance(selectedBidder)}%`
                    : "Not Verified",
                ],
                ["Status", getStatus(selectedBidder)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl bg-slate-50 p-4"
                >
                  <p className="text-xs font-medium text-slate-400">
                    {label}
                  </p>
                  <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                    {value || "—"}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 p-6">
              <button
                onClick={() => setSelectedBidder(null)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>

              <button
                onClick={() => {
                  const bidder = selectedBidder;
                  setSelectedBidder(null);
                  openReview(bidder);
                }}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Review Verification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Bidder Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Add Bidder
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Register a new bidder in the system
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg px-3 py-2 text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 p-6">
              {[
                ["bidder_code", "Bidder Code", "e.g. B004"],
                [
                  "company_name",
                  "Company Name",
                  "e.g. ABC Technologies Private Limited",
                ],
                ["gstin", "GSTIN", "GST number"],
                ["pan", "PAN", "PAN number"],
                ["udyam_number", "Udyam Number", "Udyam registration number"],
              ].map(([key, label, placeholder]) => (
                <div key={key}>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    {label}
                    {(key === "bidder_code" ||
                      key === "company_name") && (
                      <span className="text-red-500"> *</span>
                    )}
                  </label>

                  <input
                    value={(form as any)[key]}
                    onChange={(e) =>
                      setForm((old) => ({
                        ...old,
                        [key]: e.target.value,
                      }))
                    }
                    placeholder={placeholder}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 p-6">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={createBidder}
                disabled={loading}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Adding..." : "Add Bidder"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Bidders;
