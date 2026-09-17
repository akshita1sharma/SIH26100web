import { useMemo, useState } from "react";
import {
  Search,
  Bell,
  ChevronDown,
  CalendarDays,
  Plus,
  Eye,
  X,
  Gavel,
  FileText,
} from "lucide-react";

const API =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

type Props = {
  tenders?: any[];
  setActivePage?: (page: string) => void;
};

export default function Tenders({
  tenders: initialTenders = [],
}: Props) {
  const [tenders, setTenders] =
    useState<any[]>(initialTenders);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");

  const [department, setDepartment] =
    useState("ALL");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [showModal, setShowModal] =
    useState(false);

  const [selectedTender, setSelectedTender] =
    useState<any | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [form, setForm] = useState({
    tender_number: "",
    title: "",
    description: "",
    submission_deadline: "",
    status: "OPEN",
  });

  /* =====================================================
     REFRESH TENDERS
  ===================================================== */

  const refreshTenders = async () => {
    try {
      const response = await fetch(
        `${API}/tenders`
      );

      const data = await response.json();

      setTenders(data.tenders || []);
    } catch (error) {
      console.error(
        "Failed to load tenders:",
        error
      );
    }
  };

  /* =====================================================
     CREATE TENDER
  ===================================================== */

  const createTender = async () => {
    if (
      !form.tender_number.trim() ||
      !form.title.trim() ||
      !form.description.trim() ||
      !form.submission_deadline
    ) {
      alert(
        "Please fill all required fields."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API}/tenders`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to create tender"
        );
      }

      await refreshTenders();

      setForm({
        tender_number: "",
        title: "",
        description: "",
        submission_deadline: "",
        status: "OPEN",
      });

      setShowModal(false);

      alert("Tender created successfully.");
    } catch (error) {
      console.error(error);

      alert(
        "Unable to create tender. Please check your backend."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     FILTER DATA
  ===================================================== */

  const departments = useMemo(() => {
    const values = tenders
      .map(
        (tender) =>
          tender.department ||
          tender.organization ||
          ""
      )
      .filter(Boolean);

    return Array.from(
      new Set(values)
    );
  }, [tenders]);

  const filteredTenders = useMemo(() => {
    return tenders.filter((tender) => {
      const number = String(
        tender.tender_number ||
        tender.tender_id ||
        tender.id ||
        ""
      ).toLowerCase();

      const title = String(
        tender.title || ""
      ).toLowerCase();

      const description = String(
        tender.description || ""
      ).toLowerCase();

      const tenderStatus = String(
        tender.status || "OPEN"
      ).toUpperCase();

      const tenderDepartment = String(
        tender.department ||
        tender.organization ||
        ""
      );

      const matchesSearch =
        number.includes(
          search.toLowerCase()
        ) ||
        title.includes(
          search.toLowerCase()
        ) ||
        description.includes(
          search.toLowerCase()
        );

      const matchesDepartment =
        department === "ALL" ||
        tenderDepartment === department;

      const matchesStatus =
        statusFilter === "ALL" ||
        tenderStatus === statusFilter;

      let matchesTab = true;

      if (activeTab === "DRAFT") {
        matchesTab =
          tenderStatus === "DRAFT";
      }

      if (activeTab === "PUBLISHED") {
        matchesTab =
          tenderStatus === "PUBLISHED" ||
          tenderStatus === "OPEN";
      }

      if (
        activeTab === "UNDER_EVALUATION"
      ) {
        matchesTab =
          tenderStatus ===
          "UNDER_EVALUATION";
      }

      if (activeTab === "AWARDED") {
        matchesTab =
          tenderStatus === "AWARDED";
      }

      if (activeTab === "CLOSED") {
        matchesTab =
          tenderStatus === "CLOSED";
      }

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesStatus &&
        matchesTab
      );
    });
  }, [
    tenders,
    search,
    activeTab,
    department,
    statusFilter,
  ]);

  /* =====================================================
     TAB COUNTS
  ===================================================== */

  const countTab = (
    type: string
  ) => {
    if (type === "ALL") {
      return tenders.length;
    }

    if (type === "DRAFT") {
      return tenders.filter(
        (t) =>
          String(
            t.status || ""
          ).toUpperCase() === "DRAFT"
      ).length;
    }

    if (type === "PUBLISHED") {
      return tenders.filter((t) => {
        const status =
          String(
            t.status || ""
          ).toUpperCase();

        return (
          status === "PUBLISHED" ||
          status === "OPEN"
        );
      }).length;
    }

    if (
      type === "UNDER_EVALUATION"
    ) {
      return tenders.filter(
        (t) =>
          String(
            t.status || ""
          ).toUpperCase() ===
          "UNDER_EVALUATION"
      ).length;
    }

    if (type === "AWARDED") {
      return tenders.filter(
        (t) =>
          String(
            t.status || ""
          ).toUpperCase() ===
          "AWARDED"
      ).length;
    }

    if (type === "CLOSED") {
      return tenders.filter(
        (t) =>
          String(
            t.status || ""
          ).toUpperCase() ===
          "CLOSED"
      ).length;
    }

    return 0;
  };

  /* =====================================================
     FORMAT DATE
  ===================================================== */

  const formatDate = (
    date: any
  ) => {
    if (!date) return "—";

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return String(date);
    }

    return parsed.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =====================================================
     STATUS
  ===================================================== */

  const getStatus = (
    tender: any
  ) => {
    const status =
      String(
        tender.status || "OPEN"
      ).toUpperCase();

    if (
      status === "CLOSED"
    ) {
      return {
        label: "CLOSED",
        className:
          "bg-slate-100 text-slate-600",
      };
    }

    if (
      status === "DRAFT"
    ) {
      return {
        label: "DRAFT",
        className:
          "bg-slate-100 text-slate-600",
      };
    }

    if (
      status ===
      "UNDER_EVALUATION"
    ) {
      return {
        label: "UNDER EVALUATION",
        className:
          "bg-purple-50 text-purple-600",
      };
    }

    if (
      status === "AWARDED"
    ) {
      return {
        label: "AWARDED",
        className:
          "bg-blue-50 text-blue-600",
      };
    }

    if (
      status ===
      "CLOSING_SOON"
    ) {
      return {
        label: "CLOSING SOON",
        className:
          "bg-amber-50 text-amber-600",
      };
    }

    if (
      status === "UPCOMING"
    ) {
      return {
        label: "UPCOMING",
        className:
          "bg-blue-50 text-blue-600",
      };
    }

    return {
      label: "OPEN",
      className:
        "bg-emerald-50 text-emerald-600",
    };
  };

  /* =====================================================
     BIDS
  ===================================================== */

  const getBids = (
    tender: any
  ) => {
    return (
      tender.bids ||
      tender.bid_count ||
      tender.total_bids ||
      0
    );
  };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="min-h-screen bg-[#f6f9fd] -m-8">

      {/* =================================================
          TOP TOOLBAR
      ================================================= */}

      <div className="h-[68px] bg-white border-b border-slate-200 px-7 flex items-center justify-between">

        {/* LEFT */}

        <div className="flex items-center gap-4">

          <button
            type="button"
            className="text-slate-400 hover:text-blue-600 text-lg"
          >
            ☰
          </button>

          <div className="relative w-[340px]">

            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search tenders, bidders, documents..."
              className="w-full h-10 rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>

        </div>

        {/* RIGHT */}

        <div className="flex items-center gap-5">

          <div className="relative">

            <Bell
              size={19}
              className="text-slate-500"
            />

            <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">
              0
            </span>

          </div>

          <div className="flex items-center gap-2.5">

            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">
              AS
            </div>

            <div>

              <p className="text-xs font-bold text-slate-800">
                Amit Sharma
              </p>

              <p className="text-[10px] text-slate-400">
                Procurement Officer
              </p>

            </div>

            <ChevronDown
              size={14}
              className="text-slate-400"
            />

          </div>

        </div>

      </div>

      {/* =================================================
          PAGE
      ================================================= */}

      <main className="p-7">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="flex items-center justify-between mb-5">

          <div>

            <div className="flex items-center gap-2">

              <Gavel
                size={22}
                className="text-blue-600"
              />

              <h1 className="text-[25px] font-bold text-slate-900">
                Tenders
              </h1>

            </div>

            <p className="text-[12px] text-slate-500 mt-1">
              Manage and track all procurement tenders
            </p>

          </div>

          <button
            onClick={() =>
              setShowModal(true)
            }
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold shadow-sm transition"
          >
            <Plus size={15} />
            Create Tender
          </button>

        </div>

        {/* =================================================
            SEARCH BAR
        ================================================= */}

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-4">

          <div className="relative">

            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search tenders by title, department or keyword..."
              className="w-full h-11 border border-slate-200 rounded-lg pl-10 pr-4 text-[11px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>

        </div>

        {/* =================================================
            TABS
        ================================================= */}

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-4">

          <div className="flex items-center gap-1 p-2 overflow-x-auto">

            <Tab
              label="All"
              count={countTab("ALL")}
              active={
                activeTab === "ALL"
              }
              onClick={() =>
                setActiveTab("ALL")
              }
            />

            <Tab
              label="Draft"
              count={countTab("DRAFT")}
              active={
                activeTab === "DRAFT"
              }
              onClick={() =>
                setActiveTab("DRAFT")
              }
            />

            <Tab
              label="Published"
              count={countTab(
                "PUBLISHED"
              )}
              active={
                activeTab === "PUBLISHED"
              }
              onClick={() =>
                setActiveTab(
                  "PUBLISHED"
                )
              }
            />

            <Tab
              label="Under Evaluation"
              count={countTab(
                "UNDER_EVALUATION"
              )}
              active={
                activeTab ===
                "UNDER_EVALUATION"
              }
              onClick={() =>
                setActiveTab(
                  "UNDER_EVALUATION"
                )
              }
            />

            <Tab
              label="Awarded"
              count={countTab(
                "AWARDED"
              )}
              active={
                activeTab === "AWARDED"
              }
              onClick={() =>
                setActiveTab("AWARDED")
              }
            />

            <Tab
              label="Closed"
              count={countTab(
                "CLOSED"
              )}
              active={
                activeTab === "CLOSED"
              }
              onClick={() =>
                setActiveTab("CLOSED")
              }
            />

          </div>

        </div>

        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-4">

          <div className="grid grid-cols-4 gap-4">

            {/* DEPARTMENT */}

            <FilterBox
              label="Department"
              icon={<FileText size={13} />}
            >
              <select
                value={department}
                onChange={(e) =>
                  setDepartment(
                    e.target.value
                  )
                }
                className="w-full bg-transparent outline-none text-[11px] text-slate-600"
              >

                <option value="ALL">
                  All Departments
                </option>

                {departments.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}

              </select>
            </FilterBox>

            {/* STATUS */}

            <FilterBox
              label="Status"
              icon={<Gavel size={13} />}
            >

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                className="w-full bg-transparent outline-none text-[11px] text-slate-600"
              >

                <option value="ALL">
                  All Status
                </option>

                <option value="OPEN">
                  Open
                </option>

                <option value="PUBLISHED">
                  Published
                </option>

                <option value="DRAFT">
                  Draft
                </option>

                <option value="UNDER_EVALUATION">
                  Under Evaluation
                </option>

                <option value="AWARDED">
                  Awarded
                </option>

                <option value="CLOSED">
                  Closed
                </option>

              </select>

            </FilterBox>

            {/* DATE */}

            <FilterBox
              label="Date Range"
              icon={
                <CalendarDays
                  size={13}
                />
              }
            >

              <input
                type="date"
                className="w-full bg-transparent outline-none text-[11px] text-slate-500"
              />

            </FilterBox>

            {/* BUTTONS */}

            <div className="flex items-end gap-2">

              <button
                onClick={() => {
                  setSearch("");
                  setDepartment("ALL");
                  setStatusFilter("ALL");
                  setActiveTab("ALL");
                }}
                className="h-10 flex-1 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-500 hover:bg-slate-50"
              >
                Reset
              </button>

              <button
                className="h-10 flex-1 rounded-lg bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-700"
              >
                Apply
              </button>

            </div>

          </div>

        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

          {/* TABLE HEADER */}

          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">

            <div>

              <h2 className="text-sm font-bold text-slate-900">
                Procurement Tenders
              </h2>

              <p className="text-[10px] text-slate-400 mt-1">
                {filteredTenders.length} tender
                {filteredTenders.length !==
                1
                  ? "s"
                  : ""}{" "}
                displayed
              </p>

            </div>

            <button
              onClick={refreshTenders}
              className="text-[10px] text-blue-600 font-semibold hover:underline"
            >
              Refresh
            </button>

          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead>

                <tr className="bg-slate-50 border-b border-slate-200">

                  <th className="px-5 py-3 text-left text-[9px] font-bold text-slate-500 uppercase">
                    #
                  </th>

                  <th className="px-3 py-3 text-left text-[9px] font-bold text-slate-500 uppercase">
                    Tender ID
                  </th>

                  <th className="px-3 py-3 text-left text-[9px] font-bold text-slate-500 uppercase">
                    Title
                  </th>

                  <th className="px-3 py-3 text-left text-[9px] font-bold text-slate-500 uppercase">
                    Department
                  </th>

                  <th className="px-3 py-3 text-left text-[9px] font-bold text-slate-500 uppercase">
                    Deadline
                  </th>

                  <th className="px-3 py-3 text-center text-[9px] font-bold text-slate-500 uppercase">
                    Bids
                  </th>

                  <th className="px-3 py-3 text-left text-[9px] font-bold text-slate-500 uppercase">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right text-[9px] font-bold text-slate-500 uppercase">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredTenders.length ===
                0 ? (

                  <tr>

                    <td
                      colSpan={8}
                      className="py-16 text-center"
                    >

                      <div className="flex flex-col items-center">

                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                          <Gavel
                            size={21}
                          />
                        </div>

                        <p className="text-sm font-semibold text-slate-700">
                          No tenders found
                        </p>

                        <p className="text-[10px] text-slate-400 mt-1">
                          Try changing your search or filters.
                        </p>

                      </div>

                    </td>

                  </tr>

                ) : (

                  filteredTenders.map(
                    (
                      tender,
                      index
                    ) => {

                      const status =
                        getStatus(
                          tender
                        );

                      const id =
                        tender.tender_number ||
                        tender.tender_id ||
                        tender.id ||
                        "—";

                      const title =
                        tender.title ||
                        "Untitled Tender";

                      const dept =
                        tender.department ||
                        tender.organization ||
                        "—";

                      const deadline =
                        tender.submission_deadline ||
                        tender.deadline;

                      return (
                        <tr
                          key={
                            tender.id ||
                            id
                          }
                          className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition"
                        >

                          <td className="px-5 py-4 text-[10px] text-slate-400">
                            {index + 1}
                          </td>

                          <td className="px-3 py-4">

                            <p className="text-[10px] font-semibold text-slate-700">
                              {id}
                            </p>

                          </td>

                          <td className="px-3 py-4 max-w-[230px]">

                            <p className="text-[11px] font-semibold text-slate-800 truncate">
                              {title}
                            </p>

                            {tender.description && (
                              <p className="text-[9px] text-slate-400 mt-1 truncate">
                                {
                                  tender.description
                                }
                              </p>
                            )}

                          </td>

                          <td className="px-3 py-4">

                            <span className="text-[10px] text-slate-600">
                              {dept}
                            </span>

                          </td>

                          <td className="px-3 py-4">

                            <span className="text-[10px] text-slate-600">
                              {formatDate(
                                deadline
                              )}
                            </span>

                          </td>

                          <td className="px-3 py-4 text-center">

                            <span className="text-[10px] font-semibold text-slate-700">
                              {getBids(
                                tender
                              )}
                            </span>

                          </td>

                          <td className="px-3 py-4">

                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-md text-[8px] font-bold ${status.className}`}
                            >
                              {status.label}
                            </span>

                          </td>

                          <td className="px-5 py-4 text-right">

                            <button
                              onClick={() =>
                                setSelectedTender(
                                  tender
                                )
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-blue-200 text-blue-600 bg-white hover:bg-blue-50 text-[9px] font-semibold transition"
                            >
                              <Eye
                                size={12}
                              />
                              View
                            </button>

                          </td>

                        </tr>
                      );
                    }
                  )

                )}

              </tbody>

            </table>

          </div>

        </section>

      </main>

      {/* =================================================
          CREATE TENDER MODAL
      ================================================= */}

      {showModal && (

        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-5">

          <div className="w-full max-w-[560px] bg-white rounded-2xl shadow-2xl overflow-hidden">

            {/* HEADER */}

            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">

              <div>

                <h2 className="text-lg font-bold text-slate-900">
                  Create New Tender
                </h2>

                <p className="text-[10px] text-slate-400 mt-1">
                  Add procurement tender details
                </p>

              </div>

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X size={17} />
              </button>

            </div>

            {/* BODY */}

            <div className="p-6 space-y-4">

              {/* TENDER NUMBER */}

              <div>

                <label className="block text-[10px] font-semibold text-slate-600 mb-1.5">
                  Tender Number *
                </label>

                <input
                  value={
                    form.tender_number
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tender_number:
                        e.target.value,
                    })
                  }
                  placeholder="e.g. GEM-2026-017"
                  className="w-full h-10 border border-slate-200 rounded-lg px-3 text-[11px] outline-none focus:border-blue-500"
                />

              </div>

              {/* TITLE */}

              <div>

                <label className="block text-[10px] font-semibold text-slate-600 mb-1.5">
                  Tender Title *
                </label>

                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title:
                        e.target.value,
                    })
                  }
                  placeholder="Enter tender title"
                  className="w-full h-10 border border-slate-200 rounded-lg px-3 text-[11px] outline-none focus:border-blue-500"
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="block text-[10px] font-semibold text-slate-600 mb-1.5">
                  Description *
                </label>

                <textarea
                  value={
                    form.description
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description:
                        e.target.value,
                    })
                  }
                  placeholder="Describe procurement requirements..."
                  rows={4}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-[11px] outline-none resize-none focus:border-blue-500"
                />

              </div>

              {/* DEADLINE + STATUS */}

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <label className="block text-[10px] font-semibold text-slate-600 mb-1.5">
                    Submission Deadline *
                  </label>

                  <input
                    type="datetime-local"
                    value={
                      form.submission_deadline
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        submission_deadline:
                          e.target.value,
                      })
                    }
                    className="w-full h-10 border border-slate-200 rounded-lg px-3 text-[10px] outline-none focus:border-blue-500"
                  />

                </div>

                <div>

                  <label className="block text-[10px] font-semibold text-slate-600 mb-1.5">
                    Status
                  </label>

                  <select
                    value={
                      form.status
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status:
                          e.target.value,
                      })
                    }
                    className="w-full h-10 border border-slate-200 rounded-lg px-3 text-[11px] outline-none focus:border-blue-500"
                  >

                    <option value="OPEN">
                      Open
                    </option>

                    <option value="DRAFT">
                      Draft
                    </option>

                    <option value="PUBLISHED">
                      Published
                    </option>

                  </select>

                </div>

              </div>

            </div>

            {/* FOOTER */}

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="px-5 py-2.5 rounded-lg border border-slate-200 bg-white text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={createTender}
                disabled={loading}
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-[10px] font-semibold"
              >
                {loading
                  ? "Creating..."
                  : "Create Tender"}
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =================================================
          VIEW TENDER MODAL
      ================================================= */}

      {selectedTender && (

        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-5">

          <div className="w-full max-w-[520px] bg-white rounded-2xl shadow-2xl overflow-hidden">

            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">

              <div>

                <p className="text-[9px] text-blue-600 font-bold uppercase tracking-wide">
                  Tender Details
                </p>

                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedTender.title ||
                    "Tender"}
                </h2>

              </div>

              <button
                onClick={() =>
                  setSelectedTender(
                    null
                  )
                }
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X size={17} />
              </button>

            </div>

            <div className="p-6 space-y-4">

              <DetailRow
                label="Tender ID"
                value={
                  selectedTender.tender_number ||
                  selectedTender.tender_id ||
                  selectedTender.id ||
                  "—"
                }
              />

              <DetailRow
                label="Department"
                value={
                  selectedTender.department ||
                  selectedTender.organization ||
                  "—"
                }
              />

              <DetailRow
                label="Submission Deadline"
                value={formatDate(
                  selectedTender.submission_deadline ||
                    selectedTender.deadline
                )}
              />

              <DetailRow
                label="Bids Received"
                value={String(
                  getBids(
                    selectedTender
                  )
                )}
              />

              <div>

                <p className="text-[9px] uppercase tracking-wide font-bold text-slate-400 mb-2">
                  Status
                </p>

                <span
                  className={`inline-flex px-3 py-1.5 rounded-md text-[9px] font-bold ${
                    getStatus(
                      selectedTender
                    ).className
                  }`}
                >
                  {
                    getStatus(
                      selectedTender
                    ).label
                  }
                </span>

              </div>

              <div>

                <p className="text-[9px] uppercase tracking-wide font-bold text-slate-400 mb-2">
                  Description
                </p>

                <p className="text-[11px] text-slate-600 leading-5 bg-slate-50 rounded-lg p-3">
                  {selectedTender.description ||
                    "No description available."}
                </p>

              </div>

            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">

              <button
                onClick={() =>
                  setSelectedTender(
                    null
                  )
                }
                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-[10px] font-semibold hover:bg-blue-700"
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

/* =====================================================
   TAB
===================================================== */

function Tab({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-lg text-[10px] font-semibold whitespace-nowrap transition ${
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "text-slate-500 hover:bg-slate-50"
      }`}
    >
      {label}{" "}
      <span
        className={
          active
            ? "opacity-80"
            : "text-slate-400"
        }
      >
        ({count})
      </span>
    </button>
  );
}

/* =====================================================
   FILTER BOX
===================================================== */

function FilterBox({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>

      <label className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 mb-1.5">
        {icon}
        {label}
      </label>

      <div className="h-10 border border-slate-200 rounded-lg px-3 flex items-center bg-white">
        {children}
      </div>

    </div>
  );
}

/* =====================================================
   DETAIL ROW
===================================================== */

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100">

      <span className="text-[10px] text-slate-400">
        {label}
      </span>

      <span className="text-[10px] font-semibold text-slate-700 text-right max-w-[250px]">
        {value}
      </span>

    </div>
  );
}