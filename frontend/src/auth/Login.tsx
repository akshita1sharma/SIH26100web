import { useState } from "react";

type LoginProps = {
  onLogin: (role: "bidder" | "officer") => void;
  onRegister: () => void;
};

type StoredUser = {
  name: string;
  email: string;
  organization: string;
  phone: string;
  password: string;
  role: "bidder" | "officer";
};

const Login = ({
  onLogin,
  onRegister,
}: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [role, setRole] =
    useState<"bidder" | "officer">("bidder");

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(false);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleLogin = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");

    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    setLoading(true);

    setTimeout(() => {
      try {
        const storedUsers =
          JSON.parse(
            localStorage.getItem(
              "gem_verify_users"
            ) || "[]"
          ) as StoredUser[];

        // =========================================
        // NORMAL REGISTERED USER LOGIN
        // =========================================

        const user = storedUsers.find(
          (item) =>
            item.email.toLowerCase() ===
              cleanEmail &&
            item.password === password &&
            item.role === role
        );

        // =========================================
        // DEMO LOGIN FOR JUDGES
        // =========================================

        const demoBidder =
          cleanEmail ===
            "johndoe45@gmail.com" &&
          password === "123456" &&
          role === "bidder";

        const demoOfficer =
          cleanEmail ===
            "johndoe45@gmail.com" &&
          password === "654321" &&
          role === "officer";

        // =========================================
        // INVALID LOGIN
        // =========================================

        if (
          !user &&
          !demoBidder &&
          !demoOfficer
        ) {
          setError(
            "Invalid email, password, or selected role."
          );

          setLoading(false);
          return;
        }

        // =========================================
        // CREATE DEMO USER OBJECT
        // =========================================

        const loginUser: StoredUser =
          user || {
            name:
              role === "bidder"
                ? "John Doe"
                : "Procurement Officer",

            email: cleanEmail,

            organization:
              role === "bidder"
                ? "Demo Organization"
                : "",

            phone: "",

            password,

            role,
          };

        // =========================================
        // SAVE CURRENT USER
        // =========================================

        localStorage.setItem(
          "gem_verify_current_user",
          JSON.stringify(loginUser)
        );

        // =========================================
        // REMEMBER ME
        // =========================================

        if (rememberMe) {
          localStorage.setItem(
            "gem_verify_remember",
            "true"
          );
        } else {
          localStorage.removeItem(
            "gem_verify_remember"
          );
        }

        // =========================================
        // LOGIN
        // =========================================

        onLogin(loginUser.role);

      } catch (err) {
        console.error(
          "Login error:",
          err
        );

        setError(
          "Something went wrong. Please try again."
        );

        setLoading(false);
      }
    }, 400);
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      alert(
        "Please enter your email address first."
      );
      return;
    }

    alert(
      "Password reset functionality will be connected to backend authentication."
    );
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* ================================================= */}
        {/* LEFT SIDE */}
        {/* ================================================= */}

        <div className="relative hidden overflow-hidden lg:flex">

          <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-blue-900 to-slate-950" />

          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">

            {/* BRAND */}

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-xl font-black text-white shadow-xl shadow-blue-900/40">
                  G
                </div>

                <div>
                  <h1 className="text-xl font-bold text-white">
                    GeM Verify
                  </h1>

                  <p className="text-xs text-blue-200">
                    Government e-Marketplace
                    <br />
                    Compliance Platform
                  </p>
                </div>

              </div>

              <button
                onClick={onRegister}
                className="text-sm text-slate-300"
              >
                Don't have an account?{" "}
                <span className="font-semibold text-blue-300">
                  Register
                </span>
              </button>

            </div>

            {/* HERO */}

            <div className="max-w-xl">

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-medium text-blue-100 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Secure • Compliant • Transparent
              </div>

              <h2 className="text-5xl font-bold leading-tight text-white xl:text-6xl">
                Smarter

                <span className="block text-blue-300">
                  Procurement.
                </span>

                <span className="block">
                  Safer Governance.
                </span>
              </h2>

              <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
                AI-powered document verification
                and compliance monitoring for
                transparent government procurement.
              </p>

              {/* FEATURES */}

              <div className="mt-10 space-y-4">

                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/20 text-xl text-blue-300">
                    ▣
                  </div>

                  <div>
                    <p className="font-semibold text-white">
                      Document Verification
                    </p>

                    <p className="mt-1 text-xs text-slate-300">
                      AI-assisted compliance checks
                    </p>
                  </div>

                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/20 text-xl text-blue-300">
                    ◇
                  </div>

                  <div>
                    <p className="font-semibold text-white">
                      Risk Assessment
                    </p>

                    <p className="mt-1 text-xs text-slate-300">
                      Identify compliance risks quickly
                    </p>
                  </div>

                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/20 text-xl text-blue-300">
                    ◫
                  </div>

                  <div>
                    <p className="font-semibold text-white">
                      Transparent Process
                    </p>

                    <p className="mt-1 text-xs text-slate-300">
                      Build trust in public procurement
                    </p>
                  </div>

                </div>

              </div>

            </div>

            {/* FOOTER */}

            <p className="text-xs text-slate-400">
              SIH26100 • GeM Compliance Platform
            </p>

          </div>
        </div>

        {/* ================================================= */}
        {/* RIGHT SIDE */}
        {/* ================================================= */}

        <div className="flex items-center justify-center bg-slate-50 px-5 py-10 sm:px-8">

          <div className="w-full max-w-md">

            {/* MOBILE BRAND */}

            <div className="mb-8 flex items-center gap-3 lg:hidden">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
                G
              </div>

              <div>
                <p className="font-bold text-slate-900">
                  GeM Verify
                </p>

                <p className="text-xs text-slate-500">
                  Compliance Platform
                </p>
              </div>

            </div>

            {/* CARD */}

            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl shadow-slate-300/40 sm:p-9">

              {/* HEADING */}

              <div className="mb-7">

                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                  Secure Access
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  Welcome Back
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Sign in to your GeM Verify account
                </p>

              </div>

              {/* ERROR */}

              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
                  {error}
                </div>
              )}

              <form
                onSubmit={handleLogin}
                className="space-y-5"
              >

                {/* ROLE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Select Role
                  </label>

                  <div className="grid grid-cols-2 gap-3">

                    <button
                      type="button"
                      onClick={() =>
                        setRole("bidder")
                      }
                      className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                        role === "bidder"
                          ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      👤 Bidder
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setRole("officer")
                      }
                      className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                        role === "officer"
                          ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      💼 Officer
                    </button>

                  </div>
                </div>

                {/* EMAIL */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email Address
                  </label>

                  <div className="relative">

                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      ✉
                    </span>

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(
                          e.target.value
                        );
                        setError("");
                      }}
                      placeholder="Enter your email"
                      required
                      className="w-full rounded-xl border border-slate-300 bg-white px-11 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />

                  </div>

                  {/* TEST EMAIL */}

                  <p className="mt-1.5 text-[11px] text-slate-400">
                    (Use this for test:{" "}
                    <span className="text-sm font-bold text-slate-700">
                      johnDoe45@gmail.com
                    </span>
                    )
                  </p>

                </div>

                {/* PASSWORD */}

                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label className="text-sm font-semibold text-slate-700">
                      Password
                    </label>

                    <button
                      type="button"
                      onClick={
                        handleForgotPassword
                      }
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Forgot password?
                    </button>

                  </div>

                  <div className="relative">

                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      🔒
                    </span>

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(e) => {
                        setPassword(
                          e.target.value
                        );
                        setError("");
                      }}
                      placeholder="Enter your password"
                      required
                      className="w-full rounded-xl border border-slate-300 bg-white px-11 py-3.5 pr-20 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-blue-600"
                    >
                      {showPassword
                        ? "Hide"
                        : "Show"}
                    </button>

                  </div>

                  {/* TEST PASSWORD */}

                  <p className="mt-1.5 text-[15px] text-slate-400">
                    (Use this for test:{" "}
                    <span className="font-semibold text-slate-700">
                      {role === "bidder"
                        ? "123456"
                        : "654321"}
                    </span>
                    )
                  </p>

                </div>

                {/* REMEMBER */}

                <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-500">

                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />

                  Remember me

                </label>

                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Signing in..."
                    : "Sign In →"}
                </button>

              </form>

              {/* DIVIDER */}

              <div className="my-6 flex items-center gap-3">

                <div className="h-px flex-1 bg-slate-200" />

                <span className="text-xs text-slate-400">
                  or continue with
                </span>

                <div className="h-px flex-1 bg-slate-200" />

              </div>

              {/* SOCIAL */}

              <div className="grid grid-cols-2 gap-3">

                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "Google Sign-In will be connected later."
                    )
                  }
                  className="rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  🌐 Google
                </button>

                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "Government SSO will be connected later."
                    )
                  }
                  className="rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  🏛️ Government SSO
                </button>

              </div>

              {/* SECURITY */}

              <div className="mt-6 flex gap-3 rounded-xl bg-blue-50 p-4">

                <div className="text-lg">
                  🛡️
                </div>

                <div>

                  <p className="text-xs font-bold text-blue-700">
                    Secure Access
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-blue-600">
                    Your account information is protected
                    by secure authentication.
                  </p>

                </div>

              </div>

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

export default Login;