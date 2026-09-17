import { useState } from "react";

type ProfileSettingsProps = {};

function ProfileSettings({}: ProfileSettingsProps) {
  const [activeSection, setActiveSection] =
    useState("Account Settings");

  const [showEditProfile, setShowEditProfile] =
    useState(false);

  const [twoFactor, setTwoFactor] =
    useState(true);

  const [notifications, setNotifications] =
    useState(true);

  const [appearance, setAppearance] =
    useState("Light");

  const [language, setLanguage] =
    useState("English");

  const [saved, setSaved] =
    useState(false);

  // =========================================
  // PROFILE DATA
  // =========================================

  const [profile, setProfile] = useState({
    fullName: "Amit Sharma",
    employeeId: "MEITY001",
    email: "amit.sharma@meity.gov.in",
    department: "Procurement Division",
    phone: "+91 98765 43210",
    designation: "Procurement Officer",
    organization:
      "Ministry of Electronics & IT (MeitY)",
  });

  // =========================================
  // SAVE PROFILE
  // =========================================

  const saveProfile = () => {
    setShowEditProfile(false);
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  // =========================================
  // CHANGE PASSWORD
  // =========================================

  const changePassword = () => {
    const currentPassword = window.prompt(
      "Enter current password:"
    );

    if (!currentPassword) return;

    const newPassword = window.prompt(
      "Enter new password:"
    );

    if (!newPassword) return;

    const confirmPassword = window.prompt(
      "Confirm new password:"
    );

    if (newPassword !== confirmPassword) {
      alert(
        "New password and confirmation do not match."
      );
      return;
    }

    alert(
      "Password updated successfully."
    );
  };

  // =========================================
  // SIDEBAR ITEMS
  // =========================================

  const settingsItems = [
    {
      name: "Account Settings",
      icon: "♙",
    },
    {
      name: "Organization Details",
      icon: "⌂",
    },
    {
      name: "Security",
      icon: "◉",
    },
    {
      name: "Notifications",
      icon: "♧",
    },
    {
      name: "Preferences",
      icon: "⚙",
    },
  ];

  return (
    <div className="space-y-5">

      {/* ========================================= */}
      {/* HEADER */}
      {/* ========================================= */}

      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Profile & Settings
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage your account and preferences
        </p>
      </div>

      {/* ========================================= */}
      {/* MAIN CONTENT */}
      {/* ========================================= */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[190px_minmax(0,1fr)_280px]">

        {/* ========================================= */}
        {/* LEFT SETTINGS MENU */}
        {/* ========================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">

          {settingsItems.map(
            (item) => (
              <button
                key={item.name}
                onClick={() =>
                  setActiveSection(
                    item.name
                  )
                }
                className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-semibold transition ${
                  activeSection ===
                  item.name
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg">
                  {item.icon}
                </span>

                <span>
                  {item.name}
                </span>
              </button>
            )
          )}

        </div>

        {/* ========================================= */}
        {/* CENTER */}
        {/* ========================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* ======================================= */}
          {/* ACCOUNT SETTINGS */}
          {/* ======================================= */}

          {activeSection ===
            "Account Settings" && (
            <div>

              <div className="flex items-center justify-between border-b border-slate-100 p-6">

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Profile Information
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Your account and professional information
                  </p>
                </div>

                <button
                  onClick={() =>
                    setShowEditProfile(
                      true
                    )
                  }
                  className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100"
                >
                  ✎ &nbsp; Edit Profile
                </button>

              </div>

              {/* PROFILE HEADER */}

              <div className="flex items-center gap-4 p-6">

                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                  AS
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {profile.fullName}
                  </h3>

                  <p className="text-xs text-slate-500">
                    {profile.designation}
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    {profile.organization}
                  </p>
                </div>

              </div>

              {/* PROFILE INFORMATION GRID */}

              <div className="grid grid-cols-1 border-t border-slate-100 md:grid-cols-2">

                <div className="border-b border-slate-100 p-5 md:border-r">
                  <p className="text-[11px] font-medium text-slate-400">
                    Full Name
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {profile.fullName}
                  </p>
                </div>

                <div className="border-b border-slate-100 p-5">
                  <p className="text-[11px] font-medium text-slate-400">
                    Employee ID
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {profile.employeeId}
                  </p>
                </div>

                <div className="border-b border-slate-100 p-5 md:border-r">
                  <p className="text-[11px] font-medium text-slate-400">
                    Email Address
                  </p>

                  <p className="mt-1 break-all text-sm font-semibold text-slate-700">
                    {profile.email}
                  </p>
                </div>

                <div className="border-b border-slate-100 p-5">
                  <p className="text-[11px] font-medium text-slate-400">
                    Department
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {profile.department}
                  </p>
                </div>

                <div className="p-5 md:border-r">
                  <p className="text-[11px] font-medium text-slate-400">
                    Phone Number
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {profile.phone}
                  </p>
                </div>

                <div className="p-5">
                  <p className="text-[11px] font-medium text-slate-400">
                    Designation
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {profile.designation}
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* ======================================= */}
          {/* ORGANIZATION DETAILS */}
          {/* ======================================= */}

          {activeSection ===
            "Organization Details" && (
            <div className="p-6">

              <h2 className="text-lg font-bold text-slate-900">
                Organization Details
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Information about your organization
              </p>

              <div className="mt-6 space-y-4">

                <div className="rounded-xl border border-slate-100 p-5">
                  <p className="text-xs text-slate-400">
                    Organization
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {profile.organization}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 p-5">
                  <p className="text-xs text-slate-400">
                    Department
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {profile.department}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 p-5">
                  <p className="text-xs text-slate-400">
                    Designation
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {profile.designation}
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* ======================================= */}
          {/* SECURITY */}
          {/* ======================================= */}

          {activeSection ===
            "Security" && (
            <div className="p-6">

              <h2 className="text-lg font-bold text-slate-900">
                Security
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Manage your account security
              </p>

              <div className="mt-6 space-y-4">

                <div className="flex items-center justify-between rounded-xl border border-slate-100 p-5">

                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      Password
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Change your account password
                    </p>
                  </div>

                  <button
                    onClick={
                      changePassword
                    }
                    className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Change Password
                  </button>

                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-100 p-5">

                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      Two-Factor Authentication
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Add an extra layer of security
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setTwoFactor(
                        !twoFactor
                      )
                    }
                    className={`rounded-full px-4 py-2 text-xs font-semibold ${
                      twoFactor
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {twoFactor
                      ? "Enabled"
                      : "Disabled"}
                  </button>

                </div>

              </div>

            </div>
          )}

          {/* ======================================= */}
          {/* NOTIFICATIONS */}
          {/* ======================================= */}

          {activeSection ===
            "Notifications" && (
            <div className="p-6">

              <h2 className="text-lg font-bold text-slate-900">
                Notification Preferences
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Choose how you want to receive notifications
              </p>

              <div className="mt-6 space-y-3">

                <div className="flex items-center justify-between rounded-xl border border-slate-100 p-5">

                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      System Notifications
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Important system updates
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setNotifications(
                        !notifications
                      )
                    }
                    className={`h-6 w-11 rounded-full p-1 transition ${
                      notifications
                        ? "bg-blue-600"
                        : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`block h-4 w-4 rounded-full bg-white transition ${
                        notifications
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}
                    />
                  </button>

                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-100 p-5">

                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      Verification Alerts
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Alerts for verification results
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                    Enabled
                  </span>

                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-100 p-5">

                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      High Risk Alerts
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Notify when high-risk cases are detected
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                    Enabled
                  </span>

                </div>

              </div>

            </div>
          )}

          {/* ======================================= */}
          {/* PREFERENCES */}
          {/* ======================================= */}

          {activeSection ===
            "Preferences" && (
            <div className="p-6">

              <h2 className="text-lg font-bold text-slate-900">
                Preferences
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Customize your application experience
              </p>

              <div className="mt-6 space-y-4">

                {/* LANGUAGE */}

                <div className="flex items-center justify-between rounded-xl border border-slate-100 p-5">

                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      Language
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Select your preferred language
                    </p>
                  </div>

                  <select
                    value={language}
                    onChange={(e) =>
                      setLanguage(
                        e.target.value
                      )
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 outline-none"
                  >
                    <option>
                      English
                    </option>

                    <option>
                      Hindi
                    </option>
                  </select>

                </div>

                {/* APPEARANCE */}

                <div className="flex items-center justify-between rounded-xl border border-slate-100 p-5">

                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      Appearance
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Choose application appearance
                    </p>
                  </div>

                  <select
                    value={appearance}
                    onChange={(e) =>
                      setAppearance(
                        e.target.value
                      )
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 outline-none"
                  >
                    <option>
                      Light
                    </option>

                    <option>
                      Dark
                    </option>

                    <option>
                      System
                    </option>
                  </select>

                </div>

                <button
                  onClick={saveProfile}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  {saved
                    ? "Preferences Saved ✓"
                    : "Save Preferences"}
                </button>

              </div>

            </div>
          )}

        </div>

        {/* ========================================= */}
        {/* RIGHT QUICK SETTINGS */}
        {/* ========================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <h2 className="text-lg font-bold text-slate-900">
            Quick Settings
          </h2>

          <div className="mt-5 space-y-2">

            {/* CHANGE PASSWORD */}

            <button
              onClick={
                changePassword
              }
              className="flex w-full items-center justify-between rounded-xl p-4 text-left hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                  🔒
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    Change Password
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Update your password
                  </p>
                </div>

              </div>

              <span className="text-slate-400">
                ›
              </span>
            </button>

            {/* TWO FACTOR */}

            <button
              onClick={() =>
                setTwoFactor(
                  !twoFactor
                )
              }
              className="flex w-full items-center justify-between rounded-xl p-4 text-left hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  ♙
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    Two-Factor Authentication
                  </p>

                  <p
                    className={`mt-1 text-[10px] ${
                      twoFactor
                        ? "text-emerald-500"
                        : "text-slate-400"
                    }`}
                  >
                    {twoFactor
                      ? "Enabled"
                      : "Disabled"}
                  </p>
                </div>

              </div>

              <span className="text-slate-400">
                ›
              </span>
            </button>

            {/* NOTIFICATIONS */}

            <button
              onClick={() => {
                setActiveSection(
                  "Notifications"
                );
              }}
              className="flex w-full items-center justify-between rounded-xl p-4 text-left hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  ♧
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    Notification Preferences
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Manage alerts
                  </p>
                </div>

              </div>

              <span className="text-slate-400">
                ›
              </span>
            </button>

            {/* LANGUAGE */}

            <button
              onClick={() =>
                setActiveSection(
                  "Preferences"
                )
              }
              className="flex w-full items-center justify-between rounded-xl p-4 text-left hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                  ◉
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    Language & Region
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    {language}
                  </p>
                </div>

              </div>

              <span className="text-slate-400">
                ›
              </span>
            </button>

            {/* APPEARANCE */}

            <button
              onClick={() =>
                setActiveSection(
                  "Preferences"
                )
              }
              className="flex w-full items-center justify-between rounded-xl p-4 text-left hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                  ◐
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    Appearance
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    {appearance}
                  </p>
                </div>

              </div>

              <span className="text-slate-400">
                ›
              </span>
            </button>

          </div>

        </div>
      </div>

      {/* ========================================= */}
      {/* EDIT PROFILE MODAL */}
      {/* ========================================= */}

      {showEditProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-5">

          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 p-5">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Edit Profile
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Update your profile information
                </p>
              </div>

              <button
                onClick={() =>
                  setShowEditProfile(
                    false
                  )
                }
                className="text-xl text-slate-400 hover:text-slate-600"
              >
                ×
              </button>

            </div>

            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">

              {/* NAME */}

              <div>
                <label className="text-xs font-semibold text-slate-500">
                  Full Name
                </label>

                <input
                  value={profile.fullName}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      fullName:
                        e.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-400"
                />
              </div>

              {/* EMPLOYEE ID */}

              <div>
                <label className="text-xs font-semibold text-slate-500">
                  Employee ID
                </label>

                <input
                  value={profile.employeeId}
                  disabled
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-400"
                />
              </div>

              {/* EMAIL */}

              <div>
                <label className="text-xs font-semibold text-slate-500">
                  Email
                </label>

                <input
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      email:
                        e.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-400"
                />
              </div>

              {/* PHONE */}

              <div>
                <label className="text-xs font-semibold text-slate-500">
                  Phone
                </label>

                <input
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      phone:
                        e.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-400"
                />
              </div>

              {/* DEPARTMENT */}

              <div>
                <label className="text-xs font-semibold text-slate-500">
                  Department
                </label>

                <input
                  value={profile.department}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      department:
                        e.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-400"
                />
              </div>

              {/* DESIGNATION */}

              <div>
                <label className="text-xs font-semibold text-slate-500">
                  Designation
                </label>

                <input
                  value={profile.designation}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      designation:
                        e.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-400"
                />
              </div>

            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 p-5">

              <button
                onClick={() =>
                  setShowEditProfile(
                    false
                  )
                }
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={
                  saveProfile
                }
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Save Changes
              </button>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileSettings;