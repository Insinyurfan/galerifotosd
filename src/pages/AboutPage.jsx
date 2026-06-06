import { useEffect, useState } from "react";
import {
  Facebook,
  GraduationCap,
  ImageUp,
  Instagram,
  Laptop,
  LoaderCircle,
  Pencil,
  Quote,
  Save,
  UserRound,
  X,
} from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import { useSiteSettings } from "../hooks/useSiteSettings.js";
import { useSession } from "../hooks/useSession.js";

export default function AboutPage() {
  const session = useSession();
  const { settings, errorMessage: settingsError, saveSettings, uploadImage } = useSiteSettings();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(settings);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const socialLinks = [
    { label: "Instagram", href: settings.developer_instagram_url, icon: Instagram },
    { label: "TikTok", href: settings.developer_tiktok_url, icon: UserRound },
    { label: "Facebook", href: settings.developer_facebook_url, icon: Facebook },
  ];

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setPhotoUploading(true);
    setMessage("");
    try {
      await uploadImage(file, "developer-profile", "developer_photo_url");
      setMessage("Foto profil berhasil diperbarui.");
    } catch (error) {
      setMessage(error.message || "Gagal mengunggah foto.");
    } finally {
      setPhotoUploading(false);
    }
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await saveSettings({
        developer_name: form.developer_name.trim(),
        developer_role: form.developer_role.trim(),
        developer_intro: form.developer_intro.trim(),
        developer_university: form.developer_university.trim(),
        developer_instagram_url: form.developer_instagram_url.trim(),
        developer_tiktok_url: form.developer_tiktok_url.trim(),
        developer_facebook_url: form.developer_facebook_url.trim(),
      });
      setMessage("Profil developer berhasil disimpan.");
      setEditing(false);
    } catch (error) {
      setMessage(error.message || "Gagal menyimpan profil.");
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
              <span>Edit foto, biodata, dan link sosial langsung dari halaman Tentang Saya.</span>
            </div>
            <button type="button" className="admin-edit-button" onClick={() => setEditing((current) => !current)}>
              {editing ? <X size={17} /> : <Pencil size={17} />}
              {editing ? "Tutup Editor" : "Edit Profil"}
            </button>
          </div>
        ) : null}

        <section className="page-heading">
          <span className="eyebrow">Tentang Developer</span>
          <h1>Orang di balik website ini</h1>
          <p>Sebuah perkenalan singkat dari pengembang ruang kenangan digital SDN Wanasari 15.</p>
        </section>

        {editing ? (
          <form className="inline-editor" onSubmit={handleSave}>
            <div className="inline-editor-heading">
              <div>
                <p className="card-kicker">Profil Developer</p>
                <h2>Edit informasi Tentang Saya</h2>
              </div>
              <label className={`image-upload-action ${photoUploading ? "disabled" : ""}`}>
                {photoUploading ? <LoaderCircle className="spin" size={18} /> : <ImageUp size={18} />}
                {photoUploading ? "Mengunggah..." : "Ganti Foto Profil"}
                <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={photoUploading} />
              </label>
            </div>
            <div className="inline-editor-grid">
              <label>
                <span>Nama</span>
                <input name="developer_name" value={form.developer_name} onChange={handleChange} required />
              </label>
              <label>
                <span>Peran</span>
                <input name="developer_role" value={form.developer_role} onChange={handleChange} required />
              </label>
              <label className="full">
                <span>Perkenalan</span>
                <textarea name="developer_intro" value={form.developer_intro} onChange={handleChange} rows="5" required />
              </label>
              <label className="full">
                <span>Universitas</span>
                <input name="developer_university" value={form.developer_university} onChange={handleChange} required />
              </label>
              <label>
                <span>Link Instagram</span>
                <input
                  type="url"
                  name="developer_instagram_url"
                  value={form.developer_instagram_url}
                  onChange={handleChange}
                />
              </label>
              <label>
                <span>Link TikTok</span>
                <input
                  type="url"
                  name="developer_tiktok_url"
                  value={form.developer_tiktok_url}
                  onChange={handleChange}
                />
              </label>
              <label className="full">
                <span>Link Facebook</span>
                <input
                  type="url"
                  name="developer_facebook_url"
                  value={form.developer_facebook_url}
                  onChange={handleChange}
                />
              </label>
            </div>
            {message ? <div className="editor-message">{message}</div> : null}
            {settingsError ? (
              <div className="alert-error">Supabase belum siap: {settingsError}. Jalankan setup-content-settings.sql.</div>
            ) : null}
            <button type="submit" className="primary-action" disabled={saving}>
              <Save size={18} />
              {saving ? "Menyimpan..." : "Simpan Profil"}
            </button>
          </form>
        ) : null}

        <section className="developer-card">
          <div className="developer-photo-wrap">
            {settings.developer_photo_url ? (
              <img
                src={settings.developer_photo_url}
                alt={`Foto profil ${settings.developer_name}`}
                className="developer-photo"
              />
            ) : (
              <div className="developer-photo developer-photo-fallback">
                {settings.developer_name?.charAt(0).toUpperCase() || "I"}
              </div>
            )}
            <span className="developer-status">{settings.developer_role}</span>
          </div>

          <div className="developer-content">
            <Quote className="developer-quote" size={42} />
            <p className="card-kicker">Halo, saya</p>
            <h1>{settings.developer_name}</h1>
            <p className="developer-intro">{settings.developer_intro}</p>

            <div className="developer-details">
              <div>
                <Laptop size={22} />
                <span>
                  <strong>{settings.developer_role}</strong>
                  Merancang dan membangun website ini.
                </span>
              </div>
              <div>
                <GraduationCap size={22} />
                <span>
                  <strong>Mahasiswa</strong>
                  {settings.developer_university}
                </span>
              </div>
            </div>

            <div className="developer-socials">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a key={label} href={href || "#"} target="_blank" rel="noreferrer">
                  <Icon size={19} />
                  {label}
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
