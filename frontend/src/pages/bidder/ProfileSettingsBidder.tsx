import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
type ProfileSettingsProps = {
  setActivePage: (page: string) => void;
};

type BusinessProfile = {
  id?: number;
  bidder_code?: string;

  company_name: string;
  business_type: string;
  business_description: string;
  primary_trade: string;
  products_services: string;

  established_year: string;
  annual_turnover: string;
  employee_count: string;

  email: string;
  phone: string;

  address: string;
  city: string;
  state: string;

  gstin: string;
  pan: string;
  udyam_number: string;
  registration_number: string;

  website: string;
  logo_path: string;
};

const API =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// Current prototype bidder.
// Later this will come from logged-in user/session.
const BIDDER_ID = 5;

const emptyProfile: BusinessProfile = {
  company_name: "",
  business_type: "",
  business_description: "",
  primary_trade: "",
  products_services: "",

  established_year: "",
  annual_turnover: "",
  employee_count: "",

  email: "",
  phone: "",

  address: "",
  city: "",
  state: "",

  gstin: "",
  pan: "",
  udyam_number: "",
  registration_number: "",

  website: "",
  logo_path: "",
};

const ProfileSettingsBidder = ({
  setActivePage,
}: ProfileSettingsProps) => {
  const [activeTab, setActiveTab] =
    useState("Business Profile");

  const [profile, setProfile] =
    useState<BusinessProfile>(emptyProfile);

  const [logoPreview, setLogoPreview] =
    useState<string>("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState(true);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const tabs = [
    "Business Profile",
    "Account Settings",
    "Security",
    "Notifications",
    "Preferences",
  ];

  // =========================================================
  // LOAD PROFILE
  // =========================================================

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API}/bidders/${BIDDER_ID}/profile`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || "Unable to load business profile."
        );
      }

      const p = data.profile || {};

      const loadedProfile: BusinessProfile = {
        company_name: p.company_name || "",
        business_type: p.business_type || "",
        business_description:
          p.business_description || "",

        primary_trade: p.primary_trade || "",
        products_services:
          p.products_services || "",

        established_year:
          p.established_year
            ? String(p.established_year)
            : "",

        annual_turnover:
          p.annual_turnover !== null &&
          p.annual_turnover !== undefined
            ? String(p.annual_turnover)
            : "",

        employee_count:
          p.employee_count !== null &&
          p.employee_count !== undefined
            ? String(p.employee_count)
            : "",

        email: p.email || "",
        phone: p.phone || "",

        address: p.address || "",
        city: p.city || "",
        state: p.state || "",

        gstin: p.gstin || "",
        pan: p.pan || "",
        udyam_number:
          p.udyam_number || "",

        registration_number:
          p.registration_number || "",

        website: p.website || "",
        logo_path: p.logo_path || "",
      };

      setProfile(loadedProfile);

      if (p.logo_path) {
        setLogoPreview(
          getLogoUrl(p.logo_path)
        );
      }

    } catch (err: any) {
      console.error("Profile load error:", err);

      setError(
        err?.message ||
          "Unable to load business profile."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOGO URL
  // =========================================================

  const getLogoUrl = (logoPath: string) => {
    if (!logoPath) {
      return "";
    }

    // If backend already returns a full URL
    if (
      logoPath.startsWith("http://") ||
      logoPath.startsWith("https://")
    ) {
      return logoPath;
    }

    // Backend may return a public storage URL
    return `${API}/storage/${logoPath}`;
  };

  // =========================================================
  // INPUT HANDLER
  // =========================================================

  const handleChange = (
    field: keyof BusinessProfile,
    value: string
  ) => {
    setProfile((previous) => ({
      ...previous,
      [field]: value,
    }));

    setMessage("");
    setError("");
  };

  // =========================================================
  // SAVE PROFILE
  // =========================================================

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      if (!profile.company_name.trim()) {
        setError("Business name is required.");
        return;
      }

      if (!profile.primary_trade.trim()) {
        setError("Primary trade is required.");
        return;
      }

      let establishedYear:
        number | null = null;

      if (profile.established_year.trim()) {
        establishedYear = Number(
          profile.established_year
        );

        if (
          !Number.isInteger(establishedYear) ||
          establishedYear < 1800 ||
          establishedYear > new Date().getFullYear()
        ) {
          setError(
            "Please enter a valid established year."
          );
          return;
        }
      }

      let annualTurnover:
        number | null = null;

      if (profile.annual_turnover.trim()) {
        annualTurnover = Number(
          profile.annual_turnover
        );

        if (
          Number.isNaN(annualTurnover) ||
          annualTurnover < 0
        ) {
          setError(
            "Please enter a valid annual turnover."
          );
          return;
        }
      }

      let employeeCount:
        number | null = null;

      if (profile.employee_count.trim()) {
        employeeCount = Number(
          profile.employee_count
        );

        if (
          !Number.isInteger(employeeCount) ||
          employeeCount < 0
        ) {
          setError(
            "Please enter a valid employee count."
          );
          return;
        }
      }

      const payload = {
        company_name:
          profile.company_name.trim(),

        business_type:
          profile.business_type.trim(),

        business_description:
          profile.business_description.trim(),

        primary_trade:
          profile.primary_trade.trim(),

        products_services:
          profile.products_services.trim(),

        established_year:
          establishedYear,

        annual_turnover:
          annualTurnover,

        employee_count:
          employeeCount,

        email:
          profile.email.trim(),

        phone:
          profile.phone.trim(),

        address:
          profile.address.trim(),

        city:
          profile.city.trim(),

        state:
          profile.state.trim(),

        gstin:
          profile.gstin.trim(),

        pan:
          profile.pan.trim(),

        udyam_number:
          profile.udyam_number.trim(),

        registration_number:
          profile.registration_number.trim(),

        website:
          profile.website.trim(),

        logo_path:
          profile.logo_path || null,
      };

      const response = await fetch(
        `${API}/bidders/${BIDDER_ID}/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Unable to save business profile."
        );
      }

      const saved = data.profile || {};

      setProfile((previous) => ({
        ...previous,

        company_name:
          saved.company_name || "",

        business_type:
          saved.business_type || "",

        business_description:
          saved.business_description || "",

        primary_trade:
          saved.primary_trade || "",

        products_services:
          saved.products_services || "",

        established_year:
          saved.established_year
            ? String(saved.established_year)
            : "",

        annual_turnover:
          saved.annual_turnover !== null &&
          saved.annual_turnover !== undefined
            ? String(saved.annual_turnover)
            : "",

        employee_count:
          saved.employee_count !== null &&
          saved.employee_count !== undefined
            ? String(saved.employee_count)
            : "",

        email: saved.email || "",
        phone: saved.phone || "",

        address: saved.address || "",
        city: saved.city || "",
        state: saved.state || "",

        gstin: saved.gstin || "",
        pan: saved.pan || "",
        udyam_number:
          saved.udyam_number || "",

        registration_number:
          saved.registration_number || "",

        website:
          saved.website || "",

        logo_path:
          saved.logo_path || "",
      }));

      setEditing(false);
      setMessage(
        "Business profile saved successfully."
      );

    } catch (err: any) {
      console.error("Profile save error:", err);

      setError(
        err?.message ||
          "Unable to save business profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // LOGO UPLOAD
  // =========================================================

  const handleLogoChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select an image file."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Logo size must be less than 5 MB."
      );
      return;
    }

    try {
      setError("");
      setMessage("");

      // Show preview immediately
      const reader = new FileReader();

      reader.onload = () => {
        setLogoPreview(
          String(reader.result || "")
        );
      };

      reader.readAsDataURL(file);

      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(
        `${API}/bidders/${BIDDER_ID}/profile/logo`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Unable to upload logo."
        );
      }

      const logoPath =
        data?.logo_path ||
        data?.profile?.logo_path ||
        "";

      if (logoPath) {
        setProfile((previous) => ({
          ...previous,
          logo_path: logoPath,
        }));

        const url =
          data?.logo_url ||
          getLogoUrl(logoPath);

        setLogoPreview(url);
      }

      setMessage(
        "Logo uploaded successfully. Save the profile to keep the change."
      );

    } catch (err: any) {
      console.error("Logo upload error:", err);

      setError(
        err?.message ||
          "Unable to upload logo."
      );
    }
  };

  // =========================================================
  // YEARS IN BUSINESS
  // =========================================================

  const yearsInBusiness = useMemo(() => {
    const year = Number(
      profile.established_year
    );

    if (
      !year ||
      year < 1800 ||
      year > new Date().getFullYear()
    ) {
      return null;
    }

    return new Date().getFullYear() - year;
  }, [profile.established_year]);

  // =========================================================
  // PROFILE INITIALS
  // =========================================================

  const initials = useMemo(() => {
    const name =
      profile.company_name.trim();

    if (!name) {
      return "B";
    }

    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((word) =>
        word.charAt(0).toUpperCase()
      )
      .join("");
  }, [profile.company_name]);

  // =========================================================
  // LOADING SCREEN
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading business profile...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="space-y-6 pb-10">

      {/* HEADER */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Bidder Portal
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-950">
            Profile & Settings
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your business information and account preferences.
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


      {/* ALERTS */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {message}
        </div>
      )}


      {/* PROFILE HEADER */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 p-6">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

            {/* LOGO */}

            <div className="relative">

              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Business logo"
                  className="h-20 w-20 rounded-2xl border border-slate-200 object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white shadow-sm">
                  {initials}
                </div>
              )}

            </div>


            {/* BUSINESS NAME */}

            <div className="flex-1">

              <h2 className="text-xl font-bold text-slate-950">
                {profile.company_name ||
                  "Your Business"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {profile.business_type ||
                  "Business Profile"}
              </p>

              <div className="mt-2 flex items-center gap-2">

                <span className="h-2 w-2 rounded-full bg-emerald-500" />

                <span className="text-xs font-medium text-emerald-600">
                  Profile Active
                </span>

              </div>

            </div>


            {/* EDIT BUTTON */}

            <button
              onClick={() =>
                setEditing(!editing)
              }
              className="rounded-xl border border-blue-200 px-4 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
            >
              {editing
                ? "View Profile"
                : "Edit Profile"}
            </button>

          </div>

        </div>


        {/* TABS */}

        <div className="border-b border-slate-100 px-6">

          <div className="flex gap-6 overflow-x-auto">

            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() =>
                  setActiveTab(tab)
                }
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-semibold transition ${
                  activeTab === tab
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >

                {tab ===
                  "Business Profile" &&
                  "▣ "}

                {tab ===
                  "Account Settings" &&
                  "⚙ "}

                {tab ===
                  "Security" &&
                  "◆ "}

                {tab ===
                  "Notifications" &&
                  "◉ "}

                {tab ===
                  "Preferences" &&
                  "⚙ "}

                {tab}

              </button>
            ))}

          </div>

        </div>


        {/* CONTENT */}

        <div className="p-6">

          {/* ================================================= */}
          {/* BUSINESS PROFILE */}
          {/* ================================================= */}

          {activeTab ===
            "Business Profile" && (

            <div className="space-y-8">

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <h3 className="text-lg font-bold text-slate-950">
                    Business Profile
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    This information will be used to identify your business and match relevant tenders.
                  </p>
                </div>

                {editing && (
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                    Editing
                  </span>
                )}

              </div>


              {/* LOGO */}

              <div className="rounded-2xl border border-slate-200 p-5">

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Business logo"
                      className="h-24 w-24 rounded-2xl border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-slate-100 text-2xl font-bold text-slate-500">
                      {initials}
                    </div>
                  )}

                  <div>

                    <h4 className="font-semibold text-slate-900">
                      Business Logo
                    </h4>

                    <p className="mt-1 text-xs text-slate-500">
                      Upload your company logo. Maximum size 5 MB.
                    </p>

                    {editing && (
                      <label className="mt-3 inline-flex cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">

                        Update Logo

                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={
                            handleLogoChange
                          }
                        />

                      </label>
                    )}

                  </div>

                </div>

              </div>


              {/* BUSINESS INFORMATION */}

              <div>

                <h4 className="mb-4 text-sm font-bold text-slate-900">
                  Business Information
                </h4>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                  <Field
                    label="Business Name"
                    value={profile.company_name}
                    editing={editing}
                    required
                    onChange={(value) =>
                      handleChange(
                        "company_name",
                        value
                      )
                    }
                  />

                  <Field
                    label="Business Type"
                    value={profile.business_type}
                    editing={editing}
                    placeholder="Private Limited / LLP / Proprietorship"
                    onChange={(value) =>
                      handleChange(
                        "business_type",
                        value
                      )
                    }
                  />

                  <Field
                    label="Primary Trade"
                    value={profile.primary_trade}
                    editing={editing}
                    required
                    placeholder="e.g. IT Hardware & Networking"
                    onChange={(value) =>
                      handleChange(
                        "primary_trade",
                        value
                      )
                    }
                  />

                  <Field
                    label="Established Year"
                    value={profile.established_year}
                    editing={editing}
                    type="number"
                    placeholder="e.g. 2020"
                    onChange={(value) =>
                      handleChange(
                        "established_year",
                        value
                      )
                    }
                  />

                </div>


                {/* DESCRIPTION */}

                <div className="mt-4">

                  <label className="text-xs font-semibold text-slate-600">
                    Business Description
                  </label>

                  {editing ? (
                    <textarea
                      value={
                        profile.business_description
                      }
                      onChange={(e) =>
                        handleChange(
                          "business_description",
                          e.target.value
                        )
                      }
                      rows={4}
                      placeholder="Describe what your business does..."
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  ) : (
                    <div className="mt-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      {profile.business_description ||
                        "Not provided"}
                    </div>
                  )}

                </div>

              </div>


              {/* PRODUCTS & SERVICES */}

              <div>

                <h4 className="mb-1 text-sm font-bold text-slate-900">
                  Products & Services
                </h4>

                <p className="mb-4 text-xs text-slate-500">
                  Add the products or services your business provides. These will later help with tender matching.
                </p>

                {editing ? (
                  <textarea
                    value={
                      profile.products_services
                    }
                    onChange={(e) =>
                      handleChange(
                        "products_services",
                        e.target.value
                      )
                    }
                    rows={4}
                    placeholder="Example: Desktop Computers, Laptops, Printers, Servers, Networking Equipment, UPS"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                ) : (
                  <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    {profile.products_services ||
                      "Not provided"}
                  </div>
                )}

              </div>


              {/* BUSINESS SIZE */}

              <div>

                <h4 className="mb-4 text-sm font-bold text-slate-900">
                  Business Experience & Size
                </h4>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                  <Field
                    label="Annual Turnover (₹)"
                    value={
                      profile.annual_turnover
                    }
                    editing={editing}
                    type="number"
                    placeholder="e.g. 5000000"
                    onChange={(value) =>
                      handleChange(
                        "annual_turnover",
                        value
                      )
                    }
                  />

                  <Field
                    label="Number of Employees"
                    value={
                      profile.employee_count
                    }
                    editing={editing}
                    type="number"
                    placeholder="e.g. 25"
                    onChange={(value) =>
                      handleChange(
                        "employee_count",
                        value
                      )
                    }
                  />

                  <Info
                    label="Years in Business"
                    value={
                      yearsInBusiness !== null
                        ? `${yearsInBusiness} years`
                        : "Not available"
                    }
                  />

                </div>

              </div>


              {/* REGISTRATION */}

              <div>

                <h4 className="mb-4 text-sm font-bold text-slate-900">
                  Registration & Compliance
                </h4>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                  <Field
                    label="GSTIN"
                    value={profile.gstin}
                    editing={editing}
                    onChange={(value) =>
                      handleChange(
                        "gstin",
                        value.toUpperCase()
                      )
                    }
                  />

                  <Field
                    label="PAN"
                    value={profile.pan}
                    editing={editing}
                    onChange={(value) =>
                      handleChange(
                        "pan",
                        value.toUpperCase()
                      )
                    }
                  />

                  <Field
                    label="UDYAM Number"
                    value={
                      profile.udyam_number
                    }
                    editing={editing}
                    onChange={(value) =>
                      handleChange(
                        "udyam_number",
                        value
                      )
                    }
                  />

                  <Field
                    label="Registration Number"
                    value={
                      profile.registration_number
                    }
                    editing={editing}
                    onChange={(value) =>
                      handleChange(
                        "registration_number",
                        value
                      )
                    }
                  />

                </div>

              </div>


              {/* CONTACT */}

              <div>

                <h4 className="mb-4 text-sm font-bold text-slate-900">
                  Contact & Address
                </h4>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                  <Field
                    label="Email"
                    value={profile.email}
                    editing={editing}
                    type="email"
                    onChange={(value) =>
                      handleChange(
                        "email",
                        value
                      )
                    }
                  />

                  <Field
                    label="Phone"
                    value={profile.phone}
                    editing={editing}
                    onChange={(value) =>
                      handleChange(
                        "phone",
                        value
                      )
                    }
                  />

                  <Field
                    label="City"
                    value={profile.city}
                    editing={editing}
                    onChange={(value) =>
                      handleChange(
                        "city",
                        value
                      )
                    }
                  />

                  <Field
                    label="State"
                    value={profile.state}
                    editing={editing}
                    onChange={(value) =>
                      handleChange(
                        "state",
                        value
                      )
                    }
                  />

                </div>


                <div className="mt-4">

                  <Field
                    label="Address"
                    value={profile.address}
                    editing={editing}
                    onChange={(value) =>
                      handleChange(
                        "address",
                        value
                      )
                    }
                  />

                </div>


                <div className="mt-4">

                  <Field
                    label="Website"
                    value={profile.website}
                    editing={editing}
                    type="url"
                    placeholder="https://example.com"
                    onChange={(value) =>
                      handleChange(
                        "website",
                        value
                      )
                    }
                  />

                </div>

              </div>


              {/* SAVE */}

              {editing && (
                <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">

                  <button
                    onClick={loadProfile}
                    disabled={saving}
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Reset
                  </button>

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving
                      ? "Saving..."
                      : "Save Business Profile"}
                  </button>

                </div>
              )}

            </div>
          )}


          {/* ================================================= */}
          {/* ACCOUNT SETTINGS */}
          {/* ================================================= */}

          {activeTab ===
            "Account Settings" && (

            <div className="space-y-6">

              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  Account Settings
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Manage your account preferences.
                </p>
              </div>

              <Info
                label="Bidder ID"
                value={String(BIDDER_ID)}
              />

              <Info
                label="Profile Data Source"
                value="Supabase Database"
              />

            </div>
          )}


          {/* ================================================= */}
          {/* SECURITY */}
          {/* ================================================= */}

          {activeTab === "Security" && (

            <div className="space-y-6">

              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  Security
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Security settings will be connected with authentication.
                </p>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Authentication and password management will be connected when the bidder login system is integrated.
              </div>

            </div>
          )}


          {/* ================================================= */}
          {/* NOTIFICATIONS */}
          {/* ================================================= */}

          {activeTab ===
            "Notifications" && (

            <div className="space-y-6">

              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  Notifications
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Configure procurement notifications.
                </p>
              </div>

              <Toggle
                label="Tender Alerts"
                description="Receive notifications about relevant tenders."
                defaultChecked
              />

              <Toggle
                label="Document Expiry Alerts"
                description="Receive alerts when documents are nearing expiry."
                defaultChecked
              />

              <Toggle
                label="Verification Updates"
                description="Receive updates when document verification is completed."
                defaultChecked
              />

            </div>
          )}


          {/* ================================================= */}
          {/* PREFERENCES */}
          {/* ================================================= */}

          {activeTab ===
            "Preferences" && (

            <div className="space-y-6">

              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  Preferences
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Customize your bidder portal experience.
                </p>
              </div>

              <Info
                label="Portal"
                value="Bidder Portal"
              />

              <Info
                label="Data Storage"
                value="Supabase"
              />

            </div>
          )}

        </div>

      </section>

    </div>
  );
};


// =============================================================
// FIELD COMPONENT
// =============================================================

type FieldProps = {
  label: string;
  value: string;
  editing: boolean;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
};

const Field = ({
  label,
  value,
  editing,
  onChange,
  type = "text",
  placeholder,
  required = false,
}: FieldProps) => {

  return (
    <div>

      <label className="text-xs font-semibold text-slate-600">

        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}

      </label>

      {editing ? (
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      ) : (
        <div className="mt-2 min-h-[44px] rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {value || "Not provided"}
        </div>
      )}

    </div>
  );
};


// =============================================================
// INFO COMPONENT
// =============================================================

type InfoProps = {
  label: string;
  value: string;
};

const Info = ({
  label,
  value,
}: InfoProps) => {

  return (
    <div>

      <p className="text-xs font-semibold text-slate-600">
        {label}
      </p>

      <div className="mt-2 min-h-[44px] rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
        {value || "Not provided"}
      </div>

    </div>
  );
};


// =============================================================
// TOGGLE
// =============================================================

type ToggleProps = {
  label: string;
  description: string;
  defaultChecked?: boolean;
};

const Toggle = ({
  label,
  description,
  defaultChecked = false,
}: ToggleProps) => {

  const [checked, setChecked] =
    useState(defaultChecked);

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">

      <div>
        <p className="text-sm font-semibold text-slate-900">
          {label}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() =>
          setChecked(!checked)
        }
        className={`relative h-6 w-11 rounded-full transition ${
          checked
            ? "bg-blue-600"
            : "bg-slate-300"
        }`}
      >

        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />

      </button>

    </div>
  );
};

export default ProfileSettingsBidder;