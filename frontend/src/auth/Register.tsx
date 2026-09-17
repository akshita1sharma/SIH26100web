import { useState } from "react";

type RegisterProps = {
  onRegisterSuccess: () => void;
  onBackToLogin: () => void;
};

const Register = ({
  onRegisterSuccess,
  onBackToLogin,
}: RegisterProps) => {
  const [role, setRole] = useState<"bidder" | "officer">(
    "bidder"
  );

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    department: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // =========================================
  // INPUT CHANGE
  // =========================================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================================
  // ROLE CHANGE
  // =========================================

  const handleRoleChange = (
    selectedRole: "bidder" | "officer"
  ) => {
    setRole(selectedRole);

    // Clear role-specific field
    if (selectedRole === "bidder") {
      setFormData((prev) => ({
        ...prev,
        department: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        organization: "",
      }));
    }
  };

  // =========================================
  // SUBMIT
  // =========================================

  const handleSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      alert("Passwords do not match.");
      return;
    }

    if (
      role === "bidder" &&
      !formData.organization.trim()
    ) {
      alert("Please enter your organization name.");
      return;
    }

    if (
      role === "officer" &&
      !formData.department.trim()
    ) {
      alert("Please enter your department.");
      return;
    }

    // Temporary frontend registration
    onRegisterSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-950">

      <div className="grid min-h-screen lg:grid-cols-2">

        {/* =====================================
            LEFT SIDE
        ===================================== */}

        <div className="relative hidden overflow-hidden lg:flex">

          <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-900 to-slate-950" />

          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-2xl" />

          <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

            {/* Logo */}

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl font-black text-blue-700 shadow-xl">
                G
              </div>

              <div>
                <h1 className="text-xl font-bold text-white">
                  GeM Verify
                </h1>

                <p className="text-xs text-blue-200">
                  Bid Compliance Platform
                </p>
              </div>

            </div>

            {/* Main Content */}

            <div className="max-w-xl">

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-blue-100 backdrop-blur">

                <span className="h-2 w-2 rounded-full bg-emerald-400" />

                Join the Platform

              </div>

              <h2 className="text-5xl font-bold leading-tight text-white xl:text-6xl">

                Build Trust.

                <span className="block text-blue-300">
                  Bid Smarter.
                </span>

              </h2>

              <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
                Create your GeM Verify account and simplify
                document compliance, bid verification and
                procurement workflows.
              </p>

              {/* Features */}

              <div className="mt-10 space-y-4">

                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-xl text-white">
                    ✓
                  </div>

                  <div>

                    <p className="font-semibold text-white">
                      Secure Registration
                    </p>

                    <p className="text-xs text-slate-300">
                      Protected account and compliance data
                    </p>

                  </div>

                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-xl text-white">
                    ◈
                  </div>

                  <div>

                    <p className="font-semibold text-white">
                      AI-Assisted Verification
                    </p>

                    <p className="text-xs text-slate-300">
                      Faster document and compliance checks
                    </p>

                  </div>

                </div>

              </div>

            </div>

            <p className="text-xs text-slate-400">
              SIH26100 • GeM Compliance Platform
            </p>

          </div>

        </div>

        {/* =====================================
            RIGHT SIDE
        ===================================== */}

        <div className="flex items-center justify-center overflow-y-auto bg-slate-50 px-5 py-10 sm:px-8">

          <div className="w-full max-w-lg">

            {/* Mobile Logo */}

            <div className="mb-8 flex items-center gap-3 lg:hidden">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
                G
              </div>

              <div>

                <p className="font-bold text-slate-900">
                  GeM Verify
                </p>

                <p className="text-xs text-slate-500">
                  Bid Compliance Platform
                </p>

              </div>

            </div>

            {/* Heading */}

            <div className="mb-7">

              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Create Account
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Create Your Account
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Join GeM Verify and get started today.
              </p>

            </div>

            {/* Card */}

            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/50 sm:p-8">

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* =================================
                    ROLE
                ================================= */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Select Role
                  </label>

                  <div className="grid grid-cols-2 gap-3">

                    {/* Bidder */}

                    <button
                      type="button"
                      onClick={() =>
                        handleRoleChange("bidder")
                      }
                      className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                        role === "bidder"
                          ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      👤 Bidder
                    </button>

                    {/* Procurement Officer */}

                    <button
                      type="button"
                      onClick={() =>
                        handleRoleChange("officer")
                      }
                      className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                        role === "officer"
                          ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      💼 Procurement Officer
                    </button>

                  </div>

                </div>

                {/* =================================
                    FULL NAME + EMAIL
                ================================= */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  {/* Full Name */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />

                  </div>

                  {/* Email */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Email Address
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />

                  </div>

                </div>

                {/* =================================
                    BIDDER:
                    ORGANIZATION + PHONE
                ================================= */}

                {role === "bidder" && (

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    {/* Organization */}

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Organization Name
                      </label>

                      <input
                        type="text"
                        name="organization"
                        value={formData.organization}
                        onChange={handleChange}
                        placeholder="Enter organization name"
                        required
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                      />

                    </div>

                    {/* Phone */}

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Phone Number
                      </label>

                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 XXXXX XXXXX"
                        required
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                      />

                    </div>

                  </div>

                )}

                {/* =================================
                    OFFICER:
                    PHONE + DEPARTMENT
                ================================= */}

                {role === "officer" && (

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    {/* Phone */}

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Phone Number
                      </label>

                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 XXXXX XXXXX"
                        required
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                      />

                    </div>

                    {/* Department */}

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Department
                      </label>

                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="Enter your department"
                        required
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                      />

                    </div>

                  </div>

                )}

                {/* =================================
                    PASSWORD
                ================================= */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Password
                  </label>

                  <div className="relative">

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      required
                      minLength={6}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-20 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-blue-600"
                    >
                      {showPassword
                        ? "Hide"
                        : "Show"}
                    </button>

                  </div>

                  {/* Password requirements */}

                  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-400">

                    <span>
                      ○ At least 6 characters
                    </span>

                    <span>
                      ○ One lowercase letter
                    </span>

                    <span>
                      ○ One uppercase letter
                    </span>

                    <span>
                      ○ One number
                    </span>

                  </div>

                </div>

                {/* =================================
                    CONFIRM PASSWORD
                ================================= */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Confirm Password
                  </label>

                  <div className="relative">

                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      required
                      minLength={6}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-20 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-blue-600"
                    >
                      {showConfirmPassword
                        ? "Hide"
                        : "Show"}
                    </button>

                  </div>

                </div>

                {/* =================================
                    TERMS
                ================================= */}

                <div className="flex items-start gap-3">

                  <input
                    type="checkbox"
                    required
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />

                  <p className="text-xs leading-5 text-slate-500">

                    I agree to the{" "}

                    <span className="font-semibold text-blue-600">
                      Terms of Service
                    </span>{" "}

                    and{" "}

                    <span className="font-semibold text-blue-600">
                      Privacy Policy
                    </span>
                    .

                  </p>

                </div>

                {/* =================================
                    SUBMIT
                ================================= */}

                <button
                  type="submit"
                  className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-blue-600/30"
                >
                  {role === "officer"
                    ? "Create Officer Account →"
                    : "Create Account →"}
                </button>

              </form>

              {/* =================================
                  LOGIN
              ================================= */}

              <div className="my-6 flex items-center gap-3">

                <div className="h-px flex-1 bg-slate-200" />

                <span className="text-xs text-slate-400">
                  Already have an account?
                </span>

                <div className="h-px flex-1 bg-slate-200" />

              </div>

              <button
                type="button"
                onClick={onBackToLogin}
                className="w-full rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                ← Back to Sign in
              </button>

            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              Secure • Compliant • AI-Assisted
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Register;