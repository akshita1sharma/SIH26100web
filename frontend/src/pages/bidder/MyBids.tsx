import { useEffect, useState } from "react";

const API =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

type BidItem = {
  id: number;
  item_id: number;
  quoted_price: number;
  specifications: string;
  delivery_time: string;
  tender_item?: {
    id: number;
    item_name?: string;
    quantity?: number;
    unit?: string;
  };
};

type Bid = {
  id: number;
  bidder_id: number;
  tender_id: number;
  status: string;
  declaration_confirmed: boolean;
  total_amount: number;
  submitted_at: string;
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
  items?: BidItem[];
};

type MyBidsProps = {
  setActivePage: (page: string) => void;
};

export default function MyBids({
  setActivePage,
}: MyBidsProps) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBid, setSelectedBid] =
    useState<Bid | null>(null);

  const loadBids = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API}/bid-submissions/5`
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load submitted bids."
        );
      }

      const result = await response.json();

      setBids(result.submissions || []);
    } catch {
      setError(
        "Unable to load your submitted bids."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBids();
  }, []);

  const money = (value: number) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  const formatDate = (value: string) => {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const statusClass = (status: string) => {
    switch (status?.toUpperCase()) {
      case "SUBMITTED":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";

      case "UNDER_REVIEW":
        return "border-blue-200 bg-blue-50 text-blue-700";

      case "REJECTED":
        return "border-red-200 bg-red-50 text-red-700";

      default:
        return "border-slate-200 bg-slate-50 text-slate-700";
    }
  };

  const totalValue = bids.reduce(
    (sum, bid) =>
      sum + Number(bid.total_amount || 0),
    0
  );

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm text-slate-500">
            Loading your bids...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Bidder Portal
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-950">
            My Bids
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Track all bids submitted by your organization.
          </p>
        </div>

        <button
          onClick={loadBids}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          ↻ Refresh
        </button>

      </div>


      {/* ERROR */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-semibold text-red-700">
            {error}
          </p>

          <button
            onClick={loadBids}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}


      {/* SUMMARY */}
      <div className="grid gap-4 md:grid-cols-3">

        <SummaryCard
          title="Total Bids"
          value={String(bids.length)}
          icon="📄"
        />

        <SummaryCard
          title="Submitted"
          value={String(
            bids.filter(
              (bid) =>
                bid.status?.toUpperCase() ===
                "SUBMITTED"
            ).length
          )}
          icon="✓"
        />

        <SummaryCard
          title="Total Quoted Value"
          value={money(totalValue)}
          icon="₹"
        />

      </div>


      {/* EMPTY STATE */}
      {!error && bids.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
            📄
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            No bids submitted yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Once you submit a bid, it will appear here with its status, quotation value and submitted items.
          </p>

          <button
            onClick={() =>
              setActivePage("MyTenders")
            }
            className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Browse Tenders →
          </button>

        </div>
      )}


      {/* BID LIST */}
      <div className="space-y-4">

        {bids.map((bid) => {

          const tender = bid.tender;
          const items = bid.items || [];

          return (
            <div
              key={bid.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >

              {/* BID HEADER */}
              <div className="border-b border-slate-100 p-6">

                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                  <div>

                    <div className="flex flex-wrap items-center gap-3">

                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                        {tender?.tender_number ||
                          `Tender #${bid.tender_id}`}
                      </span>

                      <span
                        className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase ${statusClass(
                          bid.status
                        )}`}
                      >
                        {bid.status || "SUBMITTED"}
                      </span>

                    </div>

                    <h2 className="mt-2 text-xl font-bold text-slate-950">
                      {tender?.title ||
                        "Submitted Tender"}
                    </h2>

                    {tender?.description && (
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                        {tender.description}
                      </p>
                    )}

                  </div>


                  {/* TOTAL */}
                  <div className="min-w-[190px] rounded-xl bg-slate-50 p-4">

                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Total Bid Value
                    </p>

                    <p className="mt-1 text-xl font-bold text-slate-950">
                      {money(bid.total_amount)}
                    </p>

                  </div>

                </div>

              </div>


              {/* DETAILS */}
              <div className="grid gap-4 p-6 md:grid-cols-4">

                <InfoBox
                  label="Bid ID"
                  value={`#${bid.id}`}
                />

                <InfoBox
                  label="Submitted On"
                  value={formatDate(
                    bid.submitted_at
                  )}
                />

                <InfoBox
                  label="Items Bid"
                  value={`${items.length} item${
                    items.length === 1
                      ? ""
                      : "s"
                  }`}
                />

                <InfoBox
                  label="Declaration"
                  value={
                    bid.declaration_confirmed
                      ? "Confirmed"
                      : "Not confirmed"
                  }
                />

              </div>


              {/* ITEMS */}
              <div className="border-t border-slate-100 p-6">

                <div className="flex items-center justify-between">

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Submitted Items
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      Items included in this bid
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setSelectedBid(bid)
                    }
                    className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    View Bid
                  </button>

                </div>


                <div className="mt-4 grid gap-3 md:grid-cols-2">

                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {item.tender_item
                              ?.item_name ||
                              `Item #${item.item_id}`}
                          </p>

                          {item.tender_item
                            ?.quantity && (
                            <p className="mt-1 text-xs text-slate-400">
                              Quantity:{" "}
                              {item.tender_item.quantity}{" "}
                              {item.tender_item.unit ||
                                "UNIT"}
                            </p>
                          )}
                        </div>

                        <p className="text-sm font-bold text-slate-900">
                          {money(
                            item.quoted_price
                          )}
                        </p>

                      </div>

                      <p className="mt-2 text-xs text-slate-500">
                        Delivery:{" "}
                        {item.delivery_time}
                      </p>

                    </div>
                  ))}

                </div>

              </div>

            </div>
          );
        })}

      </div>


      {/* DETAIL MODAL */}
      {selectedBid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">

          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 p-6">

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Bid #{selectedBid.id}
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  {selectedBid.tender?.title}
                </h2>
              </div>

              <button
                onClick={() =>
                  setSelectedBid(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                ✕
              </button>

            </div>


            <div className="space-y-5 p-6">

              {(selectedBid.items || []).map(
                (item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 p-5"
                  >

                    <div className="flex items-start justify-between">

                      <div>
                        <h3 className="font-bold text-slate-900">
                          {item.tender_item
                            ?.item_name ||
                            `Item #${item.item_id}`}
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                          Quantity:{" "}
                          {item.tender_item
                            ?.quantity ?? "-"}{" "}
                          {item.tender_item
                            ?.unit || ""}
                        </p>
                      </div>

                      <p className="text-lg font-bold text-slate-950">
                        {money(
                          item.quoted_price
                        )}
                      </p>

                    </div>


                    <div className="mt-4 grid gap-4 md:grid-cols-2">

                      <div className="rounded-lg bg-slate-50 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Specifications
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {item.specifications ||
                            "Not specified"}
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Delivery Time
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {item.delivery_time ||
                            "Not specified"}
                        </p>
                      </div>

                    </div>

                  </div>
                )
              )}

            </div>


            <div className="flex justify-end border-t border-slate-100 p-5">

              <button
                onClick={() =>
                  setSelectedBid(null)
                }
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}


function SummaryCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg text-blue-600">
          {icon}
        </div>

      </div>

    </div>
  );
}


function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-800">
        {value}
      </p>

    </div>
  );
}