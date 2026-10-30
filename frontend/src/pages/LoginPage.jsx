import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useState } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
} from "lucide-react";


const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000")
.replace(/\/$/, "");

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  setError("");
  setLoading(true);

  try {
    const authenticatedUser = await login(form);

    if (authenticatedUser.role === "ADMIN") {
      navigate("/admin/dashboard", { replace: true });
    } else {
      navigate("/employee/dashboard", { replace: true });
    }
  } catch (err) {
    setError(err.message || "Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070711] text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-violet-600/20 blur-[130px]" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-cyan-500/15 blur-[130px]" />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)",
            backgroundSize: "55px 55px",
          }}
        />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-12">
        <a href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400">
            <Sparkles size={21} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-[0.15em]">
            WORKFORCE<span className="text-violet-400">.</span>
          </span>
        </a>

        <a
          href="/"
          className="flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to home
        </a>
      </nav>

      {/* Login Section */}
      <section className="relative z-10 flex min-h-[calc(100vh-100px)] items-center justify-center px-5 py-10">
        <div className="grid w-full max-w-6xl items-center gap-16 lg:grid-cols-2">
          {/* Left Content */}
          <div className="hidden lg:block">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm text-violet-300">
              <Sparkles size={15} />
              Intelligent Workforce Management
            </div>

            <h1 className="max-w-xl text-5xl font-bold leading-[1.15] xl:text-6xl">
              Manage your team.
              <span className="mt-2 block bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                Amplify productivity.
              </span>
            </h1>

            <p className="mt-7 max-w-lg text-lg leading-8 text-gray-400">
              A smarter way to manage employees, allocate tasks and optimize
              your team's workload with intelligent insights.
            </p>

            <div className="mt-12 flex items-center gap-5">
              <div className="h-12 w-1 rounded-full bg-gradient-to-b from-violet-500 to-cyan-400" />
              <div>
                <p className="font-semibold text-white">
                  One workspace. Complete control.
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Built for teams that want to do more.
                </p>
              </div>
            </div>
          </div>

          {/* Login Card */}
          <div className="mx-auto w-full max-w-md">
            <div className="rounded-3xl border border-white/10 bg-[#11111e]/80 p-7 shadow-[0_0_80px_rgba(124,58,237,0.12)] backdrop-blur-2xl sm:p-10">
              <div className="mb-8">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
                  <LockKeyhole size={23} />
                </div>

                <p className="mb-2 text-sm font-medium tracking-widest text-violet-400">
                  WELCOME BACK
                </p>

                <h2 className="text-3xl font-bold">Sign in</h2>

                <p className="mt-3 text-sm leading-6 text-gray-400">
                  Enter your credentials to access your workspace.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-gray-300"
                  >
                    Email address
                  </label>

                  <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 transition focus-within:border-violet-500/70 focus-within:ring-2 focus-within:ring-violet-500/10">
                    <Mail size={18} className="shrink-0 text-gray-500" />

                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@company.com"
                      autoComplete="email"
                      required
                      className="w-full bg-transparent px-3 py-4 text-sm text-white outline-none placeholder:text-gray-600"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-gray-300"
                  >
                    Password
                  </label>

                  <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 transition focus-within:border-violet-500/70 focus-within:ring-2 focus-within:ring-violet-500/10">
                    <LockKeyhole
                      size={18}
                      className="shrink-0 text-gray-500"
                    />

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      className="w-full bg-transparent px-3 py-4 text-sm text-white outline-none placeholder:text-gray-600"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-500 transition hover:text-white"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative mt-3 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 py-4 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:shadow-violet-700/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="absolute inset-0 translate-y-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-transform duration-500 group-hover:translate-y-0" />

                  <span className="relative">
                    {loading ? "Signing in..." : "Sign in to workspace"}
                  </span>
                </button>
              </form>

              <div className="mt-8 border-t border-white/10 pt-6 text-center">
                <p className="text-xs leading-6 text-gray-500">
                  Access is provided by your organization.
                  <br />
                  Contact your administrator if you need an account.
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-gray-600">
              © {new Date().getFullYear()} Workforce. All rights reserved.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
