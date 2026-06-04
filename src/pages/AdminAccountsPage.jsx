import { useCallback, useEffect, useState } from "react";
import { Edit3, Eye, EyeOff, KeyRound, Mail, RefreshCw, Save, Trash2, UserPlus, Users, X } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import { supabase } from "../lib/supabase.js";

const EMPTY_ACCOUNT_FORM = {
  username: "",
  email: "",
  password: "",
};

function formatAccountDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function AdminAccountsPage() {
  const [session, setSession] = useState(null);
  const [adminAccounts, setAdminAccounts] = useState([]);
  const [accountForm, setAccountForm] = useState(EMPTY_ACCOUNT_FORM);
  const [accountEditingId, setAccountEditingId] = useState("");
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountSaving, setAccountSaving] = useState(false);
  const [showAccountPassword, setShowAccountPassword] = useState(false);
  const [accountMessage, setAccountMessage] = useState("");
  const [accountErrorMessage, setAccountErrorMessage] = useState("");

  const getAdminAccountHeaders = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      throw new Error("Sesi admin tidak ditemukan. Silakan login ulang.");
    }

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }, []);

  const readAccountResponse = useCallback(async (response) => {
    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json") ? await response.json() : {};

    if (!response.ok) {
      throw new Error(payload.error || "Permintaan akun admin gagal.");
    }

    return payload;
  }, []);

  const fetchAdminAccounts = useCallback(async () => {
    setAccountLoading(true);
    setAccountErrorMessage("");

    try {
      const headers = await getAdminAccountHeaders();
      const response = await fetch("/api/admin-accounts", { headers });
      const payload = await readAccountResponse(response);
      setAdminAccounts(payload.accounts || []);
    } catch (error) {
      setAccountErrorMessage(error.message || "Gagal memuat akun admin.");
    } finally {
      setAccountLoading(false);
    }
  }, [getAdminAccountHeaders, readAccountResponse]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) fetchAdminAccounts();
    });
  }, [fetchAdminAccounts]);

  function handleAccountChange(event) {
    const { name, value } = event.target;
    setAccountForm((current) => ({ ...current, [name]: value }));
  }

  function resetAccountForm() {
    setAccountForm(EMPTY_ACCOUNT_FORM);
    setAccountEditingId("");
    setShowAccountPassword(false);
  }

  function startAccountEdit(account) {
    setAccountEditingId(account.id);
    setAccountForm({
      username: account.username || "",
      email: account.email || "",
      password: "",
    });
    setAccountMessage("");
    setAccountErrorMessage("");
  }

  async function handleAccountSubmit(event) {
    event.preventDefault();
    setAccountSaving(true);
    setAccountMessage("");
    setAccountErrorMessage("");

    try {
      const headers = await getAdminAccountHeaders();
      const response = await fetch("/api/admin-accounts", {
        method: accountEditingId ? "PATCH" : "POST",
        headers,
        body: JSON.stringify({
          id: accountEditingId,
          username: accountForm.username,
          email: accountForm.email,
          password: accountForm.password,
        }),
      });
      const payload = await readAccountResponse(response);

      setAdminAccounts(payload.accounts || []);
      setAccountMessage(payload.message || (accountEditingId ? "Akun admin diperbarui." : "Akun admin ditambahkan."));
      resetAccountForm();
    } catch (error) {
      setAccountErrorMessage(error.message || "Gagal menyimpan akun admin.");
    } finally {
      setAccountSaving(false);
    }
  }

  async function handleAccountDelete(account) {
    if (account.id === session?.user?.id) {
      setAccountErrorMessage("Akun yang sedang dipakai tidak bisa dihapus dari halaman ini.");
      return;
    }

    const confirmed = window.confirm(`Hapus akun admin "${account.username}"?`);
    if (!confirmed) return;

    setAccountSaving(true);
    setAccountMessage("");
    setAccountErrorMessage("");

    try {
      const headers = await getAdminAccountHeaders();
      const response = await fetch("/api/admin-accounts", {
        method: "DELETE",
        headers,
        body: JSON.stringify({ id: account.id }),
      });
      const payload = await readAccountResponse(response);

      setAdminAccounts(payload.accounts || []);
      setAccountMessage(payload.message || "Akun admin dihapus.");
      if (accountEditingId === account.id) resetAccountForm();
    } catch (error) {
      setAccountErrorMessage(error.message || "Gagal menghapus akun admin.");
    } finally {
      setAccountSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar session={session} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-6">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-sapphire-700">
            <Users size={17} />
            Pengaturan Akun
          </div>
          <h1 className="mt-1 text-3xl font-black text-slate-950">Kelola Akun Admin</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Tambahkan admin baru atau ubah username, email, dan password akun admin.
          </p>
        </section>

        <section className="rounded-lg border border-blue-100 bg-white p-5 shadow-soft">
          <div className="mb-5 flex justify-end">
            <button
              type="button"
              onClick={fetchAdminAccounts}
              disabled={accountLoading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-blue-100 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-sapphire-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={17} />
              {accountLoading ? "Memuat..." : "Refresh Akun"}
            </button>
          </div>

          <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
            <form className="grid gap-4 rounded-md border border-slate-100 bg-slate-50 p-4" onSubmit={handleAccountSubmit}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-black text-slate-950">
                  {accountEditingId ? "Edit Akun Admin" : "Tambah Akun Admin"}
                </h2>
                {accountEditingId ? (
                  <button
                    type="button"
                    onClick={resetAccountForm}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-white px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                  >
                    <X size={16} />
                    Batal
                  </button>
                ) : null}
              </div>

              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-slate-800">Username</span>
                <input
                  name="username"
                  value={accountForm.username}
                  onChange={handleAccountChange}
                  autoComplete="username"
                  placeholder="contoh: admin.sekolah"
                  className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sapphire-500 focus:ring-4 focus:ring-blue-100"
                  required
                />
                <span className="mt-1.5 block text-xs leading-5 text-slate-500">
                  3-32 karakter: huruf, angka, titik, garis bawah, atau tanda minus.
                </span>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-slate-800">Email</span>
                <span className="relative block">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    name="email"
                    type="email"
                    value={accountForm.email}
                    onChange={handleAccountChange}
                    autoComplete="email"
                    className="h-11 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-sapphire-500 focus:ring-4 focus:ring-blue-100"
                    required
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-slate-800">
                  {accountEditingId ? "Password Baru" : "Password"}
                </span>
                <span className="relative block">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    name="password"
                    type={showAccountPassword ? "text" : "password"}
                    value={accountForm.password}
                    onChange={handleAccountChange}
                    autoComplete="new-password"
                    className="h-11 w-full rounded-md border border-slate-200 bg-white pl-10 pr-11 text-sm outline-none transition focus:border-sapphire-500 focus:ring-4 focus:ring-blue-100"
                    required={!accountEditingId}
                    minLength={accountForm.password ? 6 : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAccountPassword((shown) => !shown)}
                    className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-slate-400 transition hover:bg-blue-50 hover:text-sapphire-700"
                    aria-label={showAccountPassword ? "Sembunyikan password" : "Tampilkan password"}
                    title={showAccountPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showAccountPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </span>
                <span className="mt-1.5 block text-xs leading-5 text-slate-500">
                  {accountEditingId ? "Kosongkan jika password tidak ingin diganti." : "Minimal 6 karakter."}
                </span>
              </label>

              {accountErrorMessage ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                  {accountErrorMessage}
                </div>
              ) : null}
              {accountMessage ? (
                <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-sapphire-700">
                  {accountMessage}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={accountSaving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-sapphire-700 px-5 text-sm font-bold text-white transition hover:bg-sapphire-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {accountEditingId ? <Save size={18} /> : <UserPlus size={18} />}
                {accountSaving ? "Menyimpan..." : accountEditingId ? "Simpan Akun" : "Tambah Admin"}
              </button>
            </form>

            <div className="overflow-hidden rounded-md border border-slate-100">
              <div className="border-b border-slate-100 bg-blue-50 px-4 py-3">
                <h2 className="text-base font-black text-slate-950">Daftar Admin</h2>
                <p className="mt-1 text-sm text-slate-600">{adminAccounts.length} akun admin terdaftar</p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-sapphire-800">
                        Username
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-sapphire-800">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-sapphire-800">
                        Terakhir Login
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-wider text-sapphire-800">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {accountLoading ? (
                      <tr>
                        <td colSpan="4" className="px-4 py-7 text-center text-sm text-slate-500">
                          Memuat akun admin...
                        </td>
                      </tr>
                    ) : adminAccounts.length ? (
                      adminAccounts.map((account) => (
                        <tr key={account.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="truncate text-sm font-bold text-slate-950">{account.username}</span>
                              {account.id === session?.user?.id ? (
                                <span className="shrink-0 rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-black uppercase tracking-wide text-sapphire-700">
                                  Anda
                                </span>
                              ) : null}
                            </div>
                            <div className="text-xs text-slate-500">Dibuat {formatAccountDate(account.created_at)}</div>
                          </td>
                          <td className="max-w-[14rem] px-4 py-3 text-sm text-slate-700">
                            <span className="block truncate">{account.email || "-"}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-700">{formatAccountDate(account.last_sign_in_at)}</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => startAccountEdit(account)}
                                className="grid h-9 w-9 place-items-center rounded-md bg-blue-50 text-sapphire-700 transition hover:bg-blue-100"
                                aria-label={`Edit akun ${account.username}`}
                                title="Edit akun"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAccountDelete(account)}
                                disabled={account.id === session?.user?.id || accountSaving}
                                className="grid h-9 w-9 place-items-center rounded-md bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label={`Hapus akun ${account.username}`}
                                title={account.id === session?.user?.id ? "Akun yang sedang dipakai tidak bisa dihapus" : "Hapus akun"}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-4 py-7 text-center text-sm text-slate-500">
                          Belum ada akun admin yang bisa ditampilkan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
