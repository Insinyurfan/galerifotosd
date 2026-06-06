import { useEffect, useState } from "react";
import {
  CircleUserRound,
  Clapperboard,
  Home,
  Image,
  Info,
  ImageUp,
  LayoutDashboard,
  LoaderCircle,
  LogIn,
  LogOut,
  Menu,
  PlaySquare,
  Settings,
  ShieldCheck,
  UserRound,
  X,
  Youtube,
} from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import ImageCropModal from "./ImageCropModal.jsx";
import { useSiteSettings } from "../hooks/useSiteSettings.js";
import { supabase } from "../lib/supabase.js";

const PUBLIC_LINKS = [
  { to: "/", label: "Dashboard", icon: Home, end: true },
  { to: "/foto", label: "Foto", icon: Image },
  { to: "/video", label: "Video", icon: PlaySquare },
  { to: "/youtube", label: "YouTube", icon: Youtube },
  { to: "/tiktok", label: "TikTok", icon: Clapperboard },
];

export default function Navbar({ session }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings, uploadImage } = useSiteSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoPreviewOpen, setLogoPreviewOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [pendingLogo, setPendingLogo] = useState(null);
  const [logoMessage, setLogoMessage] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    setLogoFailed(false);
  }, [settings.logo_url]);

  useEffect(() => {
    let active = true;

    async function fetchUsername() {
      if (!session?.user?.id) {
        setUsername("");
        return;
      }

      const { data } = await supabase
        .from("admin_profiles")
        .select("username")
        .eq("id", session.user.id)
        .maybeSingle();

      if (active) {
        setUsername(data?.username || session.user.email?.split("@")[0] || "Admin");
      }
    }

    fetchUsername();
    return () => {
      active = false;
    };
  }, [session]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setMobileMenuOpen(false);
    navigate("/", { replace: true });
  }

  async function handleLogoChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setLogoMessage("File harus berupa gambar.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setLogoMessage("Ukuran gambar maksimal 5 MB.");
      return;
    }

    setPendingLogo(file);
  }

  async function handleCroppedLogo(file) {
    setLogoUploading(true);
    setLogoMessage("");
    try {
      await uploadImage(file, "school-logo", "logo_url");
      setLogoMessage("Logo berhasil diperbarui.");
      setPendingLogo(null);
    } catch (error) {
      setLogoMessage(error.message || "Gagal mengunggah logo.");
    } finally {
      setLogoUploading(false);
    }
  }

  function renderLogo(className) {
    if (logoFailed) {
      return <span className={`${className} grid place-items-center bg-blue-700 font-black text-white`}>W15</span>;
    }

    return (
      <img
        src={settings.logo_url || "/logo-wanasari.png"}
        alt="Logo SDN Wanasari 15"
        className={`${className} object-contain`}
        onError={() => setLogoFailed(true)}
      />
    );
  }

  const sidebarContent = (
    <>
      <div className="sidebar-top">
        {session ? (
          <div className="sidebar-admin-greeting">
            <CircleUserRound size={21} />
            <span>Selamat datang, {username}</span>
          </div>
        ) : null}
      </div>

      <nav className="sidebar-nav" aria-label="Navigasi utama">
        {PUBLIC_LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <Icon size={21} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <NavLink to="/tentang" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
          <Info size={21} />
          <span>Tentang Saya</span>
        </NavLink>
        {session ? (
          <>
            <NavLink to="/admin" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
              <LayoutDashboard size={21} />
              <span>Dashboard Admin</span>
            </NavLink>
            <NavLink to="/admin/tiktok" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
              <Clapperboard size={21} />
              <span>Kelola TikTok</span>
            </NavLink>
            <NavLink to="/admin/accounts" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
              <Settings size={21} />
              <span>Pengaturan Akun</span>
            </NavLink>
            <button type="button" className="sidebar-link sidebar-logout" onClick={handleLogout}>
              <LogOut size={21} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <NavLink to="/login" className={({ isActive }) => `sidebar-link sidebar-login ${isActive ? "active" : ""}`}>
            <LogIn size={21} />
            <span>Login</span>
          </NavLink>
        )}
      </div>
    </>
  );

  return (
    <>
      <header className="site-header">
        <button
          type="button"
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className="site-brand">
          <button
            type="button"
            className="site-logo-button"
            onClick={() => setLogoPreviewOpen(true)}
            aria-label="Perbesar logo SDN Wanasari 15"
          >
            {renderLogo("site-logo")}
          </button>
          <Link to="/">{settings.site_title}</Link>
        </div>

        <div className="site-header-status">
          {session ? <ShieldCheck size={18} /> : <UserRound size={18} />}
          <span>{session ? username || "Admin" : "Galeri Publik"}</span>
        </div>
      </header>

      <aside className="desktop-sidebar">{sidebarContent}</aside>

      {mobileMenuOpen ? (
        <div className="mobile-sidebar-layer" onClick={() => setMobileMenuOpen(false)}>
          <aside className="mobile-sidebar" onClick={(event) => event.stopPropagation()}>
            <div className="mobile-sidebar-heading">
              <span>Menu Utama</span>
              <button type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Tutup menu">
                <X size={20} />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      ) : null}

      {logoPreviewOpen ? (
        <div className="logo-preview" role="dialog" aria-modal="true" onClick={() => setLogoPreviewOpen(false)}>
          <button type="button" className="logo-preview-close" onClick={() => setLogoPreviewOpen(false)} aria-label="Tutup">
            <X size={22} />
          </button>
          <div className="logo-preview-card" onClick={(event) => event.stopPropagation()}>
            {renderLogo("logo-preview-image")}
            <p>Logo SDN Wanasari 15</p>
            {session ? (
              <label className={`image-upload-action ${logoUploading ? "disabled" : ""}`}>
                {logoUploading ? <LoaderCircle className="spin" size={18} /> : <ImageUp size={18} />}
                {logoUploading ? "Mengunggah..." : "Ganti Logo"}
                <input type="file" accept="image/*" onChange={handleLogoChange} disabled={logoUploading} />
              </label>
            ) : null}
            {logoMessage ? <span className="upload-message">{logoMessage}</span> : null}
          </div>
        </div>
      ) : null}

      {pendingLogo ? (
        <ImageCropModal
          file={pendingLogo}
          aspectRatio={1}
          title="Atur Logo Sekolah"
          outputName="logo-wanasari.jpg"
          onCancel={() => setPendingLogo(null)}
          onConfirm={handleCroppedLogo}
        />
      ) : null}
    </>
  );
}
