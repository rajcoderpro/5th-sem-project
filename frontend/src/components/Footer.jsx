
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.07]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <Link to="/" className="font-display text-sm font-semibold text-slate-300">
          WorkForce<span className="text-violet-400"> AI</span>
        </Link>

        <p>Smarter teams. Higher impact.</p>

        <div className="flex gap-5">
          <a href="#features" className="transition hover:text-white">
            Features
          </a>

          <a href="#how-it-works" className="transition hover:text-white">
            How it works
          </a>

          <Link to="/login" className="transition hover:text-white">
            Sign in
          </Link>
        </div>

        <p>© {new Date().getFullYear()} WorkForce AI</p>
      </div>
    </footer>
  );
}
