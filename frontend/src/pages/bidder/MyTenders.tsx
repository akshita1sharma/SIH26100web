import { useEffect, useMemo, useState } from "react";

const API =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

type Tender = {
  id: number;
  tender_number?: string;
  title?: string;
  description?: string;
  department?: string;
  procurement_category?: string;
  submission_deadline?: string;
  status?: string;
};

type Profile = {
  business_type?: string;
  business_description?: string;
  primary_trade?: string;
  products_services?: string;
};

type TenderItem = {
  item_name?: string;
  description?: string;
  material?: string;
  mandatory_requirements?: string[];
};

type TenderMatch = {
  tender: Tender;
  score: number;
  reasons: string[];
};

const MyTenders = ({
  setActivePage,
}: {
  setActivePage: (page: string) => void;
}) => {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tenderItems, setTenderItems] = useState<
    Record<number, TenderItem[]>
  >({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setProfileLoading(true);
    setItemsLoading(true);

    try {
      const [tendersResponse, profileResponse] =
        await Promise.all([
          fetch(`${API}/tenders`),
          fetch(`${API}/bidders/5/profile`),
        ]);

      if (!tendersResponse.ok) {
        throw new Error("Failed to load tenders");
      }

      const tenderData = await tendersResponse.json();
      const tenderList: Tender[] =
        tenderData.tenders || [];

      setTenders(tenderList);

      if (profileResponse.ok) {
        const profileData =
          await profileResponse.json();
        setProfile(profileData.profile || null);
      } else {
        setProfile(null);
      }

      // Load procurement items so relevance also considers
      // the actual products required by each officer tender.
      const itemResults = await Promise.all(
        tenderList.map(async (tender) => {
          try {
            const response = await fetch(
              `${API}/tenders/${tender.id}/items`
            );

            if (!response.ok) {
              return {
                id: tender.id,
                items: [],
              };
            }

            const data = await response.json();

            return {
              id: tender.id,
              items: data.items || [],
            };
          } catch {
            return {
              id: tender.id,
              items: [],
            };
          }
        })
      );

      const itemMap: Record<
        number,
        TenderItem[]
      > = {};

      itemResults.forEach((result) => {
        itemMap[result.id] = result.items;
      });

      setTenderItems(itemMap);
    } catch (error) {
      console.error(
        "Failed to load bidder tenders:",
        error
      );

      setTenders([]);
      setProfile(null);
      setTenderItems({});
    } finally {
      setLoading(false);
      setProfileLoading(false);
      setItemsLoading(false);
    }
  };




const calculateMatch = (
  tender: Tender,
  profile: Profile | null
): TenderMatch => {
  if (!profile) {
    return {
      tender,
      score: 0,
      reasons: ["Bidder profile not available"],
    };
  }

  const normalise = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const profileTrade = normalise(profile.primary_trade || "");

  const products = (profile.products_services || "")
    .split(/[,;|]/)
    .map((item) => normalise(item))
    .filter(Boolean);

  const tenderText = normalise(
    [
      tender.title,
      tender.description,
      tender.department,
      tender.procurement_category,
      ...(tenderItems[tender.id] || []).flatMap((item) => [
        item.item_name,
        item.description,
        item.material,
        ...(item.mandatory_requirements || []),
      ]),
    ]
      .filter(Boolean)
      .join(" ")
  );

  if (!tenderText) {
    return {
      tender,
      score: 0,
      reasons: ["No tender information available"],
    };
  }

  /*
   * Related product/category mappings.
   *
   * These allow business categories to match actual tender items.
   * Example:
   * Desktop Computers -> Desktop Computer
   * Printers -> Laser Printer
   * Networking Equipment -> Network Switch
   */
  const relatedTerms: Record<string, string[]> = {
    "desktop computers": [
      "desktop computer",
      "desktop computers",
      "computer",
      "computers",
      "pc",
    ],

    "laptops": [
      "laptop",
      "laptops",
      "notebook",
      "notebooks",
    ],

    "printers": [
      "printer",
      "printers",
      "laser printer",
      "inkjet printer",
      "multifunction printer",
      "mfp",
    ],

    "servers": [
      "server",
      "servers",
      "rack server",
      "tower server",
    ],

    "networking equipment": [
      "network",
      "networking",
      "network equipment",
      "network switch",
      "switch",
      "router",
      "router",
      "firewall",
      "ethernet",
      "networking equipment",
    ],

    "ups": [
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

  const reasons: string[] = [];
  let score = 0;

  const matchedProducts = new Set<string>();

  /*
   * 1. Exact product match
   */
  products.forEach((product) => {
    if (tenderText.includes(product)) {
      matchedProducts.add(product);
    }
  });

  /*
   * 2. Related-category match
   */
  products.forEach((product) => {
    const aliases = relatedTerms[product] || [];

    const matchedAlias = aliases.find((alias) =>
      tenderText.includes(normalise(alias))
    );

    if (matchedAlias && !matchedProducts.has(product)) {
      matchedProducts.add(product);

      reasons.push(
        `${product} is related to tender requirement "${matchedAlias}"`
      );
    }
  });

  /*
   * 3. Give points for matched products
   *
   * Exact match = 20
   * Related match = 15
   */
  products.forEach((product) => {
    if (tenderText.includes(product)) {
      score += 20;

      if (
        !reasons.some((reason) =>
          reason.toLowerCase().includes(product.toLowerCase())
        )
      ) {
        reasons.push(`Product/service match: ${product}`);
      }

      return;
    }

    const aliases = relatedTerms[product] || [];

    const matchedAlias = aliases.find((alias) =>
      tenderText.includes(normalise(alias))
    );

    if (matchedAlias) {
      score += 15;
    }
  });

  /*
   * 4. Primary trade matching
   */
  if (profileTrade) {
    const tradeWords = profileTrade
      .split(/\s+/)
      .filter((word) => word.length >= 3);

    const tradeMatches = tradeWords.filter((word) =>
      tenderText.includes(word)
    );

    if (tradeMatches.length > 0) {
      score += 15;
      reasons.push(
        `Primary trade "${profile.primary_trade}" is relevant to this tender`
      );
    }
  }

  /*
   * 5. Important tender-level keywords
   */
  const keywordGroups = [
    {
      name: "computer",
      keywords: ["computer", "desktop", "laptop", "server"],
    },
    {
      name: "printer",
      keywords: ["printer", "printing"],
    },
    {
      name: "networking",
      keywords: [
        "network",
        "networking",
        "switch",
        "router",
        "ethernet",
      ],
    },
    {
      name: "power backup",
      keywords: ["ups", "power backup", "uninterruptible"],
    },
  ];

  const matchedGroups = keywordGroups.filter((group) =>
    group.keywords.some((keyword) => tenderText.includes(keyword))
  );

  if (matchedGroups.length > 0 && profileTrade.includes("it hardware")) {
    score += Math.min(matchedGroups.length * 5, 15);

    matchedGroups.forEach((group) => {
      if (
        !reasons.some((reason) =>
          reason.toLowerCase().includes(group.name.toLowerCase())
        )
      ) {
        reasons.push(`IT hardware category match: ${group.name}`);
      }
    });
  }

  /*
   * Maximum relevance score = 100
   */
  score = Math.min(score, 100);

  /*
   * Fallback
   */
  if (reasons.length === 0 && score > 0) {
    reasons.push("Tender contains keywords related to bidder's business");
  }

  if (score === 0) {
    reasons.push("No significant product or trade match found");
  }

  return {
    tender,
    score,
    reasons,
  };
};
  // IMPORTANT:
  // Only tenders relevant to the bidder are shown.
  // No "All Available Tenders" section is shown.
  const relevantTenders = useMemo(() => {
    if (
      profileLoading ||
      itemsLoading ||
      !profile ||
      tenders.length === 0
    ) {
      return [];
    }

  return tenders
    .map((tender) => calculateMatch(tender, profile))
    .filter((match) => match.score >= 25)
    .sort((a, b) => b.score - a.score);
}, [
  tenders,
  profile,
  profileLoading,
  itemsLoading,
  tenderItems,
]);

  const filteredTenders = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return relevantTenders;
    }

    return relevantTenders.filter(
      ({ tender }) => {
        const text =
          `${tender.tender_number || ""} ${
            tender.title || ""
          } ${
            tender.description || ""
          }`.toLowerCase();

        return text.includes(query);
      }
    );
  }, [relevantTenders, search]);

  const handleViewTender = (
    tenderId: number
  ) => {
    sessionStorage.setItem(
      "selectedTenderId",
      String(tenderId)
    );

    setActivePage("Tender Details");
  };

  const formatDeadline = (
    deadline?: string
  ) => {
    if (!deadline) return "—";

    const date = new Date(deadline);

    if (Number.isNaN(date.getTime())) {
      return deadline;
    }

    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Bidder Portal
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-950">
            Relevant Tenders
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Tenders matched with your organization's
            trade, products and services.
          </p>
        </div>

        <button
          onClick={() =>
            setActivePage("Dashboard")
          }
          className="text-sm font-semibold text-blue-600"
        >
          ← Dashboard
        </button>
      </header>

      <section className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
            ✦
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Tender recommendations for your
              organization
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              We match your saved organization
              profile with tender descriptions and
              required procurement items.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <input
          type="text"
          placeholder="Search relevant tenders by ID, title or keyword..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
        />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Tenders Relevant to Your Organization
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Only matching tenders are shown.
              </p>
            </div>

            {!loading &&
              !profileLoading &&
              !itemsLoading && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-700">
                  {filteredTenders.length} relevant
                </span>
              )}
          </div>
        </div>

        {loading ||
        profileLoading ||
        itemsLoading ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-slate-400">
              Finding tenders relevant to your
              organization...
            </p>
          </div>
        ) : filteredTenders.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-400">
              ▣
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-700">
              No relevant tenders found
            </h3>

            <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-400">
              No current tender matched the trade,
              products/services or business details
              saved in your organization profile.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-slate-50">
                <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">
                    Tender ID
                  </th>

                  <th className="px-6 py-4">
                    Tender
                  </th>

                  <th className="px-6 py-4">
                    Why Relevant
                  </th>

                  <th className="px-6 py-4">
                    Deadline
                  </th>

                  <th className="px-6 py-4">
                    Match
                  </th>

                  <th className="px-6 py-4">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredTenders.map(
                  ({
                    tender,
                    score,
                    reasons,
                  }) => (
                    <tr
                      key={tender.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-5 text-sm font-bold text-slate-700">
                        {tender.tender_number ||
                          "—"}
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-sm font-semibold text-slate-800">
                          {tender.title ||
                            "Untitled Tender"}
                        </p>

                        <p className="mt-1 max-w-sm text-xs text-slate-400">
                          {tender.description ||
                            "No description available."}
                        </p>
                      </td>

                      <td className="max-w-xs px-6 py-5">
                        {reasons.length > 0 ? (
                          <div className="space-y-1">
                            {reasons
                              .slice(0, 2)
                              .map(
                                (
                                  reason,
                                  index
                                ) => (
                                  <p
                                    key={index}
                                    className="flex gap-2 text-[10px] text-slate-600"
                                  >
                                    <span className="text-emerald-600">
                                      ✓
                                    </span>

                                    <span>
                                      {reason}
                                    </span>
                                  </p>
                                )
                              )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">
                            Profile keyword match
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-5 text-xs text-slate-500">
                        {formatDeadline(
                          tender.submission_deadline
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                          {score}%
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <button
                          onClick={() =>
                            handleViewTender(
                              tender.id
                            )
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

export default MyTenders;
