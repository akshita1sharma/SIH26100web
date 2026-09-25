import { useEffect, useMemo, useState } from "react";

type BidPreparationProps = {
  tenderId: number;
  onClose: () => void;
  onSubmitted: () => void;
};

type TenderItem = {
  id: number;
  item_name: string;
  description?: string;
  material?: string;
  quantity?: number;
  unit?: string;
  estimated_unit_price?: number;
  mandatory_requirements?: string;
};

type Tender = {
  id: number;
  tender_number: string;
  title: string;
  description?: string;
  submission_deadline?: string;
  status?: string;
  department?: string;
  procurement_category?: string;
  minimum_experience_years?: number;
  minimum_annual_turnover?: number;
  gst_required?: boolean;
  pan_required?: boolean;
  udyam_required?: boolean;
};

type TenderDetailsResponse = {
  success: boolean;
  tender: Tender;
  eligibility?: any;
  items: TenderItem[];
};

type Profile = {
  business_type?: string;
  business_description?: string;
  primary_trade?: string;
  products_services?: string;
};

type BidItem = {
  itemId: number;
  quotedPrice: string;
  specifications: string;
  deliveryTime: string;
};

const API =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

export default function BidPreparation({
  tenderId,
  onClose,
  onSubmitted,
}: BidPreparationProps) {
  const [data, setData] =
    useState<TenderDetailsResponse | null>(null);

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [bidItems, setBidItems] =
    useState<Record<number, BidItem>>({});

  const [selectedItems, setSelectedItems] =
    useState<number[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [step, setStep] =
    useState(1);

  const [declaration, setDeclaration] =
    useState(false);

  useEffect(() => {
    loadTender();
  }, [tenderId]);

  // =====================================================
  // LOAD TENDER + PROFILE
  // =====================================================

  const loadTender = async () => {
    try {
      setLoading(true);

      const [
        tenderResponse,
        profileResponse,
      ] = await Promise.all([
        fetch(
          `${API}/tenders/${tenderId}/details`
        ),
        fetch(
          `${API}/bidders/5/profile`
        ),
      ]);

      if (!tenderResponse.ok) {
        throw new Error(
          "Failed to load tender"
        );
      }

      const tenderResult =
        await tenderResponse.json();

      setData(tenderResult);

      if (profileResponse.ok) {
        const profileResult =
          await profileResponse.json();

        setProfile(
          profileResult.profile || null
        );
      }

      const initialItems: Record<
        number,
        BidItem
      > = {};

      (
        tenderResult.items || []
      ).forEach(
        (item: TenderItem) => {
          initialItems[item.id] = {
            itemId: item.id,
            quotedPrice: "",
            specifications: "",
            deliveryTime: "",
          };
        }
      );

      setBidItems(initialItems);
    } catch {
  // Error is handled by the UI state.
} finally {
      setLoading(false);
    }
  };

  // =====================================================
  // NORMALISE TEXT
  // =====================================================

  const normalise = (
    value?: string
  ) =>
    String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  // =====================================================
  // RELEVANCE MATCHING
  // =====================================================

  const calculateItemScore = (
    item: TenderItem
  ) => {
    if (!profile) {
      return 0;
    }

    const profileText = normalise(
      [
        profile.primary_trade,
        profile.products_services,
        profile.business_type,
        profile.business_description,
      ]
        .filter(Boolean)
        .join(" ")
    );

    const itemText = normalise(
      [
        item.item_name,
        item.description,
        item.material,
        item.mandatory_requirements,
      ]
        .filter(Boolean)
        .join(" ")
    );

    if (!profileText || !itemText) {
      return 0;
    }

    let score = 0;

    // -------------------------------------------------
    // Product/service exact matching
    // -------------------------------------------------

    const products =
      profile.products_services
        ?.split(/[,;|]/)
        .map((value) =>
          normalise(value)
        )
        .filter(Boolean) || [];

    products.forEach((product) => {
      if (
        product.length >= 3 &&
        itemText.includes(product)
      ) {
        score += 40;
      }
    });

    // -------------------------------------------------
    // Related product matching
    // -------------------------------------------------

    const relatedTerms: Record<
      string,
      string[]
    > = {
      "desktop computers": [
        "desktop",
        "computer",
        "pc",
        "workstation",
      ],

      "laptops": [
        "laptop",
        "notebook",
      ],

      "printers": [
        "printer",
        "laser",
        "inkjet",
        "mfp",
      ],

      "servers": [
        "server",
        "rack",
        "tower",
      ],

      "networking equipment": [
        "network",
        "switch",
        "router",
        "firewall",
        "ethernet",
        "networking",
      ],

      "ups": [
        "ups",
        "uninterruptible",
        "online ups",
        "power backup",
      ],

      "office furniture": [
        "office",
        "furniture",
        "desk",
        "chair",
        "workstation",
        "table",
      ],
    };

    products.forEach((product) => {
      const aliases =
        relatedTerms[
          product
        ];

      if (!aliases) {
        return;
      }

      aliases.forEach((alias) => {
        if (
          itemText.includes(
            normalise(alias)
          )
        ) {
          score += 15;
        }
      });
    });

    // -------------------------------------------------
    // Primary trade matching
    // -------------------------------------------------

    const tradeWords =
      normalise(
        profile.primary_trade
      )
        .split(" ")
        .filter(
          (word) => word.length >= 4
        );

    tradeWords.forEach((word) => {
      if (itemText.includes(word)) {
        score += 10;
      }
    });

    // -------------------------------------------------
    // Profile keyword matching
    // -------------------------------------------------

    const profileWords = [
      ...new Set(
        profileText
          .split(" ")
          .filter(
            (word) =>
              word.length >= 5
          )
      ),
    ];

    let matchedWords = 0;

    profileWords.forEach(
      (word) => {
        if (
          itemText.includes(word)
        ) {
          matchedWords++;
        }
      }
    );

    score += Math.min(
      matchedWords * 5,
      20
    );

    return Math.min(
      score,
      100
    );
  };

  // =====================================================
  // RELEVANT ITEMS
  // =====================================================

  const relevantItems = useMemo(() => {
    if (!data?.items) {
      return [];
    }

    return data.items
      .map((item) => ({
        item,
        score:
          calculateItemScore(item),
      }))
      .filter(
        ({ score }) => score >= 25
      )
      .sort(
        (a, b) =>
          b.score - a.score
      );
  }, [
    data,
    profile,
  ]);

  // =====================================================
  // ITEMS TO SHOW
  //
  // If matching finds nothing, show all items as
  // "available" rather than leaving bidder stuck.
  // =====================================================

  const displayItems =
    relevantItems.length > 0
      ? relevantItems
      : (data?.items || []).map(
          (item) => ({
            item,
            score: 0,
          })
        );

  // =====================================================
  // SELECT / UNSELECT ITEM
  // =====================================================

  const toggleItem = (
    itemId: number
  ) => {
    setSelectedItems(
      (previous) =>
        previous.includes(itemId)
          ? previous.filter(
              (id) =>
                id !== itemId
            )
          : [
              ...previous,
              itemId,
            ]
    );
  };

  // =====================================================
  // UPDATE BID DATA
  // =====================================================

  const updateBidItem = (
    itemId: number,
    field: keyof BidItem,
    value: string
  ) => {
    setBidItems(
      (previous) => ({
        ...previous,
        [itemId]: {
          ...previous[itemId],
          [field]: value,
        },
      })
    );
  };

  // =====================================================
  // VALIDATE SELECTED ITEMS
  // =====================================================

  const selectedItemsCompleted =
    selectedItems.length > 0 &&
    selectedItems.every(
      (itemId) => {
        const bid =
          bidItems[itemId];

        return (
          bid &&
          bid.quotedPrice.trim() !==
            "" &&
          bid.specifications.trim() !==
            "" &&
          bid.deliveryTime.trim() !==
            ""
        );
      }
    );

  // =====================================================
  // NEXT
  // =====================================================

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
      return;
    }

    if (step === 2) {
      if (
        selectedItems.length === 0
      ) {
        alert(
          "Please select at least one relevant item you want to bid for."
        );
        return;
      }

      if (
        !selectedItemsCompleted
      ) {
        alert(
          "Please complete the price, specifications and delivery details for every selected item."
        );
        return;
      }

      setStep(3);
      return;
    }

    if (step === 3) {
      setStep(4);
    }
  };

  // =====================================================
  // BACK
  // =====================================================

  const handleBack = () => {
    if (step === 1) {
      onClose();
      return;
    }

    setStep(
      (previous) =>
        previous - 1
    );
  };

  // =====================================================
  // SUBMIT
  //
  // Actual backend API will be connected in next step.
  // =====================================================

const handleSubmit = async () => {
  if (!declaration) {
    alert(
      "Please accept the declaration before submitting the bid."
    );
    return;
  }

  if (selectedItems.length === 0) {
    alert(
      "Please select at least one item before submitting."
    );
    return;
  }

  try {
    setSubmitting(true);

    const payload = {
      bidder_id: 5,
      tender_id: tenderId,
      declaration_confirmed: true,

      items: selectedItems.map((itemId) => {
        const bid = bidItems[itemId];

        return {
          item_id: itemId,
          quoted_price: Number(
            bid?.quotedPrice || 0
          ),
          specifications:
            bid?.specifications?.trim() || "",
          delivery_time:
            bid?.deliveryTime?.trim() || "",
        };
      }),
    };

    console.log(
      "Submitting bid payload:",
      payload
    );

    const response = await fetch(
      `${API}/bid-submissions`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      }
    );

    const result =
      await response.json();

if (!response.ok) {
  if (response.status === 409) {
    alert(
      result.detail ||
        "You have already submitted a bid for this tender."
    );

    onSubmitted();
    return;
  }

  throw new Error(
    result.detail ||
      "Failed to submit bid."
  );
}

    console.log(
      "Bid submitted successfully:",
      result
    );

    alert(
      "🎉 Bid submitted successfully!"
    );

    onClose();

  } catch (error) {
    console.error(
      "Bid submission error:",
      error
    );

    alert(
      error instanceof Error
        ? error.message
        : "Unable to submit the bid."
    );

  } finally {
    setSubmitting(false);
  }
};

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (
    value?: string
  ) => {
    if (!value) {
      return "Not specified";
    }

    return new Date(
      value
    ).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  const formatCurrency = (
    value?: number
  ) => {
    if (
      value === undefined ||
      value === null
    ) {
      return "—";
    }

    return `₹${Number(
      value
    ).toLocaleString(
      "en-IN"
    )}`;
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="text-sm text-slate-500">
            Loading bid preparation...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (!data?.tender) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">

        <h2 className="text-lg font-semibold text-red-700">
          Tender details could not be loaded
        </h2>

        <button
          onClick={onClose}
          className="mt-5 rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white"
        >
          Back
        </button>

      </div>
    );
  }

  const tender =
    data.tender;

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm font-medium text-blue-600">
            Bid Preparation
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Prepare Your Bid
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {tender.tender_number}
          </p>

        </div>

        <button
          onClick={onClose}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          ← Back
        </button>

      </div>


      {/* =================================================
          TIMELINE
      ================================================= */}

      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-7 shadow-sm">

        <div className="flex items-start">

          {[
            ["1", "Tender", "Select tender"],
            ["2", "Items", "Choose items"],
            ["3", "Review", "Check bid"],
            ["4", "Submit", "Submit bid"],
          ].map(
            (
              [number, label, subtitle],
              index
            ) => {

              const stepNumber =
                Number(number);

              const current =
                stepNumber === step;

              const completed =
                stepNumber < step;

              return (
                <div
                  key={number}
                  className="flex flex-1 items-start"
                >

                  <div className="flex flex-1 flex-col items-center">

                    <div className="flex w-full items-center">

                      <div
                        className={`h-1 flex-1 ${
                          index === 0
                            ? "bg-transparent"
                            : stepNumber <=
                              step
                            ? "bg-blue-600"
                            : "bg-slate-200"
                        }`}
                      />

                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          current ||
                          completed
                            ? "bg-blue-600 text-white"
                            : "border-2 border-slate-200 bg-white text-slate-400"
                        }`}
                      >
                        {completed
                          ? "✓"
                          : number}
                      </div>

                      <div
                        className={`h-1 flex-1 ${
                          index === 3
                            ? "bg-transparent"
                            : stepNumber <
                              step
                            ? "bg-blue-600"
                            : "bg-slate-200"
                        }`}
                      />

                    </div>

                    <p
                      className={`mt-3 text-sm font-bold ${
                        current ||
                        completed
                          ? "text-blue-600"
                          : "text-slate-500"
                      }`}
                    >
                      {label}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {subtitle}
                    </p>

                  </div>

                </div>
              );
            }
          )}

        </div>

      </div>


      {/* =================================================
          STEP 1
      ================================================= */}

      {step === 1 && (
        <div className="space-y-5">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-slate-900">
              Tender Summary
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">

              <Info
                label="Tender Number"
                value={
                  tender.tender_number
                }
              />

              <Info
                label="Status"
                value={
                  tender.status ||
                  "OPEN"
                }
              />

              <Info
                label="Department"
                value={
                  tender.department ||
                  "Not specified"
                }
              />

              <Info
                label="Category"
                value={
                  tender.procurement_category ||
                  "Not specified"
                }
              />

              <Info
                label="Submission Deadline"
                value={formatDate(
                  tender.submission_deadline
                )}
              />

            </div>

          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-slate-900">
              Eligibility Requirements
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

              <Requirement
                label="Minimum Experience"
                value={
                  tender.minimum_experience_years
                    ? `${tender.minimum_experience_years} years`
                    : "Not specified"
                }
              />

              <Requirement
                label="Minimum Annual Turnover"
                value={formatCurrency(
                  tender.minimum_annual_turnover
                )}
              />

              <Requirement
                label="GST"
                value={
                  tender.gst_required
                    ? "Required"
                    : "Not required"
                }
              />

              <Requirement
                label="PAN"
                value={
                  tender.pan_required
                    ? "Required"
                    : "Not required"
                }
              />

              <Requirement
                label="Udyam"
                value={
                  tender.udyam_required
                    ? "Required"
                    : "Not required"
                }
              />

            </div>

          </div>

        </div>
      )}


      {/* =================================================
          STEP 2
      ================================================= */}

      {step === 2 && (
        <div className="space-y-5">

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">

            <div className="flex items-start gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                ✦
              </div>

              <div>

                <h2 className="font-semibold text-blue-900">
                  Recommended Items for Your Organization
                </h2>

                <p className="mt-1 text-sm leading-6 text-blue-800">
                  Based on your organization profile,
                  these items appear relevant to your
                  business. Select only the items you
                  want to bid for.
                </p>

              </div>

            </div>

          </div>


          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-lg font-semibold text-slate-900">
                Procurement Items
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {selectedItems.length} item
                {selectedItems.length !== 1
                  ? "s"
                  : ""}{" "}
                selected for bidding
              </p>

            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              {displayItems.length} recommended
            </span>

          </div>


          {displayItems.map(
            ({
              item,
              score,
            }, index) => {

              const selected =
                selectedItems.includes(
                  item.id
                );

              const bid =
                bidItems[item.id];

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border bg-white p-6 shadow-sm transition ${
                    selected
                      ? "border-blue-400 ring-2 ring-blue-100"
                      : "border-slate-200"
                  }`}
                >

                  {/* ITEM HEADER */}

                  <div className="flex items-start gap-4">

                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() =>
                        toggleItem(
                          item.id
                        )
                      }
                      className="mt-1 h-5 w-5 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />

                    <div className="flex-1">

                      <div className="flex flex-wrap items-start justify-between gap-3">

                        <div>

                          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                            Item {index + 1}
                          </p>

                          <h3 className="mt-1 text-lg font-semibold text-slate-900">
                            {item.item_name}
                          </h3>

                          {item.description && (
                            <p className="mt-1 text-sm text-slate-500">
                              {item.description}
                            </p>
                          )}

                        </div>

                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                          {score > 0
                            ? `${Math.min(
                                score,
                                100
                              )}% relevant`
                            : "Available"}
                        </span>

                      </div>


                      {/* QUANTITY */}

                      {item.quantity && (
                        <div className="mt-4 inline-flex rounded-lg bg-slate-50 px-3 py-2">

                          <span className="text-xs text-slate-400">
                            Quantity:
                          </span>

                          <span className="ml-2 text-sm font-semibold text-slate-800">
                            {item.quantity}{" "}
                            {item.unit || ""}
                          </span>

                        </div>
                      )}


                      {/* REQUIREMENTS */}

                      {item.mandatory_requirements && (
                        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">

                          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                            Mandatory Requirements
                          </p>

                          <p className="mt-1 text-sm leading-6 text-amber-900">
                            {item.mandatory_requirements}
                          </p>

                        </div>
                      )}


                      {/* BID FORM ONLY WHEN SELECTED */}

                      {selected && (
                        <div className="mt-6 grid gap-5 border-t border-slate-100 pt-6 md:grid-cols-2">

                          <div>

                            <label className="text-sm font-medium text-slate-700">
                              Your Quoted Price *
                            </label>

                            <div className="mt-2 flex items-center rounded-lg border border-slate-300 bg-white">

                              <span className="px-3 text-sm text-slate-500">
                                ₹
                              </span>

                              <input
                                type="number"
                                min="0"
                                value={
                                  bid?.quotedPrice ||
                                  ""
                                }
                                onChange={(e) =>
                                  updateBidItem(
                                    item.id,
                                    "quotedPrice",
                                    e.target.value
                                  )
                                }
                                placeholder="Enter price"
                                className="w-full rounded-r-lg border-0 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                              />

                            </div>

                            {item.estimated_unit_price && (
                              <p className="mt-1 text-xs text-slate-400">
                                Estimated unit price:{" "}
                                {formatCurrency(
                                  item.estimated_unit_price
                                )}
                              </p>
                            )}

                          </div>


                          <div>

                            <label className="text-sm font-medium text-slate-700">
                              Delivery Time *
                            </label>

                            <input
                              type="text"
                              value={
                                bid?.deliveryTime ||
                                ""
                              }
                              onChange={(e) =>
                                updateBidItem(
                                  item.id,
                                  "deliveryTime",
                                  e.target.value
                                )
                              }
                              placeholder="e.g. 30 days"
                              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            />

                          </div>


                          <div className="md:col-span-2">

                            <label className="text-sm font-medium text-slate-700">
                              Offered Specifications *
                            </label>

                            <textarea
                              rows={4}
                              value={
                                bid?.specifications ||
                                ""
                              }
                              onChange={(e) =>
                                updateBidItem(
                                  item.id,
                                  "specifications",
                                  e.target.value
                                )
                              }
                              placeholder="Enter the specifications of the product/service you are offering..."
                              className="mt-2 w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            />

                          </div>

                        </div>
                      )}

                    </div>

                  </div>

                </div>
              );
            }
          )}

        </div>
      )}


      {/* =================================================
          STEP 3 — REVIEW
      ================================================= */}

      {step === 3 && (
        <div className="space-y-5">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-lg font-semibold text-slate-900">
                  Final Review
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Review only the items you selected
                  for bidding.
                </p>

              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                {selectedItems.length} selected
              </span>

            </div>


            <div className="mt-6 space-y-4">

              {selectedItems.map(
                (itemId, index) => {

                  const item =
                    data.items.find(
                      (value) =>
                        value.id ===
                        itemId
                    );

                  const bid =
                    bidItems[itemId];

                  if (!item) {
                    return null;
                  }

                  return (
                    <div
                      key={itemId}
                      className="rounded-xl border border-slate-200 p-5"
                    >

                      <div className="flex items-center justify-between">

                        <div>

                          <p className="text-xs text-slate-400">
                            Selected Item{" "}
                            {index + 1}
                          </p>

                          <h3 className="font-semibold text-slate-800">
                            {item.item_name}
                          </h3>

                        </div>

                        <p className="text-lg font-bold text-slate-900">
                          ₹
                          {Number(
                            bid?.quotedPrice ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>

                      </div>


                      <div className="mt-4 grid gap-4 md:grid-cols-2">

                        <div>

                          <p className="text-xs text-slate-400">
                            Delivery
                          </p>

                          <p className="mt-1 text-sm text-slate-700">
                            {bid?.deliveryTime}
                          </p>

                        </div>

                        <div>

                          <p className="text-xs text-slate-400">
                            Specifications
                          </p>

                          <p className="mt-1 text-sm text-slate-700">
                            {bid?.specifications}
                          </p>

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </div>


          {/* COMPLIANCE */}

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">

            <h3 className="font-semibold text-blue-900">
              Compliance Check
            </h3>

            <p className="mt-2 text-sm leading-6 text-blue-800">
              The selected item quotations will be
              checked against the tender requirements
              before final submission.
            </p>

            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-blue-700">

              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                ✓
              </span>

              {selectedItems.length} selected item
              {selectedItems.length !== 1
                ? "s"
                : ""}{" "}
              ready for compliance review

            </div>

          </div>

        </div>
      )}


      {/* =================================================
          STEP 4 — SUBMIT
      ================================================= */}

      {step === 4 && (
        <div className="space-y-5">

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

            <div className="mx-auto max-w-2xl text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
                ✓
              </div>

              <h2 className="mt-5 text-2xl font-bold text-slate-900">
                Ready to Submit
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                You have selected{" "}
                <strong>
                  {selectedItems.length}
                </strong>{" "}
                item
                {selectedItems.length !==
                1
                  ? "s"
                  : ""}{" "}
                for this tender.
              </p>


              {/* TOTAL */}

              <div className="mx-auto mt-6 max-w-sm rounded-xl bg-slate-50 p-4">

                <p className="text-xs text-slate-400">
                  Total Quotation
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">

                  ₹
                  {selectedItems
                    .reduce(
                      (
                        total,
                        itemId
                      ) =>
                        total +
                        Number(
                          bidItems[
                            itemId
                          ]?.quotedPrice ||
                            0
                        ),
                      0
                    )
                    .toLocaleString(
                      "en-IN"
                    )}

                </p>

              </div>


              {/* DECLARATION */}

             <label
  className={`mt-6 flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-left transition ${
    declaration
      ? "border-emerald-300 bg-emerald-50"
      : "border-slate-200 bg-slate-50 hover:border-blue-300"
  }`}
>

                <input
                  type="checkbox"
                  checked={
                    declaration
                  }
                  onChange={(e) =>
                    setDeclaration(
                      e.target.checked
                    )
                  }
                  className="mt-1 h-4 w-4"
                />

                <span className="text-sm leading-6 text-slate-700">
                  I confirm that the information
                  provided in this bid is accurate and
                  complete, and that I am authorized to
                  submit this bid on behalf of the bidder.
                </span>
{!declaration && (
  <p className="mt-2 text-xs font-medium text-amber-600">
    Please confirm this declaration to enable final submission.
  </p>
)}

{declaration && (
  <p className="mt-2 text-xs font-medium text-emerald-600">
    Declaration accepted. Your bid is ready for submission.
  </p>
)}
              </label>

            </div>

          </div>

        </div>
      )}


      {/* =================================================
          FOOTER
      ================================================= */}

      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <button
          onClick={handleBack}
          className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          ←{" "}
          {step === 1
            ? "Back to Tender"
            : "Previous"}
        </button>


        {step < 4 ? (

          <button
            onClick={handleNext}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Continue →
          </button>

        ) : (

<button
  onClick={handleSubmit}
  disabled={submitting || !declaration}
  className={`rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition ${
    submitting || !declaration
      ? "cursor-not-allowed bg-slate-300"
      : "bg-blue-600 hover:bg-blue-700"
  }`}
>
  {submitting
    ? "Submitting..."
    : !declaration
    ? "Accept Declaration"
    : "Submit Bid"}
</button>

        )}

      </div>

    </div>
  );
}


// =====================================================
// SMALL UI COMPONENTS
// =====================================================

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>

      <p className="text-xs uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-800">
        {value}
      </p>

    </div>
  );
}


function Requirement({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-800">
        {value}
      </p>

    </div>
  );
}