import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth.jsx";

const linkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${isActive ? "bg-white/60 text-slate-900" : "text-slate-800 hover:bg-white/40"}`;

export function Header() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [svcOpen, setSvcOpen] = useState(false);

  return (
    <header className="border-b border-sky-200 bg-brand-header">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-600 text-sm text-white">
            LF
          </span>
          <span className="hidden sm:inline">LogiFlow</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/about" className={linkClass}>
            About
          </NavLink>
          <div
            className="relative"
            onMouseEnter={() => setSvcOpen(true)}
            onMouseLeave={() => setSvcOpen(false)}
          >
            <button
              type="button"
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-800 hover:bg-white/40"
              aria-expanded={svcOpen}
            >
              Services ▾
            </button>
            {svcOpen ? (
              <div className="absolute left-0 top-full z-20 min-w-[200px] rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                <Link
                  to="/services#freight"
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Freight
                </Link>
                <Link
                  to="/services#lastmile"
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Last-mile
                </Link>
                <Link
                  to="/services#warehousing"
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Warehousing
                </Link>
              </div>
            ) : null}
          </div>
          <NavLink to="/track" className={linkClass}>
            Track
          </NavLink>
          <NavLink to="/contact" className={linkClass}>
            Contact
          </NavLink>
        </nav>

        <div className="hidden items-center gap-3 text-sm md:flex">
          <a className="text-slate-800 hover:underline" href="mailto:support@logiflow.example">
            support@logiflow.example
          </a>
          {user ? (
            <>
              {user.role === "ADMIN" ? (
                <Link to="/admin" className="rounded-md bg-sky-700 px-3 py-2 font-medium text-white hover:bg-sky-800">
                  Admin
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  className="rounded-md bg-sky-700 px-3 py-2 font-medium text-white hover:bg-sky-800"
                >
                  Dashboard
                </Link>
              )}
              <button
                type="button"
                onClick={logout}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 font-medium text-slate-800 hover:bg-slate-50"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-md px-3 py-2 font-medium text-slate-800 hover:bg-white/40">
                Client login
              </Link>
              <Link
                to="/signup"
                className="rounded-md bg-sky-700 px-3 py-2 font-medium text-white hover:bg-sky-800"
              >
                Sign up
              </Link>
              <Link
                to="/admin-login"
                className="rounded-md border border-slate-300 bg-white px-3 py-2 font-medium text-slate-800 hover:bg-slate-50"
              >
                Admin
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex rounded-md border border-slate-300 bg-white p-2 text-slate-800 md:hidden"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>
      </div>

      {open ? (
        <div className="border-t border-sky-200 bg-brand-header px-4 pb-4 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 pt-2">
            <NavLink onClick={() => setOpen(false)} to="/" end className={linkClass}>
              Home
            </NavLink>
            <NavLink onClick={() => setOpen(false)} to="/about" className={linkClass}>
              About
            </NavLink>
            <NavLink onClick={() => setOpen(false)} to="/services" className={linkClass}>
              Services
            </NavLink>
            <NavLink onClick={() => setOpen(false)} to="/track" className={linkClass}>
              Track
            </NavLink>
            <NavLink onClick={() => setOpen(false)} to="/contact" className={linkClass}>
              Contact
            </NavLink>
            <a className="px-3 py-2 text-sm text-slate-800" href="mailto:support@logiflow.example">
              support@logiflow.example
            </a>
            {user ? (
              <>
                <Link
                  onClick={() => setOpen(false)}
                  to={user.role === "ADMIN" ? "/admin" : "/dashboard"}
                  className="rounded-md bg-sky-700 px-3 py-2 text-center font-medium text-white"
                >
                  {user.role === "ADMIN" ? "Admin" : "Dashboard"}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 font-medium"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link onClick={() => setOpen(false)} to="/login" className="rounded-md px-3 py-2 font-medium">
                  Client login
                </Link>
                <Link onClick={() => setOpen(false)} to="/signup" className="rounded-md bg-sky-700 px-3 py-2 text-center text-white">
                  Sign up
                </Link>
                <Link onClick={() => setOpen(false)} to="/admin-login" className="rounded-md border bg-white px-3 py-2 text-center">
                  Admin login
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
