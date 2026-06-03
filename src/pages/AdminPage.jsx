import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Edit3, FolderInput, LogOut, RefreshCw, Save, Search, Trash2, X } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import { EMPTY_FORM, FOLDER_CATEGORIES } from "../constants/media.js";
import { getDriveFileId } from "../lib/drive.js";
import { importGoogleDriveFolder } from "../lib/googleDriveImport.js";
import { supabase } from "../lib/supabase.js";

const BULK_DELETE_BATCH_SIZE = 25;
const MAIN_DRIVE_FOLDER_URL = "https://drive.google.com/drive/u/7/folders/14kTfSBYmWNUZB3Qft4iHKoUEtnze9QWd";

function getTypeLabel(type) {
  return type === "image" ? "Foto" : "Video";
}

export default function AdminPage() {
  const dragTouchedIds = useRef(new Set());
  const dragSelectionMode = useRef(true);
  const [session, setSession] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "desc" });
  const [isDraggingSelection, setIsDraggingSelection] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [inputMode, setInputMode] = useState("single");
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    fetchItems();
  }, []);

  useEffect(() => {
    function stopSelectionDrag() {
      setIsDraggingSelection(false);
      dragTouchedIds.current.clear();
    }

    window.addEventListener("pointerup", stopSelectionDrag);
    window.addEventListener("pointercancel", stopSelectionDrag);

    return () => {
      window.removeEventListener("pointerup", stopSelectionDrag);
      window.removeEventListener("pointercancel", stopSelectionDrag);
    };
  }, []);

  async function fetchItems() {
    setLoading(true);
    setErrorMessage("");
    const { data, error } = await supabase
      .from("media_gallery")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setItems(data || []);
      setSelectedIds((current) => {
        const nextIds = new Set((data || []).map((item) => item.id));
        return current.filter((id) => nextIds.has(id));
      });
    }

    setLoading(false);
  }

  const visibleItems = useMemo(() => {
    const query = adminSearchQuery.trim().toLowerCase();
    const filtered = items.filter((item) => {
      const searchableText =
        `${item.title || ""} ${item.description || ""} ${item.type || ""} ${getTypeLabel(item.type)} ${item.folder_category || ""}`.toLowerCase();
      return !query || searchableText.includes(query);
    });

    return [...filtered].sort((first, second) => {
      const firstValue = String(first[sortConfig.key] || "").toLowerCase();
      const secondValue = String(second[sortConfig.key] || "").toLowerCase();
      const result = firstValue.localeCompare(secondValue, "id", { numeric: true, sensitivity: "base" });
      return sortConfig.direction === "asc" ? result : -result;
    });
  }, [adminSearchQuery, items, sortConfig]);

  const allSelected = visibleItems.length > 0 && visibleItems.every((item) => selectedIds.includes(item.id));

  function getSortIcon(key) {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} />;
    return sortConfig.direction === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  }

  function toggleSort(key) {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  }

  function toggleSelect(id) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]
    );
  }

  function setSelectedState(id, shouldSelect) {
    setSelectedIds((current) => {
      const alreadySelected = current.includes(id);
      if (shouldSelect && !alreadySelected) return [...current, id];
      if (!shouldSelect && alreadySelected) return current.filter((selectedId) => selectedId !== id);
      return current;
    });
  }

  function startSelectionDrag(item, event) {
    if (event.button !== 0) return;

    event.preventDefault();
    const shouldSelect = !selectedIds.includes(item.id);
    dragSelectionMode.current = shouldSelect;
    dragTouchedIds.current = new Set([item.id]);
    setSelectedState(item.id, shouldSelect);
    setIsDraggingSelection(true);
  }

  function continueSelectionDrag(item) {
    if (!isDraggingSelection || dragTouchedIds.current.has(item.id)) return;

    dragTouchedIds.current.add(item.id);
    setSelectedState(item.id, dragSelectionMode.current);
  }

  function toggleSelectAll() {
    const visibleIds = visibleItems.map((item) => item.id);

    if (allSelected) {
      setSelectedIds((current) => current.filter((id) => !visibleIds.includes(id)));
      return;
    }

    setSelectedIds((current) => Array.from(new Set([...current, ...visibleIds])));
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function changeInputMode(nextMode) {
    setInputMode(nextMode);
    setEditingId("");
    setForm((current) => {
      if (nextMode === "folder") {
        return {
          ...current,
          title: "",
          type: "auto",
          folder_category: "auto",
          drive_url: current.drive_url || MAIN_DRIVE_FOLDER_URL,
        };
      }

      return {
        ...current,
        type: current.type === "auto" ? "image" : current.type,
        folder_category: current.folder_category === "auto" ? "Kamera" : current.folder_category,
        drive_url: current.drive_url === MAIN_DRIVE_FOLDER_URL ? "" : current.drive_url,
      };
    });
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setInputMode("single");
    setEditingId("");
  }

  function startEdit(item) {
    setEditingId(item.id);
    setInputMode("single");
    setForm({
      title: item.title || "",
      description: item.description || "",
      type: item.type || "image",
      folder_category: item.folder_category || "Kamera",
      drive_url: item.drive_url || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setErrorMessage("");

    if (inputMode === "folder" && !editingId) {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
        const driveItems = await importGoogleDriveFolder(form.drive_url.trim(), apiKey);
        const existingFileIds = new Set(items.map((item) => getDriveFileId(item.drive_url)).filter(Boolean));
        const titlePrefix = form.title.trim();
        const description = form.description.trim();
        const newItems = driveItems
          .filter((item) => {
            const fileId = getDriveFileId(item.drive_url);
            return fileId && !existingFileIds.has(fileId);
          })
          .map((item) => ({
            title: titlePrefix ? `${titlePrefix} - ${item.title}` : item.title,
            description,
            type: form.type === "auto" ? item.type : form.type,
            folder_category: form.folder_category === "auto" ? item.folder_category : form.folder_category,
            drive_url: item.drive_url,
          }));

        if (!driveItems.length) {
          setMessage("Folder ditemukan, tapi tidak ada file foto/video yang bisa diimpor.");
          return;
        }

        if (!newItems.length) {
          setMessage("Semua file dari folder itu sudah ada di galeri.");
          return;
        }

        const { error } = await supabase.from("media_gallery").insert(newItems);
        if (error) throw error;

        setMessage(`${newItems.length} media berhasil diimpor dari Google Drive.`);
        await fetchItems();
      } catch (error) {
        setErrorMessage(error.message || "Gagal import dari Google Drive.");
      } finally {
        setSaving(false);
      }

      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      folder_category: form.folder_category,
      drive_url: form.drive_url.trim(),
    };

    const result = editingId
      ? await supabase.from("media_gallery").update(payload).eq("id", editingId)
      : await supabase.from("media_gallery").insert(payload);

    if (result.error) {
      setErrorMessage(result.error.message);
    } else {
      setMessage(editingId ? "Media berhasil diperbarui." : "Media berhasil ditambahkan.");
      resetForm();
      await fetchItems();
    }

    setSaving(false);
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(`Hapus "${item.title}" dari galeri?`);
    if (!confirmed) return;

    setErrorMessage("");
    setMessage("");

    const { error } = await supabase.from("media_gallery").delete().eq("id", item.id);
    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSelectedIds((current) => current.filter((id) => id !== item.id));
    setMessage("Media berhasil dihapus.");
    await fetchItems();
  }

  async function handleBulkDelete() {
    if (!selectedIds.length) return;

    const confirmed = window.confirm(`Hapus ${selectedIds.length} media yang dipilih dari galeri?`);
    if (!confirmed) return;

    setBulkDeleting(true);
    setErrorMessage("");
    setMessage("");

    for (let index = 0; index < selectedIds.length; index += BULK_DELETE_BATCH_SIZE) {
      const batchIds = selectedIds.slice(index, index + BULK_DELETE_BATCH_SIZE);
      const { error } = await supabase.from("media_gallery").delete().in("id", batchIds);

      if (error) {
        setErrorMessage(error.message);
        setBulkDeleting(false);
        return;
      }
    }

    setMessage(`${selectedIds.length} media berhasil dihapus.`);
    setSelectedIds([]);
    await fetchItems();
    setBulkDeleting(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar session={session} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-sapphire-700">Dashboard</p>
            <h1 className="mt-1 text-3xl font-black text-slate-950">Kelola Galeri</h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-blue-100 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-sapphire-700"
          >
            <LogOut size={17} />
            Keluar
          </button>
        </section>

        <section className="mb-8 rounded-lg border border-blue-100 bg-white p-5 shadow-soft">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-black text-slate-950">{editingId ? "Edit Media" : "Tambah Media"}</h2>
              <p className="mt-1 text-sm text-slate-600">
                Tambahkan satu media atau import banyak file dari satu folder Google Drive.
              </p>
            </div>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-100 px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
              >
                <X size={17} />
                Batal Edit
              </button>
            ) : null}
          </div>

          <form className="grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit}>
            {!editingId ? (
              <div className="lg:col-span-2">
                <span className="mb-1.5 block text-sm font-bold text-slate-800">Mode Input</span>
                <div className="inline-flex rounded-lg border border-blue-100 bg-blue-50 p-1">
                  <button
                    type="button"
                    onClick={() => changeInputMode("single")}
                    className={`h-10 rounded-md px-4 text-sm font-bold transition ${
                      inputMode === "single" ? "bg-white text-sapphire-700 shadow-sm" : "text-slate-600 hover:text-sapphire-700"
                    }`}
                  >
                    Satu Media
                  </button>
                  <button
                    type="button"
                    onClick={() => changeInputMode("folder")}
                    className={`inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-bold transition ${
                      inputMode === "folder" ? "bg-white text-sapphire-700 shadow-sm" : "text-slate-600 hover:text-sapphire-700"
                    }`}
                  >
                    <FolderInput size={17} />
                    Import Folder
                  </button>
                </div>
              </div>
            ) : null}

            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-slate-800">
                {inputMode === "folder" && !editingId ? "Judul / Prefix Judul" : "Judul"}
              </span>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sapphire-500 focus:ring-4 focus:ring-blue-100"
                required={inputMode === "single" || Boolean(editingId)}
              />
              {inputMode === "folder" && !editingId ? (
                <span className="mt-1.5 block text-xs leading-5 text-slate-500">
                  Kosongkan untuk memakai nama file asli. Isi jika ingin menambahkan prefix ke semua judul.
                </span>
              ) : null}
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-slate-800">Tipe</span>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sapphire-500 focus:ring-4 focus:ring-blue-100"
              >
                {inputMode === "folder" && !editingId ? <option value="auto">Otomatis dari file</option> : null}
                <option value="image">Foto</option>
                <option value="video">Video</option>
              </select>
              {inputMode === "folder" && !editingId ? (
                <span className="mt-1.5 block text-xs leading-5 text-slate-500">
                  Pakai otomatis agar foto tetap foto dan video tetap video, atau pilih manual untuk memaksa semua file.
                </span>
              ) : null}
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-slate-800">Kategori Folder</span>
              <select
                name="folder_category"
                value={form.folder_category}
                onChange={handleChange}
                className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sapphire-500 focus:ring-4 focus:ring-blue-100"
              >
                {inputMode === "folder" && !editingId ? <option value="auto">Ikuti subfolder Drive</option> : null}
                {FOLDER_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {inputMode === "folder" && !editingId ? (
                <span className="mt-1.5 block text-xs leading-5 text-slate-500">
                  Pilih kategori manual jika semua file import ingin dimasukkan ke kategori yang sama.
                </span>
              ) : null}
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-slate-800">
                {inputMode === "folder" && !editingId ? "Link Folder Google Drive" : "URL Google Drive"}
              </span>
              <input
                name="drive_url"
                value={form.drive_url}
                onChange={handleChange}
                placeholder={
                  inputMode === "folder" && !editingId
                    ? "https://drive.google.com/drive/folders/FOLDER_ID"
                    : "https://drive.google.com/uc?export=view&id=FILE_ID"
                }
                className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sapphire-500 focus:ring-4 focus:ring-blue-100"
                required
              />
              <span className="mt-1.5 block text-xs leading-5 text-slate-500">
                {inputMode === "folder" && !editingId
                  ? "Folder dan file perlu disetel Anyone with the link. Sistem akan mengabaikan file yang sudah pernah diimpor."
                  : "Ambil ID dari link seperti drive.google.com/file/d/FILE_ID/view, lalu ubah menjadi https://drive.google.com/uc?export=view&id=FILE_ID."}
              </span>
            </label>

            <label className="block lg:col-span-2">
              <span className="mb-1.5 block text-sm font-bold text-slate-800">Deskripsi</span>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-sapphire-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            {errorMessage ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 lg:col-span-2">
                {errorMessage}
              </div>
            ) : null}
            {message ? (
              <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-sapphire-700 lg:col-span-2">
                {message}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row lg:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-sapphire-700 px-5 text-sm font-bold text-white transition hover:bg-sapphire-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Save size={18} />
                {saving
                  ? inputMode === "folder" && !editingId
                    ? "Mengimpor..."
                    : "Menyimpan..."
                  : editingId
                    ? "Simpan Perubahan"
                    : inputMode === "folder"
                      ? "Import Media"
                      : "Tambah Media"}
              </button>
              <button
                type="button"
                onClick={fetchItems}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-blue-100 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-sapphire-700"
              >
                <RefreshCw size={18} />
                Refresh
              </button>
            </div>
          </form>
        </section>

        <section className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-soft">
          <div className="flex flex-col justify-between gap-3 border-b border-blue-100 px-5 py-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-black text-slate-950">Daftar Media</h2>
              <p className="mt-1 text-sm text-slate-500">
                {selectedIds.length
                  ? `${selectedIds.length} media dipilih`
                  : `${visibleItems.length} dari ${items.length} media ditampilkan`}
              </p>
            </div>
            <div className="flex flex-col gap-2 lg:flex-row">
              <label className="relative block min-w-0 lg:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  value={adminSearchQuery}
                  onChange={(event) => setAdminSearchQuery(event.target.value)}
                  placeholder="Cari judul, tipe, kategori"
                  className="h-10 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-sapphire-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>
              <button
                type="button"
                onClick={toggleSelectAll}
                disabled={!visibleItems.length || loading}
                className="inline-flex h-10 items-center justify-center rounded-md border border-blue-100 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-sapphire-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {allSelected ? "Batal Pilih Semua" : "Pilih Semua"}
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={!selectedIds.length || bulkDeleting}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={17} />
                {bulkDeleting ? "Menghapus..." : "Hapus Dipilih"}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-blue-50">
                <tr>
                  <th className="w-12 px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      disabled={!visibleItems.length || loading}
                      className="h-4 w-4 rounded border-slate-300 text-sapphire-700 focus:ring-sapphire-500"
                      aria-label="Pilih semua media"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-sapphire-800">
                    <button type="button" onClick={() => toggleSort("title")} className="inline-flex items-center gap-1.5">
                      Judul
                      {getSortIcon("title")}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-sapphire-800">
                    <button type="button" onClick={() => toggleSort("type")} className="inline-flex items-center gap-1.5">
                      Tipe
                      {getSortIcon("type")}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-sapphire-800">
                    <button
                      type="button"
                      onClick={() => toggleSort("folder_category")}
                      className="inline-flex items-center gap-1.5"
                    >
                      Kategori
                      {getSortIcon("folder_category")}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-sapphire-800">URL</th>
                  <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-wider text-sapphire-800">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-sm text-slate-500">
                      Memuat data...
                    </td>
                  </tr>
                ) : visibleItems.length ? (
                  visibleItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td
                        className="cursor-pointer px-4 py-3"
                        onPointerDown={(event) => startSelectionDrag(item, event)}
                        onPointerEnter={() => continueSelectionDrag(item)}
                        title="Tahan lalu geser untuk pilih banyak"
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelect(item.id)}
                          className="pointer-events-none h-4 w-4 rounded border-slate-300 text-sapphire-700 focus:ring-sapphire-500"
                          aria-label={`Pilih ${item.title}`}
                        />
                      </td>
                      <td className="max-w-xs px-4 py-3">
                        <div className="truncate text-sm font-bold text-slate-950">{item.title}</div>
                        <div className="line-clamp-2 text-xs leading-5 text-slate-500">{item.description}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">{getTypeLabel(item.type)}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{item.folder_category}</td>
                      <td className="max-w-xs px-4 py-3">
                        <a
                          href={item.drive_url}
                          target="_blank"
                          rel="noreferrer"
                          className="block truncate text-sm font-semibold text-sapphire-700 hover:underline"
                        >
                          {item.drive_url}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            className="grid h-9 w-9 place-items-center rounded-md bg-blue-50 text-sapphire-700 transition hover:bg-blue-100"
                            aria-label={`Edit ${item.title}`}
                            title="Edit"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className="grid h-9 w-9 place-items-center rounded-md bg-red-50 text-red-600 transition hover:bg-red-100"
                            aria-label={`Hapus ${item.title}`}
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-sm text-slate-500">
                      {items.length ? "Tidak ada media yang cocok dengan pencarian." : "Belum ada data media."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
