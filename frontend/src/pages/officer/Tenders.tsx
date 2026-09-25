import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  X,
  Gavel,
  Package,
  IndianRupee,
  Boxes,
  ShieldCheck,
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

  const [, setTenders] =
    useState<any[]>(initialTenders);

  const [tenderItems, setTenderItems] =
    useState<any[]>([]);

  const [selectedItem, setSelectedItem] =
    useState<any | null>(null);

  const [search, setSearch] =
    useState("");

  const [, setLoading] =
    useState(true);

  const [itemLoading, setItemLoading] =
    useState(true);

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [creating, setCreating] =
    useState(false);

  // ============================================================
  // FORM
  // ============================================================

  const [form, setForm] = useState({
    tender_number: "",
    title: "",
    department: "",
    procurement_category: "",
    description: "",
    submission_deadline: "",
    bid_opening_date: "",
    estimated_value: "",
    minimum_experience_years: "5",
    minimum_annual_turnover: "5000000",
    gst_required: true,
    pan_required: true,
    udyam_required: true,
  });

  // ============================================================
  // LOAD DATA
  // ============================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setItemLoading(true);

      const tenderResponse =
        await fetch(`${API}/tenders`);

      if (tenderResponse.ok) {

        const tenderData =
          await tenderResponse.json();

        setTenders(
          tenderData.tenders || []
        );
      }

      const itemResponse =
        await fetch(`${API}/tenders/5/items`);

      if (itemResponse.ok) {

        const itemData =
          await itemResponse.json();

        setTenderItems(
          itemData.items || []
        );
      }

    } catch (error) {

      console.error(
        "Failed to load tender data:",
        error
      );

      setTenderItems([]);

    } finally {

      setLoading(false);
      setItemLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ============================================================
  // SEARCH
  // ============================================================

  const filteredItems = useMemo(() => {

    const query =
      search.trim().toLowerCase();

    if (!query) {
      return tenderItems;
    }

    return tenderItems.filter(
      (item: any) => {

        const name =
          String(
            item.item_name || ""
          ).toLowerCase();

        const description =
          String(
            item.description || ""
          ).toLowerCase();

        const material =
          String(
            item.material || ""
          ).toLowerCase();

        return (
          name.includes(query) ||
          description.includes(query) ||
          material.includes(query)
        );
      }
    );

  }, [tenderItems, search]);

  // ============================================================
  // CREATE TENDER
  // ============================================================

  const createTender = async () => {

    if (
      !form.tender_number.trim() ||
      !form.title.trim() ||
      !form.department.trim() ||
      !form.procurement_category.trim() ||
      !form.description.trim() ||
      !form.submission_deadline ||
      !form.bid_opening_date ||
      !form.estimated_value
    ) {

      alert(
        "Please fill all required fields."
      );

      return;
    }

    const submission =
      new Date(
        form.submission_deadline
      );

    const opening =
      new Date(
        form.bid_opening_date
      );

    if (
      Number.isNaN(
        submission.getTime()
      ) ||
      Number.isNaN(
        opening.getTime()
      )
    ) {

      alert(
        "Please enter valid dates."
      );

      return;
    }

    if (opening >= submission) {

      alert(
        "Bid opening date must be before the submission deadline."
      );

      return;
    }

    try {

      setCreating(true);

      const response =
        await fetch(
          `${API}/tenders`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              tender_number:
                form.tender_number.trim(),

              title:
                form.title.trim(),

              department:
                form.department.trim(),

              procurement_category:
                form.procurement_category.trim(),

              description:
                form.description.trim(),

              submission_deadline:
                form.submission_deadline,

              bid_opening_date:
                form.bid_opening_date,

              estimated_value:
                Number(
                  form.estimated_value
                ),

              minimum_experience_years:
                Number(
                  form.minimum_experience_years
                ),

              minimum_annual_turnover:
                Number(
                  form.minimum_annual_turnover
                ),

              gst_required:
                form.gst_required,

              pan_required:
                form.pan_required,

              udyam_required:
                form.udyam_required,

              status: "OPEN",
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.detail ||
            "Failed to create tender."
        );
      }

      alert(
        "Tender created successfully."
      );

      setShowCreateModal(false);

      setForm({
        tender_number: "",
        title: "",
        department: "",
        procurement_category: "",
        description: "",
        submission_deadline: "",
        bid_opening_date: "",
        estimated_value: "",
        minimum_experience_years: "5",
        minimum_annual_turnover: "5000000",
        gst_required: true,
        pan_required: true,
        udyam_required: true,
      });

      await loadData();

    } catch (error: any) {

      console.error(
        "Create tender error:",
        error
      );

      alert(
        error.message ||
          "Unable to create tender."
      );

    } finally {

      setCreating(false);
    }
  };

  // ============================================================
  // FORMAT
  // ============================================================

  const formatKey = (
    key: string
  ) =>
    key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );

  const formatValue = (
    value: any
  ) => {

    if (
      typeof value === "boolean"
    ) {
      return value ? "Yes" : "No";
    }

    return String(value);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-[#f6f9fd] -m-8">

      <main className="p-7">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex items-center justify-between mb-6">

          <div>

            <div className="flex items-center gap-2">

              <Gavel
                size={23}
                className="text-blue-600"
              />

              <h1 className="text-[25px] font-bold text-slate-900">
                Tenders
              </h1>

            </div>

            <p className="text-[12px] text-slate-500 mt-1">
              Manage procurement tenders and
              product requirements
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              setShowCreateModal(true)
            }
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold"
          >
            <Plus size={15} />
            Create Tender
          </button>

        </div>

        {/* ======================================================
            ACTIVE PROCUREMENT
        ====================================================== */}

        <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 mb-5">

          <p className="text-[9px] text-blue-600 font-bold uppercase">
            Active Procurement
          </p>

          <h2 className="text-[18px] font-bold text-slate-900 mt-1">
            Office Infrastructure & IT Equipment Procurement
          </h2>

          <p className="text-[11px] text-slate-500 mt-2">
            Procurement of office furniture,
            computing equipment and essential
            office infrastructure.
          </p>

          <div className="grid grid-cols-4 gap-3 mt-5">

            <InfoCard
              icon={<Package size={16} />}
              label="Required Items"
              value={String(
                tenderItems.length
              )}
            />

            <InfoCard
              icon={<Boxes size={16} />}
              label="Total Units"
              value={String(
                tenderItems.reduce(
                  (
                    total: number,
                    item: any
                  ) =>
                    total +
                    Number(
                      item.quantity || 0
                    ),
                  0
                )
              )}
            />

            <InfoCard
              icon={
                <IndianRupee size={16} />
              }
              label="Estimated Value"
              value={`₹${tenderItems
                .reduce(
                  (
                    total: number,
                    item: any
                  ) =>
                    total +
                    Number(
                      item.estimated_price ||
                        0
                    ) *
                      Number(
                        item.quantity || 0
                      ),
                  0
                )
                .toLocaleString(
                  "en-IN"
                )}`}
            />

            <InfoCard
              icon={
                <ShieldCheck size={16} />
              }
              label="Compliance"
              value="Required"
            />

          </div>

        </section>

        {/* ======================================================
            SEARCH
        ====================================================== */}

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-5">

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
              placeholder="Search products, materials or requirements..."
              className="w-full h-11 border border-slate-200 rounded-lg pl-10 pr-4 text-[11px] outline-none focus:border-blue-500"
            />

          </div>

        </div>

        {/* ======================================================
            ITEMS TABLE
        ====================================================== */}

        <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">

            <div>

              <h2 className="text-sm font-bold text-slate-900">
                Required Procurement Items
              </h2>

              <p className="text-[10px] text-slate-400 mt-1">
                Products and specifications
                required for this procurement
              </p>

            </div>

            <button
              onClick={loadData}
              className="text-[10px] text-blue-600 font-semibold"
            >
              Refresh
            </button>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead>

                <tr className="bg-slate-50 border-b">

                  <th className="px-5 py-3 text-left text-[9px] font-bold text-slate-500">
                    #
                  </th>

                  <th className="px-3 py-3 text-left text-[9px] font-bold text-slate-500">
                    PRODUCT
                  </th>

                  <th className="px-3 py-3 text-left text-[9px] font-bold text-slate-500">
                    MATERIAL
                  </th>

                  <th className="px-3 py-3 text-center text-[9px] font-bold text-slate-500">
                    QUANTITY
                  </th>

                  <th className="px-3 py-3 text-right text-[9px] font-bold text-slate-500">
                    ESTIMATED PRICE
                  </th>

                  <th className="px-5 py-3 text-right text-[9px] font-bold text-slate-500">
                    ACTION
                  </th>

                </tr>

              </thead>

              <tbody>

                {itemLoading ? (

                  <tr>
                    <td
                      colSpan={6}
                      className="py-16 text-center"
                    >
                      Loading procurement items...
                    </td>
                  </tr>

                ) : filteredItems.length ===
                  0 ? (

                  <tr>
                    <td
                      colSpan={6}
                      className="py-16 text-center"
                    >
                      No procurement items found.
                    </td>
                  </tr>

                ) : (

                  filteredItems.map(
                    (
                      item: any,
                      index: number
                    ) => (

                      <tr
                        key={item.id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >

                        <td className="px-5 py-4 text-[10px] text-slate-400">
                          {index + 1}
                        </td>

                        <td className="px-3 py-4">

                          <p className="text-[11px] font-bold text-slate-800">
                            {item.item_name}
                          </p>

                          <p className="text-[9px] text-slate-400 mt-1">
                            {item.description}
                          </p>

                        </td>

                        <td className="px-3 py-4 text-[10px]">
                          {item.material || "—"}
                        </td>

                        <td className="px-3 py-4 text-center">

                          <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 text-[9px] font-bold">
                            {item.quantity}{" "}
                            {item.unit}
                          </span>

                        </td>

                        <td className="px-3 py-4 text-right text-[10px] font-semibold">

                          ₹
                          {Number(
                            item.estimated_price ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}

                        </td>

                        <td className="px-5 py-4 text-right">

                          <button
                            onClick={() =>
                              setSelectedItem(
                                item
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-blue-200 text-blue-600 hover:bg-blue-50 text-[9px] font-semibold"
                          >

                            <Eye size={12} />

                            View

                          </button>

                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

        </section>

      </main>

      {/* ========================================================
          PRODUCT VIEW MODAL
      ======================================================== */}

      {selectedItem && (

        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-5">

          <div className="w-full max-w-[680px] max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">

            <div className="px-6 py-5 border-b flex items-center justify-between">

              <div>

                <p className="text-[9px] text-blue-600 font-bold uppercase">
                  Required Product
                </p>

                <h2 className="text-lg font-bold text-slate-900">
                  {selectedItem.item_name}
                </h2>

              </div>

              <button
                onClick={() =>
                  setSelectedItem(null)
                }
              >
                <X
                  size={18}
                  className="text-slate-400"
                />
              </button>

            </div>

            <div className="p-6 overflow-y-auto max-h-[65vh] space-y-5">

              <div>

                <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">
                  Description
                </p>

                <div className="bg-slate-50 rounded-lg p-3 text-[11px] text-slate-600">
                  {selectedItem.description ||
                    "No description available."}
                </div>

              </div>

              <div className="grid grid-cols-3 gap-3">

                <DetailBox
                  label="Material"
                  value={
                    selectedItem.material ||
                    "—"
                  }
                />

                <DetailBox
                  label="Quantity"
                  value={`${selectedItem.quantity} ${
                    selectedItem.unit ||
                    "UNIT"
                  }`}
                />

                <DetailBox
                  label="Estimated Price"
                  value={`₹${Number(
                    selectedItem.estimated_price ||
                      0
                  ).toLocaleString(
                    "en-IN"
                  )}`}
                />

              </div>

              {selectedItem.specifications &&
                Object.keys(
                  selectedItem.specifications
                ).length > 0 && (

                  <div>

                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">
                      Required Specifications
                    </p>

                    <div className="grid grid-cols-2 gap-2">

                      {Object.entries(
                        selectedItem.specifications
                      ).map(
                        (
                          [key, value]
                        ) => (

                          <div
                            key={key}
                            className="border rounded-lg px-3 py-2.5 flex justify-between"
                          >

                            <span className="text-[9px] text-slate-400">
                              {formatKey(key)}
                            </span>

                            <span className="text-[9px] font-semibold text-slate-700">
                              {formatValue(
                                value
                              )}
                            </span>

                          </div>

                        )
                      )}

                    </div>

                  </div>
                )}

              {Array.isArray(
                selectedItem.mandatory_requirements
              ) &&
                selectedItem
                  .mandatory_requirements
                  .length > 0 && (

                  <div>

                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">
                      Mandatory Requirements
                    </p>

                    <div className="space-y-2">

                      {selectedItem.mandatory_requirements.map(
                        (
                          requirement: string,
                          index: number
                        ) => (

                          <div
                            key={index}
                            className="flex gap-2"
                          >

                            <span className="text-emerald-600 font-bold">
                              ✓
                            </span>

                            <span className="text-[10px] text-slate-600">
                              {requirement}
                            </span>

                          </div>

                        )
                      )}

                    </div>

                  </div>
                )}

            </div>

            <div className="px-6 py-4 bg-slate-50 border-t flex justify-end">

              <button
                onClick={() =>
                  setSelectedItem(null)
                }
                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-[10px] font-semibold"
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================
          CREATE TENDER MODAL
      ======================================================== */}

      {showCreateModal && (

        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-5">

          <div className="w-full max-w-[700px] max-h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden">

            {/* HEADER */}

            <div className="px-6 py-5 border-b flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Create New Tender
                </h2>

                <p className="text-[10px] text-slate-400 mt-1">
                  Add procurement and eligibility details
                </p>

              </div>

              <button
                onClick={() =>
                  setShowCreateModal(false)
                }
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"
              >
                <X size={18} />
              </button>

            </div>

            {/* BODY */}

            <div className="p-6 overflow-y-auto max-h-[72vh] space-y-5">

              {/* ==================================================
                  BASIC INFORMATION
              ================================================== */}

              <SectionTitle>
                Tender Information
              </SectionTitle>

              <div className="grid grid-cols-2 gap-4">

                <InputField
                  label="Tender Number"
                  required
                  placeholder="e.g. GEM-2026-017"
                  value={
                    form.tender_number
                  }
                  onChange={(value) =>
                    setForm({
                      ...form,
                      tender_number:
                        value,
                    })
                  }
                />

                <InputField
                  label="Tender Title"
                  required
                  placeholder="Enter tender title"
                  value={form.title}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      title: value,
                    })
                  }
                />

                <InputField
                  label="Department / Organization"
                  required
                  placeholder="e.g. Central Procurement Department"
                  value={
                    form.department
                  }
                  onChange={(value) =>
                    setForm({
                      ...form,
                      department:
                        value,
                    })
                  }
                />

                <InputField
                  label="Procurement Category"
                  required
                  placeholder="e.g. Office Equipment & IT"
                  value={
                    form.procurement_category
                  }
                  onChange={(value) =>
                    setForm({
                      ...form,
                      procurement_category:
                        value,
                    })
                  }
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="block text-[10px] font-semibold text-slate-600 mb-1.5">
                  Description / Scope *
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
                  rows={4}
                  placeholder="Describe the procurement scope and requirements..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-[11px] outline-none resize-none focus:border-blue-500"
                />

              </div>

              {/* ==================================================
                  DATES + VALUE
              ================================================== */}

              <SectionTitle>
                Tender Schedule & Value
              </SectionTitle>

              <div className="grid grid-cols-3 gap-4">

                <InputField
                  label="Submission Deadline"
                  required
                  type="datetime-local"
                  value={
                    form.submission_deadline
                  }
                  onChange={(value) =>
                    setForm({
                      ...form,
                      submission_deadline:
                        value,
                    })
                  }
                />

                <InputField
                  label="Bid Opening Date"
                  required
                  type="datetime-local"
                  value={
                    form.bid_opening_date
                  }
                  onChange={(value) =>
                    setForm({
                      ...form,
                      bid_opening_date:
                        value,
                    })
                  }
                />

                <InputField
                  label="Estimated Tender Value"
                  required
                  type="number"
                  placeholder="₹"
                  value={
                    form.estimated_value
                  }
                  onChange={(value) =>
                    setForm({
                      ...form,
                      estimated_value:
                        value,
                    })
                  }
                />

              </div>

              {/* ==================================================
                  ELIGIBILITY
              ================================================== */}

              <SectionTitle>
                Bidder Eligibility Criteria
              </SectionTitle>

              <div className="grid grid-cols-2 gap-4">

                <InputField
                  label="Minimum Business Experience (Years)"
                  required
                  type="number"
                  value={
                    form.minimum_experience_years
                  }
                  onChange={(value) =>
                    setForm({
                      ...form,
                      minimum_experience_years:
                        value,
                    })
                  }
                />

                <InputField
                  label="Minimum Annual Turnover"
                  required
                  type="number"
                  value={
                    form.minimum_annual_turnover
                  }
                  onChange={(value) =>
                    setForm({
                      ...form,
                      minimum_annual_turnover:
                        value,
                    })
                  }
                />

              </div>

              <div className="grid grid-cols-3 gap-3">

                <CheckBox
                  label="GST Registration Required"
                  checked={
                    form.gst_required
                  }
                  onChange={(value) =>
                    setForm({
                      ...form,
                      gst_required:
                        value,
                    })
                  }
                />

                <CheckBox
                  label="PAN Required"
                  checked={
                    form.pan_required
                  }
                  onChange={(value) =>
                    setForm({
                      ...form,
                      pan_required:
                        value,
                    })
                  }
                />

                <CheckBox
                  label="Udyam / MSME Required"
                  checked={
                    form.udyam_required
                  }
                  onChange={(value) =>
                    setForm({
                      ...form,
                      udyam_required:
                        value,
                    })
                  }
                />

              </div>

            </div>

            {/* ==================================================
                FOOTER
            ================================================== */}

            <div className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-3">

              <button
                type="button"
                onClick={() =>
                  setShowCreateModal(false)
                }
                className="px-5 py-2.5 rounded-lg border border-slate-200 bg-white text-[10px] font-semibold text-slate-600"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={createTender}
                disabled={creating}
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-[10px] font-semibold"
              >
                {creating
                  ? "Creating..."
                  : "Create Tender"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

// ============================================================
// COMPONENTS
// ============================================================

function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pt-1">

      <h3 className="text-[11px] font-bold text-slate-800">
        {children}
      </h3>

      <div className="h-px bg-slate-100 mt-2" />

    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>

      <label className="block text-[10px] font-semibold text-slate-600 mb-1.5">

        {label}

        {required && (
          <span className="text-red-500">
            {" "}*
          </span>
        )}

      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className="w-full h-10 border border-slate-200 rounded-lg px-3 text-[10px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
      />

    </div>
  );
}

function CheckBox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-3 cursor-pointer hover:bg-slate-50">

      <input
        type="checkbox"
        checked={checked}
        onChange={(e) =>
          onChange(
            e.target.checked
          )
        }
        className="accent-blue-600"
      />

      <span className="text-[9px] text-slate-600">
        {label}
      </span>

    </label>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="border border-slate-100 rounded-xl bg-slate-50 p-3">

      <div className="flex items-center gap-2">

        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-600">
          {icon}
        </div>

        <div>

          <p className="text-[8px] uppercase tracking-wide font-bold text-slate-400">
            {label}
          </p>

          <p className="text-[12px] font-bold text-slate-800 mt-0.5">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}

function DetailBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="bg-slate-50 rounded-lg p-3">

      <p className="text-[8px] uppercase tracking-wide font-bold text-slate-400">
        {label}
      </p>

      <p className="text-[10px] font-semibold text-slate-700 mt-1">
        {value}
      </p>

    </div>
  );
}