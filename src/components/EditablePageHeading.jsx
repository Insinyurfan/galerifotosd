import { useEffect, useState } from "react";
import { Pencil, Save, X } from "lucide-react";
import { useSiteSettings } from "../hooks/useSiteSettings.js";

export default function EditablePageHeading({
  session,
  fieldPrefix,
  icon: Icon,
  eyebrowClassName = "",
  sectionClassName = "",
}) {
  const { settings, saveSettings } = useSiteSettings();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    badge: settings[`${fieldPrefix}_badge`],
    title: settings[`${fieldPrefix}_title`],
    description: settings[`${fieldPrefix}_description`],
  });

  useEffect(() => {
    setForm({
      badge: settings[`${fieldPrefix}_badge`],
      title: settings[`${fieldPrefix}_title`],
      description: settings[`${fieldPrefix}_description`],
    });
  }, [fieldPrefix, settings]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await saveSettings({
        [`${fieldPrefix}_badge`]: form.badge.trim(),
        [`${fieldPrefix}_title`]: form.title.trim(),
        [`${fieldPrefix}_description`]: form.description.trim(),
      });
      setMessage("Judul halaman berhasil diperbarui.");
      setEditing(false);
    } catch (error) {
      setMessage(error.message || "Gagal menyimpan judul halaman.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {session ? (
        <div className="page-admin-toolbar compact-toolbar">
          <div>
            <strong>Konten Halaman</strong>
            <span>Badge, judul, dan deskripsi halaman ini dapat diubah.</span>
          </div>
          <button type="button" className="admin-edit-button" onClick={() => setEditing((current) => !current)}>
            {editing ? <X size={17} /> : <Pencil size={17} />}
            {editing ? "Tutup Editor" : "Edit Judul"}
          </button>
        </div>
      ) : null}

      {editing ? (
        <form className="inline-editor page-heading-editor" onSubmit={handleSubmit}>
          <div className="inline-editor-grid">
            <label>
              <span>Badge Halaman</span>
              <input
                value={form.badge}
                onChange={(event) => setForm((current) => ({ ...current, badge: event.target.value }))}
                required
              />
            </label>
            <label className="full">
              <span>Judul Halaman</span>
              <input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                required
              />
            </label>
            <label className="full">
              <span>Deskripsi Halaman</span>
              <textarea
                rows="3"
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                required
              />
            </label>
          </div>
          {message ? <div className="editor-message">{message}</div> : null}
          <button type="submit" className="primary-action" disabled={saving}>
            <Save size={18} />
            {saving ? "Menyimpan..." : "Simpan Judul"}
          </button>
        </form>
      ) : null}

      <section className={`page-heading ${sectionClassName}`}>
        <span className={`eyebrow ${eyebrowClassName}`}>
          {Icon ? <Icon size={17} /> : null}
          {settings[`${fieldPrefix}_badge`]}
        </span>
        <h1>{settings[`${fieldPrefix}_title`]}</h1>
        <p>{settings[`${fieldPrefix}_description`]}</p>
      </section>
    </>
  );
}
