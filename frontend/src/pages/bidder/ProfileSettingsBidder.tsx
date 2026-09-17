import { useState } from "react";

type ProfileSettingsProps = {
  setActivePage: (page: string) => void;
};

const ProfileSettingsBidder = ({
  setActivePage,
}: ProfileSettingsProps) => {
  const [activeTab, setActiveTab] =
    useState("Organization Details");

  const tabs = [
    "Organization Details",
    "Account Settings",
    "Security",
    "Notifications",
    "Preferences",
  ];

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
            Manage your organization details and account preferences.
          </p>

        </div>

        <button
          onClick={() => setActivePage("Dashboard")}
          className="text-sm font-semibold text-blue-600"
        >
          ← Dashboard
        </button>

      </header>


      {/* PROFILE AREA */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 p-6">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white shadow-sm">
              AS
            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-950">
                ABC Technologies
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Registered Bidder
              </p>

              <div className="mt-2 flex items-center gap-2">

                <span className="h-2 w-2 rounded-full bg-emerald-500" />

                <span className="text-xs font-medium text-emerald-600">
                  Account Active
                </span>

              </div>

            </div>

          </div>

        </div>


        {/* SETTINGS CONTENT */}

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr]">

          {/* LEFT MENU */}

          <div className="border-b border-slate-100 p-4 lg:border-b-0 lg:border-r">

            <div className="space-y-1">

              {tabs.map((tab) => (

                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                    activeTab === tab
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >

                  {tab ===
                    "Organization Details" && "▣ "}

                  {tab ===
                    "Account Settings" && "♙ "}

                  {tab ===
                    "Security" && "◆ "}

                  {tab ===
                    "Notifications" && "◉ "}

                  {tab ===
                    "Preferences" && "⚙ "}

                  {tab}

                </button>

              ))}

            </div>

          </div>


          {/* RIGHT */}

          <div className="p-6">

            {activeTab ===
              "Organization Details" && (

              <div>

                <div className="flex items-center justify-between">

                  <div>

                    <h3 className="text-lg font-bold text-slate-950">
                      Organization Details
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Information used for procurement and compliance.
                    </p>

                  </div>

                  <button className="rounded-xl border border-blue-200 px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50">
                    Edit
                  </button>

                </div>


                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">

                  <Info
                    label="Organization Name"
                    value="ABC Technologies"
                  />

                  <Info
                    label="Email Address"
                    value="contact@abctech.com"
                  />

                  <Info
                    label="Phone Number"
                    value="+91 98765 43210"
                  />

                  <Info
                    label="Address"
                    value="125 Technology Park, Bhopal, Madhya Pradesh"
                  />

                  <Info
                    label="GST Number"
                    value="22ABCDE1234F1ZS"
                  />

                  <Info
                    label="PAN Number"
                    value="ABCDE1234F"
                  />

                  <Info
                    label="Registration Number"
                    value="U74999MP2020PTC012345"
                  />

                  <Info
                    label="Bidder Type"
                    value="Registered Organization"
                  />

                </div>

              </div>

            )}


            {activeTab ===
              "Account Settings" && (

              <div>

                <h3 className="text-lg font-bold text-slate-950">
                  Account Settings
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Manage your account information.
                </p>

                <div className="mt-6 space-y-4">

                  <Info
                    label="Account Email"
                    value="contact@abctech.com"
                  />

                  <Info
                    label="Account Role"
                    value="Bidder"
                  />

                  <Info
                    label="Account Status"
                    value="Active"
                  />

                </div>

              </div>

            )}


            {activeTab === "Security" && (

              <div>

                <h3 className="text-lg font-bold text-slate-950">
                  Security
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Manage your account security settings.
                </p>

                <div className="mt-6 rounded-xl border border-slate-200 p-5">

                  <p className="text-sm font-semibold text-slate-800">
                    Password
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Keep your account password secure and up to date.
                  </p>

                  <button className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white">
                    Change Password
                  </button>

                </div>

              </div>

            )}


            {activeTab ===
              "Notifications" && (

              <div>

                <h3 className="text-lg font-bold text-slate-950">
                  Notifications
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Choose which updates you want to receive.
                </p>

                <div className="mt-6 space-y-3">

                  <Toggle
                    title="Tender Updates"
                    description="Receive notifications about new tenders."
                  />

                  <Toggle
                    title="Verification Updates"
                    description="Get notified when documents are verified."
                  />

                  <Toggle
                    title="Bid Updates"
                    description="Receive updates about submitted bids."
                  />

                </div>

              </div>

            )}


            {activeTab ===
              "Preferences" && (

              <div>

                <h3 className="text-lg font-bold text-slate-950">
                  Preferences
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Customize your portal experience.
                </p>

                <div className="mt-6 space-y-4">

                  <div className="rounded-xl border border-slate-200 p-4">

                    <p className="text-sm font-semibold text-slate-800">
                      Portal Language
                    </p>

                    <select className="mt-3 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                      <option>English</option>
                      <option>Hindi</option>
                    </select>

                  </div>

                </div>

              </div>

            )}

          </div>

        </div>

      </section>

    </div>
  );
};


const Info = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-slate-800">
        {value}
      </p>

    </div>
  );
};


const Toggle = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">

      <div>

        <p className="text-sm font-semibold text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {description}
        </p>

      </div>

      <div className="flex h-6 w-11 items-center rounded-full bg-blue-600 p-1">

        <div className="ml-auto h-4 w-4 rounded-full bg-white shadow-sm" />

      </div>

    </div>
  );
};

export default ProfileSettingsBidder;