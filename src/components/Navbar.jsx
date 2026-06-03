import { Link, NavLink } from "react-router-dom";
import { Camera, Images, LayoutDashboard, LogIn } from "lucide-react";

export default function Navbar({ session }) {
  return (
    <header className="sticky top-0 z-30 border-b border-blue-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3 text-sapphire-800">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-sapphire-700 text-white shadow-soft">
            <Camera size={21} strokeWidth={2.4} />
          </span>
          <span className="truncate text-lg font-bold tracking-normal">Galeri SDN Wanasari 15</span>
        </Link>

        <nav className="flex items-center gap-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-semibold transition ${
                isActive ? "bg-blue-50 text-sapphire-700" : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            <span className="inline-flex items-center gap-2">
              <Images size={16} />
              Galeri
            </span>
          </NavLink>
          {session ? (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
                  isActive ? "bg-sapphire-700 text-white" : "bg-slate-900 text-white hover:bg-sapphire-800"
                }`
              }
            >
              <LayoutDashboard size={16} />
              Dashboard Admin
            </NavLink>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
                  isActive ? "bg-sapphire-700 text-white" : "bg-slate-900 text-white hover:bg-sapphire-800"
                }`
              }
            >
              <LogIn size={16} />
              Login
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
