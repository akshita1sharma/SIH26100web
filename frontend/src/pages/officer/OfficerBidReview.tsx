import { useEffect, useState } from "react";

type OfficerBidsProps = {
  setActivePage: (page: string) => void;
};

type Bid = {
  id: number;
  bidder_id: number;
  tender_id: number;
  status?: string;
  total_amount?: number;
  submitted_at?: string;
  tender?: {
    id: number;
    tender_number?: string;
    title?: string;
    description?: string;
    department?: string;
    procurement_category?: string;
    submission_deadline?: string;
    status?: string;
  };
  bidder?: {
    id: number;
    bidder_code?: string;
    company_name?: string;
    email?: string;
    phone?: string;
  };
  items?: Array<{
    id: number;
    item_id: number;
    quoted_price?: number;
    specifications?: string;
    delivery_time?: string;
    tender_item?: {
      id: number;
      item_name?: string;
      quantity?: number;
      unit?: string;
    };
  }>;
};

type ComplianceResult = {
  overall_score?: number;
  overall_status?: string;
  risk_level?: string;
  summary?: {
    total_checks?: number;
    compliant?: number;
    review?: number;
    non_compliant?: number;
  };
};

const API =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

const OfficerBids = ({ setActivePage }: OfficerBidsProps) => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [compliance, setCompliance] = useState<ComplianceResult | null>(null);
  const [complianceLoading, setComplianceLoading] = useState(false);
  const [error, setError] = useState("");

  const loadBids = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API}/bid-submissions/all`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Unable to load submitted bids.");
      }

      setBids(result.submissions || []);
    } catch (err) {
      console.error("Officer bids loading error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load submitted bids."
      );
      setBids([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBids();
  }, []);

  const formatDate = (value?: string) => {
    if (!value) return "—";
    return new Date(value).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return "—";
    return `₹${Number(value).toLocaleString("en-IN")}`;
  };

  const openCompliance = async (bid: Bid) => {
    setSelectedBid(bid);
    setCompliance(null);
    setComplianceLoading(true);

    try {
      const response = await fetch(
        `${API}/bid-submissions/${bid.id}/compliance`
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Unable to load compliance.");
      }

      setCompliance(result);
    } catch (err) {
      console.error("Compliance loading error:", err);
      setCompliance({
        overall_status: "ERROR",
        risk_level: "UNKNOWN",
      });
    } finally {
      setComplianceLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="text-sm text-slate-500">Loading submitted bids...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Officer Portal
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Submitted Bids
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review bidder submissions and check compliance before tender award.
          </p>
        </div>

        <button
          onClick={loadBids}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          ↻ Refresh
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Bids</p>
          <p className="mt-1 text-3xl font-bold text-slate-950">{bids.length}</p>
          <p className="mt-1 text-xs text-slate-400">Submitted by bidders</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Submitted</p>
          <p className="mt-1 text-3xl font-bold text-emerald-600">
            {bids.filter(
              (bid) => String(bid.status).toUpperCase() === "SUBMITTED"
            ).length}
          </p>
          <p className="mt-1 text-xs text-slate-400">Awaiting officer review</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Tenders Receiving Bids</p>
          <p className="mt-1 text-3xl font-bold text-blue-600">
            {new Set(bids.map((bid) => bid.tender_id)).size}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Unique procurement opportunities
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-lg font-bold text-slate-950">
            Bids Awaiting Review
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Each submitted bid is linked to its bidder and tender.
          </p>
        </div>

        {bids.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-base font-semibold text-slate-700">
              No bids submitted yet
            </p>
            <p className="mt-1 text-sm text-slate-400">
              New bidder submissions will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Bid</th>
                  <th className="px-6 py-4">Bidder</th>
                  <th className="px-6 py-4">Tender</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Submitted</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {bids.map((bid) => (
                  <tr
                    key={bid.id}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                  >
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-900">
                        BID-{String(bid.id).padStart(4, "0")}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Bidder ID: {bid.bidder_id}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      <p className="font-semibold text-slate-800">
                        {bid.bidder?.company_name || `Bidder #${bid.bidder_id}`}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {bid.bidder?.bidder_code ||
                          `B${String(bid.bidder_id).padStart(3, "0")}`}
                      </p>
                    </td>

                    <td className="max-w-[260px] px-6 py-5">
                      <p className="font-semibold text-slate-800">
                        {bid.tender?.title || `Tender #${bid.tender_id}`}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {bid.tender?.tender_number || `Tender ID: ${bid.tender_id}`}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-900">
                        {formatCurrency(bid.total_amount)}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {bid.items?.length || 0} item(s)
                      </p>
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-600">
                      {formatDate(bid.submitted_at)}
                    </td>

                    <td className="px-6 py-5">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        {bid.status || "SUBMITTED"}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => openCompliance(bid)}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
                      >
                        Review Bid
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedBid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Officer Review
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  {selectedBid.tender?.title ||
                    `Tender #${selectedBid.tender_id}`}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedBid.bidder?.company_name ||
                    `Bidder #${selectedBid.bidder_id}`}
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedBid(null);
                  setCompliance(null);
                }}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">Bid ID</p>
                  <p className="mt-1 font-bold text-slate-900">
                    BID-{String(selectedBid.id).padStart(4, "0")}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">Bidder</p>
                  <p className="mt-1 font-bold text-slate-900">
                    {selectedBid.bidder?.company_name ||
                      `Bidder #${selectedBid.bidder_id}`}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">Total Quote</p>
                  <p className="mt-1 font-bold text-slate-900">
                    {formatCurrency(selectedBid.total_amount)}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">Submitted</p>
                  <p className="mt-1 font-bold text-slate-900">
                    {formatDate(selectedBid.submitted_at)}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5">
                <h3 className="font-bold text-slate-900">
                  Compliance Assessment
                </h3>

                {complianceLoading ? (
                  <div className="py-10 text-center text-sm text-slate-500">
                    Checking compliance...
                  </div>
                ) : compliance ? (
                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <div className="rounded-xl bg-blue-50 p-4">
                      <p className="text-xs text-blue-600">Overall Score</p>
                      <p className="mt-1 text-2xl font-bold text-blue-700">
                        {compliance.overall_score ?? "—"}%
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">Status</p>
                      <p className="mt-1 text-lg font-bold text-slate-800">
                        {compliance.overall_status || "—"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-rose-50 p-4">
                      <p className="text-xs text-rose-600">Risk</p>
                      <p className="mt-1 text-lg font-bold text-rose-700">
                        {compliance.risk_level || "—"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-emerald-50 p-4">
                      <p className="text-xs text-emerald-600">Checks</p>
                      <p className="mt-1 text-lg font-bold text-emerald-700">
                        {compliance.summary?.compliant ?? 0} /{" "}
                        {compliance.summary?.total_checks ?? 0}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl border border-slate-200 p-5">
                <h3 className="font-bold text-slate-900">Submitted Items</h3>

                <div className="mt-4 space-y-3">
                  {(selectedBid.items || []).map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="font-bold text-slate-800">
                            {item.tender_item?.item_name ||
                              `Item #${item.item_id}`}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            Required quantity: {item.tender_item?.quantity ?? "—"}{" "}
                            {item.tender_item?.unit || ""}
                          </p>
                        </div>

                        <div className="text-left lg:text-right">
                          <p className="font-bold text-slate-900">
                            {formatCurrency(item.quoted_price)}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            Delivery: {item.delivery_time || "—"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Bidder Specifications
                        </p>
                        <p className="mt-1 text-sm text-slate-700">
                          {item.specifications || "—"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm font-bold text-blue-900">
                  Officer decision
                </p>
                <p className="mt-1 text-xs text-blue-700">
                  Review the bidder documents, compliance result, quotation and
                  submitted item specifications before selecting the appropriate
                  bid for award.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerBids;
