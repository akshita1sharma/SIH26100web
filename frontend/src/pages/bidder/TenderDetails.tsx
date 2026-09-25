import { useEffect, useMemo, useState } from "react";

const API =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

type TenderDetailsProps = {
  tenderId: number;
  onClose: () => void;
  onPrepareBid: (tenderId: number) => void;
};

type BidderProfile = {
  business_type?: string;
  business_description?: string;
  primary_trade?: string;
  products_services?: string;
};

export default function TenderDetails({
  tenderId,
  onClose,
  onPrepareBid,
}: TenderDetailsProps) {
  const [data, setData] = useState<any>(null);
  const [profile, setProfile] =
    useState<BidderProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetails();
  }, [tenderId]);

  const loadDetails = async () => {
    try {
      setLoading(true);

      const [tenderResponse, profileResponse] =
        await Promise.all([
          fetch(
            `${API}/tenders/${tenderId}/details`
          ),
          fetch(
            `${API}/bidders/5/profile`
          ),
        ]);

      if (!tenderResponse.ok) {
        throw new Error(
          "Unable to load tender details."
        );
      }

      const result =
        await tenderResponse.json();

      setData(result);

      if (profileResponse.ok) {
        const profileData =
          await profileResponse.json();

        setProfile(
          profileData.profile || null
        );
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error(
        "Tender details error:",
        error
      );

      setData(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const tender = data?.tender;

  const eligibility =
    data?.eligibility || tender;

  const items = data?.items || [];

  /*
   * --------------------------------------------------
   * RELEVANCE MAPPING
   * --------------------------------------------------
   *
   * Maps bidder business categories to related
   * procurement items.
   */
  const relatedTerms: Record<
    string,
    string[]
  > = {
    "desktop computers": [
      "desktop computer",
      "desktop computers",
      "computer",
      "computers",
      "pc",
      "pcs",
    ],

    laptops: [
      "laptop",
      "laptops",
      "notebook",
      "notebooks",
    ],

    printers: [
      "printer",
      "printers",
      "laser printer",
      "inkjet printer",
      "multifunction printer",
      "mfp",
    ],

    servers: [
      "server",
      "servers",
      "rack server",
      "tower server",
    ],

    "networking equipment": [
      "network",
      "networking",
      "network equipment",
      "networking equipment",
      "network switch",
      "switch",
      "router",
      "routers",
      "firewall",
      "ethernet",
    ],

    ups: [
      "ups",
      "uninterruptible power supply",
      "online ups",
      "offline ups",
      "power backup",
    ],

    "office furniture": [
      "office furniture",
      "workstation",
      "workstation desk",
      "office workstation desk",
      "office chair",
      "chair",
      "desk",
      "table",
    ],
  };

  const normalise = (
    value: string
  ) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  /*
   * --------------------------------------------------
   * FIND RELEVANT ITEMS
   * --------------------------------------------------
   */
  const relevantItems = useMemo(() => {
    if (!profile || items.length === 0) {
      return [];
    }

    const products =
      String(
        profile.products_services || ""
      )
        .split(/[,;|]/)
        .map((product) =>
          normalise(product)
        )
        .filter(Boolean);

    const primaryTrade =
      normalise(
        profile.primary_trade || ""
      );

    return items.filter(
      (item: any) => {
        const itemText = normalise(
          [
            item.item_name || "",
            item.description || "",
            item.material || "",
            ...(item.mandatory_requirements ||
              []),
          ].join(" ")
        );

        /*
         * Exact product/category matching
         */
        const directMatch =
          products.some((product) => {
            if (
              itemText.includes(product)
            ) {
              return true;
            }

            const aliases =
              relatedTerms[product] || [];

            return aliases.some(
              (alias) =>
                itemText.includes(
                  normalise(alias)
                )
            );
          });

        if (directMatch) {
          return true;
        }

        /*
         * IT Hardware category matching
         */
        if (
          primaryTrade.includes(
            "it hardware"
          )
        ) {
          const itKeywords = [
            "computer",
            "desktop",
            "laptop",
            "printer",
            "server",
            "network",
            "switch",
            "router",
            "ethernet",
            "ups",
            "power backup",
          ];

          return itKeywords.some(
            (keyword) =>
              itemText.includes(keyword)
          );
        }

        return false;
      }
    );
  }, [profile, items]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">

      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
              Tender Details
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {loading
                ? "Loading..."
                : tender?.title ||
                  "Tender"}
            </h2>

            {!loading && tender && (
              <p className="mt-1 text-xs text-slate-400">
                {tender.tender_number}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>

        </div>

        {/* BODY */}

        <div className="overflow-y-auto p-6">

          {loading ? (
            <div className="py-20 text-center">
              <p className="text-sm text-slate-400">
                Loading tender details...
              </p>
            </div>
          ) : !tender ? (
            <div className="py-20 text-center">

              <p className="text-sm font-semibold text-slate-600">
                Unable to load tender details.
              </p>

              <button
                onClick={onClose}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
              >
                Close
              </button>

            </div>
          ) : (
            <div className="space-y-6">

              {/* BASIC INFO */}

              <section>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Procurement Overview
                </p>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                  <p className="text-sm leading-6 text-slate-600">
                    {tender.description ||
                      "No description available."}
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">

                    <Info
                      label="Department"
                      value={
                        tender.department ||
                        "—"
                      }
                    />

                    <Info
                      label="Category"
                      value={
                        tender.procurement_category ||
                        "—"
                      }
                    />

                    <Info
                      label="Status"
                      value={
                        tender.status ||
                        "OPEN"
                      }
                    />

                  </div>

                </div>
              </section>

              {/* SCHEDULE */}

              <section>

                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Tender Schedule
                </p>

                <div className="grid gap-3 sm:grid-cols-2">

                  <Info
                    label="Submission Deadline"
                    value={formatDate(
                      tender.submission_deadline
                    )}
                  />

                  <Info
                    label="Estimated Value"
                    value={
                      tender.estimated_value
                        ? `₹${Number(
                            tender.estimated_value
                          ).toLocaleString(
                            "en-IN"
                          )}`
                        : "—"
                    }
                  />

                </div>

              </section>

              {/* ELIGIBILITY */}

              <section>

                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Bidder Eligibility
                </p>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                  <Info
                    label="Minimum Experience"
                    value={
                      eligibility?.minimum_experience_years != null
                        ? `${eligibility.minimum_experience_years} years`
                        : "—"
                    }
                  />

                  <Info
                    label="Minimum Annual Turnover"
                    value={
                      eligibility?.minimum_annual_turnover != null
                        ? `₹${Number(
                            eligibility.minimum_annual_turnover
                          ).toLocaleString(
                            "en-IN"
                          )}`
                        : "—"
                    }
                  />

                  <Info
                    label="GST Required"
                    value={
                      eligibility?.gst_required
                        ? "Yes"
                        : "No"
                    }
                  />

                  <Info
                    label="PAN Required"
                    value={
                      eligibility?.pan_required
                        ? "Yes"
                        : "No"
                    }
                  />

                  <Info
                    label="Udyam / MSME"
                    value={
                      eligibility?.udyam_required
                        ? "Yes"
                        : "No"
                    }
                  />

                </div>

              </section>

              {/* RELEVANT ITEMS */}

              <section>

                <div className="mb-3">

                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Relevant Procurement Items
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Procurement items matching
                    your organization's
                    products and services.
                  </p>

                </div>

                {relevantItems.length === 0 ? (

                  <div className="rounded-xl border border-slate-200 p-5 text-center">

                    <p className="text-xs text-slate-400">
                      No procurement items
                      matched your
                      organization profile.
                    </p>

                  </div>

                ) : (

                  <>
                    <div className="mb-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">

                      <p className="text-xs font-semibold text-blue-700">
                        {relevantItems.length} relevant{" "}
                        {relevantItems.length === 1
                          ? "item"
                          : "items"}{" "}
                        found for your organization
                      </p>

                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200">

                      <table className="w-full min-w-[650px]">

                        <thead className="bg-slate-50">

                          <tr>

                            <th className="px-4 py-3 text-left text-[9px] font-bold uppercase text-slate-400">
                              Product
                            </th>

                            <th className="px-4 py-3 text-left text-[9px] font-bold uppercase text-slate-400">
                              Material
                            </th>

                            <th className="px-4 py-3 text-center text-[9px] font-bold uppercase text-slate-400">
                              Quantity
                            </th>

                            <th className="px-4 py-3 text-right text-[9px] font-bold uppercase text-slate-400">
                              Price
                            </th>

                          </tr>

                        </thead>

                        <tbody className="divide-y divide-slate-100">

                          {relevantItems.map(
                            (
                              item: any,
                              index: number
                            ) => (

                              <tr
                                key={
                                  item.id ??
                                  index
                                }
                              >

                                <td className="px-4 py-3">

                                  <p className="text-xs font-semibold text-slate-700">
                                    {item.item_name ||
                                      "—"}
                                  </p>

                                  {item.description && (
                                    <p className="mt-1 text-[9px] text-slate-400">
                                      {
                                        item.description
                                      }
                                    </p>
                                  )}

                                </td>

                                <td className="px-4 py-3 text-xs text-slate-500">
                                  {item.material ||
                                    "—"}
                                </td>

                                <td className="px-4 py-3 text-center text-xs font-semibold text-slate-600">
                                  {item.quantity ||
                                    "—"}{" "}
                                  {item.unit ||
                                    ""}
                                </td>

                                <td className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                                  {item.estimated_price
                                    ? `₹${Number(
                                        item.estimated_price
                                      ).toLocaleString(
                                        "en-IN"
                                      )}`
                                    : "—"}
                                </td>

                              </tr>

                            )
                          )}

                        </tbody>

                      </table>

                    </div>
                  </>

                )}

              </section>

            </div>
          )}

        </div>

        {/* FOOTER */}

        {!loading && tender && (

          <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">

            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Close
            </button>

            <button
              onClick={() =>
                onPrepareBid(tender.id)
              }
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Prepare Bid →
            </button>

          </div>

        )}

      </div>
    </div>
  );
}


/* -------------------------------------------------- */
/* HELPERS */
/* -------------------------------------------------- */

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">

      <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xs font-semibold text-slate-700">
        {value}
      </p>

    </div>
  );
}


function formatDate(
  value?: string
) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}