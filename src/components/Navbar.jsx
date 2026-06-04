import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Camera, Images, LayoutDashboard, LogIn, Menu, UserCog, X } from "lucide-react";

export default function Navbar({ session }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const adminTarget = session ? "/admin" : "/login";
  const adminLabel = session ? "Dashboard Admin" : "Login";
  const AdminIcon = session ? LayoutDashboard : LogIn;

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-blue-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3 text-sapphire-800" onClick={closeMobileMenu}>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-sapphire-700 text-white shadow-soft">
            <Camera size={21} strokeWidth={2.4} />
          </span>
          <span className="truncate text-base font-bold tracking-normal sm:text-lg">Galeri SDN Wanasari 15</span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
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
          <NavLink
            to={adminTarget}
            className={({ isActive }) =>
              `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
                isActive ? "bg-sapphire-700 text-white" : "bg-slate-900 text-white hover:bg-sapphire-800"
              }`
            }
          >
            <AdminIcon size={16} />
            {adminLabel}
          </NavLink>
          {session ? (
            <NavLink
              to="/admin/accounts"
              className={({ isActive }) =>
                `grid h-10 w-10 place-items-center rounded-md text-sm font-semibold transition ${
                  isActive ? "bg-sapphire-700 text-white" : "border border-blue-100 bg-white text-sapphire-700 hover:bg-blue-50"
                }`
              }
              aria-label="Pengaturan akun admin"
              title="Pengaturan akun admin"
            >
              <UserCog size={18} />
            </NavLink>
          ) : null}
        </nav>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-blue-100 bg-white text-sapphire-800 transition hover:bg-blue-50 md:hidden"
          aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileMenuOpen ? (
        <nav className="border-t border-blue-100 bg-white px-4 py-3 shadow-sm md:hidden">
          <div className="mx-auto grid max-w-7xl gap-2">
            <NavLink
              to="/"
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `inline-flex h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold transition ${
                  isActive ? "bg-blue-50 text-sapphire-700" : "text-slate-700 hover:bg-slate-100"
                }`
              }
            >
              <Images size={17} />
              Galeri
            </NavLink>
            <NavLink
              to={adminTarget}
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `inline-flex h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold transition ${
                  isActive ? "bg-sapphire-700 text-white" : "bg-slate-900 text-white hover:bg-sapphire-800"
                }`
              }
            >
              <AdminIcon size={17} />
              {adminLabel}
            </NavLink>
            {session ? (
              <NavLink
                to="/admin/accounts"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `inline-flex h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold transition ${
                    isActive ? "bg-blue-50 text-sapphire-700" : "text-slate-700 hover:bg-slate-100"
                  }`
                }
              >
                <UserCog size={17} />
                Pengaturan Akun
              </NavLink>
            ) : null}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
