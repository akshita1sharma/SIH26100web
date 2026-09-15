import { useState } from "react";

type LoginProps = {
  onLogin: (role: "bidder" | "officer") => void;
  onRegister: () => void;
};

const Login = ({ onLogin, onRegister }: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"bidder" | "officer">("bidder");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(role);
  };

  return (
    <div className="min-h-screen bg-slate-950">

      <div className="grid min-h-screen lg:grid-cols-2">

        {/* LEFT SIDE */}
        <div className="relative hidden overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-900 to-slate-950" />

          {/* Decorative circles */}
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-2xl" />
          <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

            {/* Brand */}
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

            {/* Hero */}
            <div className="max-w-xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-blue-100 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                AI-Powered Compliance
              </div>

              <h2 className="text-5xl font-bold leading-tight text-white xl:text-6xl">
                Smarter
                <span className="block text-blue-300">
                  Bid Verification.
                </span>
              </h2>

              <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
                Verify documents, evaluate compliance and manage
                GeM procurement workflows from one secure platform.
              </p>

              {/* Feature cards */}
              <div className="mt-10 grid grid-cols-2 gap-4">

                <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                  <div className="mb-3 text-2xl">✓</div>
                  <p className="font-semibold text-white">
                    Document Verification
                  </p>
                  <p className="mt-1 text-xs text-slate-300">
                    AI-assisted compliance checks
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                  <div className="mb-3 text-2xl">◈</div>
                  <p className="font-semibold text-white">
                    Risk Assessment
                  </p>
                  <p className="mt-1 text-xs text-slate-300">
                    Identify compliance risks quickly
                  </p>
                </div>

              </div>
            </div>

            {/* Footer */}
            <p className="text-xs text-slate-400">
              SIH26100 • GeM Compliance Platform
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center justify-center bg-slate-50 px-5 py-10 sm:px-8">

          <div className="w-full max-w-md">

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
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Secure Access
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Welcome back
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Sign in to continue to your compliance portal.
              </p>
            </div>

            {/* Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/50 sm:p-8">

              <form onSubmit={handleLogin} className="space-y-5">

                {/* Role */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Login as
                  </label>

                  <div className="grid grid-cols-2 gap-3">

                    <button
                      type="button"
                      onClick={() => setRole("bidder")}
                      className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                        role === "bidder"
                          ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-100"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      🏢 Bidder
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole("officer")}
                      className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                        role === "officer"
                          ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-100"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      🛡️ Officer
                    </button>

                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email address
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-700">
                      Password
                    </label>

                    <button
                      type="button"
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-20 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-blue-600"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-blue-600/30"
                >
                  Sign in →
                </button>

              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs text-slate-400">
                  New to GeM Verify?
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* Register */}
              <button
                type="button"
                onClick={onRegister}
                className="w-full rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                Create an account
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

export default Login;