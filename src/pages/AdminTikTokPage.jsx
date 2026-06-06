import { useEffect, useMemo, useState } from "react";
import { Clapperboard, Edit3, ExternalLink, Plus, RefreshCw, Save, Search, Trash2, X } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import { useSession } from "../hooks/useSession.js";
import { supabase } from "../lib/supabase.js";

const EMPTY_FORM = { title: "", description: "", tiktok_url: "" };

export default function AdminTikTokPage() {
  const session = useSession();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function fetchItems() {
    setLoading(true);
    const { data, error } = await supabase.from("tiktok_gallery").select("*").order("created_at", { ascending: false });
    if (error) setErrorMessage(error.message);
    else setItems(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchItems();
  }, []);

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) =>
      `${item.title || ""} ${item.description || ""} ${item.tiktok_url || ""}`.toLowerCase().includes(normalizedQuery)
    );
  }, [items, query]);

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId("");
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({ title: item.title, description: item.description || "", tiktok_url: item.tiktok_url });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setErrorMessage("");

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      tiktok_url: form.tiktok_url.trim(),
    };

    const result = editingId
      ? await supabase.from("tiktok_gallery").update(payload).eq("id", editingId)
      : await supabase.from("tiktok_gallery").insert(payload);

    if (result.error) {
      setErrorMessage(result.error.message);
    } else {
      setMessage(editingId ? "Video TikTok berhasil diperbarui." : "Video TikTok berhasil ditambahkan.");
      resetForm();
      await fetchItems();
    }
    setSaving(false);
  }

  async function handleDelete(item) {
    if (!window.confirm(`Hapus video TikTok "${item.title}"?`)) return;
    const { error } = await supabase.from("tiktok_gallery").delete().eq("id", item.id);
    if (error) setErrorMessage(error.message);
    else {
      setMessage("Video TikTok berhasil dihapus.");
      await fetchItems();
    }
  }

  return (
    <div className="app-shell-page admin-shell-page">
      <Navbar session={session} />
      <main className="page-content">
        <section className="page-heading">
          <span className="eyebrow tiktok-eyebrow">
            <Clapperboard size={17} />
            Dashboard Admin
          </span>
          <h1>Kelola Video TikTok</h1>
          <p>Tambah, edit, dan hapus tautan video yang tampil pada halaman TikTok publik.</p>
        </section>

        <section className="admin-form-card">
          <div className="admin-section-heading">
            <div>
              <p className="card-kicker">{editingId ? "Mode Edit" : "Konten Baru"}</p>
              <h2>{editingId ? "Edit Video TikTok" : "Tambah Video TikTok"}</h2>
            </div>
            {editingId ? (
              <button type="button" className="secondary-action compact" onClick={resetForm}>
                <X size={17} /> Batal
              </button>
            ) : null}
          </div>

          <form className="admin-tiktok-form" onSubmit={handleSubmit}>
            <label>
              <span>Judul Video</span>
              <input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                required
              />
            </label>
            <label>
              <span>Link TikTok</span>
              <input
                type="url"
                value={form.tiktok_url}
                onChange={(event) => setForm((current) => ({ ...current, tiktok_url: event.target.value }))}
                placeholder="https://www.tiktok.com/@username/video/..."
                required
              />
            </label>
            <label className="full">
              <span>Deskripsi</span>
              <textarea
                rows="4"
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              />
            </label>

            {errorMessage ? <div className="alert-error full">{errorMessage}</div> : null}
            {message ? <div className="alert-success full">{message}</div> : null}

            <button type="submit" className="primary-action form-submit" disabled={saving}>
              {editingId ? <Save size={18} /> : <Plus size={18} />}
              {saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Video"}
            </button>
          </form>
        </section>

        <section className="admin-list-card">
          <div className="admin-section-heading">
            <div>
              <p className="card-kicker">Konten Tersimpan</p>
              <h2>Daftar Video TikTok</h2>
            </div>
            <div className="admin-list-actions">
              <label className="search-box">
                <Search size={17} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari video..." />
              </label>
              <button type="button" className="icon-action" onClick={fetchItems} aria-label="Refresh">
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="empty-state small">Memuat data TikTok...</div>
          ) : visibleItems.length ? (
            <div className="admin-tiktok-list">
              {visibleItems.map((item) => (
                <article key={item.id}>
                  <span className="card-icon dark">
                    <Clapperboard size={21} />
                  </span>
                  <div className="admin-tiktok-copy">
                    <h3>{item.title}</h3>
                    <p>{item.description || "Tanpa deskripsi"}</p>
                    <a href={item.tiktok_url} target="_blank" rel="noreferrer">
                      Lihat tautan <ExternalLink size={14} />
                    </a>
                  </div>
                  <div className="row-actions">
                    <button type="button" onClick={() => startEdit(item)} aria-label={`Edit ${item.title}`}>
                      <Edit3 size={17} />
                    </button>
                    <button type="button" className="danger" onClick={() => handleDelete(item)} aria-label={`Hapus ${item.title}`}>
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state small">Belum ada video TikTok.</div>
          )}
        </section>
      </main>
    </div>
  );
}
