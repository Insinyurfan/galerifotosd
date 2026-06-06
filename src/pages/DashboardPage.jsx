import { useEffect, useState } from "react";
import {
  ArrowRight,
  Camera,
  Clapperboard,
  Globe2,
  Instagram,
  Pencil,
  PlayCircle,
  Save,
  Sparkles,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useSiteSettings } from "../hooks/useSiteSettings.js";
import { useSession } from "../hooks/useSession.js";

export default function DashboardPage() {
  const session = useSession();
  const { settings, errorMessage: settingsError, saveSettings } = useSiteSettings();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(settings);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await saveSettings({
        site_title: form.site_title.trim(),
        dashboard_badge: form.dashboard_badge.trim(),
        dashboard_title: form.dashboard_title.trim(),
        dashboard_description: form.dashboard_description.trim(),
        school_name: form.school_name.trim(),
        school_website_url: form.school_website_url.trim(),
        school_instagram_url: form.school_instagram_url.trim(),
        school_tiktok_url: form.school_tiktok_url.trim(),
      });
      setMessage("Konten Dashboard berhasil disimpan.");
      setEditing(false);
    } catch (error) {
      setMessage(error.message || "Gagal menyimpan pengaturan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app-shell-page">
      <Navbar session={session} />
      <main className="page-content">
        {session ? (
          <div className="page-admin-toolbar">
            <div>
              <strong>Mode Admin</strong>
              <span>Edit judul, teks sambutan, dan akun sosial langsung dari halaman ini.</span>
            </div>
            <button type="button" className="admin-edit-button" onClick={() => setEditing((current) => !current)}>
              {editing ? <X size={17} /> : <Pencil size={17} />}
              {editing ? "Tutup Editor" : "Edit Konten"}
            </button>
          </div>
        ) : null}

        {editing ? (
          <form className="inline-editor" onSubmit={handleSave}>
            <div className="inline-editor-heading">
              <div>
                <p className="card-kicker">Pengaturan Dashboard</p>
                <h2>Edit konten halaman utama</h2>
              </div>
            </div>
            <div className="inline-editor-grid">
              <label className="full">
                <span>Judul Header Website</span>
                <input name="site_title" value={form.site_title} onChange={handleChange} required />
              </label>
              <label>
                <span>Label Sambutan</span>
                <input name="dashboard_badge" value={form.dashboard_badge} onChange={handleChange} required />
              </label>
              <label>
                <span>Nama Sekolah di Sosial Media</span>
                <input name="school_name" value={form.school_name} onChange={handleChange} required />
              </label>
              <label className="full">
                <span>Judul Sambutan</span>
                <input name="dashboard_title" value={form.dashboard_title} onChange={handleChange} required />
              </label>
              <label className="full">
                <span>Teks Sambutan</span>
                <textarea
                  name="dashboard_description"
                  value={form.dashboard_description}
                  onChange={handleChange}
                  rows="4"
                  required
                />
              </label>
              <label>
                <span>Link Website Sekolah</span>
                <input name="school_website_url" type="url" value={form.school_website_url} onChange={handleChange} />
              </label>
              <label>
                <span>Link Instagram Sekolah</span>
                <input
                  name="school_instagram_url"
                  type="url"
                  value={form.school_instagram_url}
                  onChange={handleChange}
                />
              </label>
              <label>
                <span>Link TikTok Sekolah</span>
                <input name="school_tiktok_url" type="url" value={form.school_tiktok_url} onChange={handleChange} />
              </label>
            </div>
            {message ? <div className="editor-message">{message}</div> : null}
            {settingsError ? (
              <div className="alert-error">Supabase belum siap: {settingsError}. Jalankan setup-content-settings.sql.</div>
            ) : null}
            <button type="submit" className="primary-action" disabled={saving}>
              <Save size={18} />
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </form>
        ) : null}

        <section className="welcome-hero">
          <div className="welcome-copy">
            <span className="eyebrow">
              <Sparkles size={17} />
              {settings.dashboard_badge}
            </span>
            <h1>{settings.dashboard_title}</h1>
            <p>{settings.dashboard_description}</p>
            <div className="hero-actions">
              <Link to="/foto" className="primary-action">
                Lihat Galeri Foto
                <ArrowRight size={18} />
              </Link>
              <Link to="/video" className="secondary-action">
                Putar Video
                <PlayCircle size={18} />
              </Link>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="hero-orbit hero-orbit-one" />
            <div className="hero-orbit hero-orbit-two" />
            <div className="hero-camera">
              <Camera size={62} strokeWidth={1.6} />
            </div>
            <span className="hero-year">2026</span>
          </div>
        </section>

        <section className="dashboard-grid">
          <article className="dashboard-card dashboard-card-wide">
            <span className="card-icon blue">
              <Camera size={24} />
            </span>
            <div>
              <p className="card-kicker">Dokumentasi Lengkap</p>
              <h2>Satu tempat untuk seluruh momen istimewa</h2>
              <p>Jelajahi hasil dokumentasi dari Kamera, iPhone, dan Drone dengan tampilan yang rapi dan mudah digunakan.</p>
            </div>
          </article>

          <article className="dashboard-card">
            <span className="card-icon website">
              <Globe2 size={24} />
            </span>
            <div>
              <p className="card-kicker">Website Sekolah</p>
              <h2>{settings.school_name}</h2>
              <p>Kunjungi website resmi sekolah untuk melihat profil dan informasi SDN Wanasari 15.</p>
              <a href={settings.school_website_url || "#"} target="_blank" rel="noreferrer">
                Buka Website <ArrowRight size={16} />
              </a>
            </div>
          </article>

          <article className="dashboard-card">
            <span className="card-icon pink">
              <Instagram size={24} />
            </span>
            <div>
              <p className="card-kicker">Instagram</p>
              <h2>{settings.school_name}</h2>
              <a href={settings.school_instagram_url || "#"} target="_blank" rel="noreferrer">
                Kunjungi Instagram <ArrowRight size={16} />
              </a>
            </div>
          </article>

          <article className="dashboard-card">
            <span className="card-icon dark">
              <Clapperboard size={24} />
            </span>
            <div>
              <p className="card-kicker">TikTok</p>
              <h2>{settings.school_name}</h2>
              <a href={settings.school_tiktok_url || "#"} target="_blank" rel="noreferrer">
                Kunjungi TikTok <ArrowRight size={16} />
              </a>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
