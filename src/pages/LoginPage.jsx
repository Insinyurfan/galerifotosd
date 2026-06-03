import { useEffect, useState } from "react";
import { Lock, LogIn, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/admin", { replace: true });
    });
  }, [navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const envUsername = import.meta.env.VITE_ADMIN_USERNAME;
    const envEmail = import.meta.env.VITE_ADMIN_EMAIL;
    const usernameInput = username.trim();
    let email = "";

    if (envUsername && envEmail && usernameInput.toLowerCase() === envUsername.toLowerCase()) {
      email = envEmail;
    } else {
      const { data, error: usernameError } = await supabase.rpc("get_admin_login_email", {
        input_username: usernameInput,
      });

      if (!usernameError) {
        email = data;
      }
    }

    if (!email) {
      setErrorMessage("Username tidak ditemukan.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMessage("Username atau password salah.");
      setLoading(false);
      return;
    }

    navigate("/admin", { replace: true });
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-blue-100 bg-white p-6 shadow-soft">
        <Link to="/" className="mb-6 inline-flex items-center text-sm font-semibold text-sapphire-700">
          Kembali ke galeri
        </Link>
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-950">Login Admin</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Masuk dengan username dan password untuk mengelola konten galeri.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-slate-800">Username</span>
            <span className="relative block">
              <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                className="h-11 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-sapphire-500 focus:ring-4 focus:ring-blue-100"
                required
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-slate-800">Password</span>
            <span className="relative block">
              <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                className="h-11 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-sapphire-500 focus:ring-4 focus:ring-blue-100"
                required
              />
            </span>
          </label>

          {errorMessage ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-sapphire-700 px-4 text-sm font-bold text-white transition hover:bg-sapphire-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <LogIn size={18} />
            {loading ? "Masuk..." : "Masuk"}
          </button>
        </form>
      </section>
    </main>
  );
}
