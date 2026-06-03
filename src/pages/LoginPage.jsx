import { useEffect, useState } from "react";
import { Aperture, ArrowLeft, Eye, EyeOff, Lock, LogIn, ShieldCheck, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <main className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
        <section className="relative min-h-[44vh] overflow-hidden bg-blue-50 lg:min-h-screen">
          <img
            src="/login-gallery-hero.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-blue-50/45 to-sapphire-700/10" />
          <div className="relative z-10 flex h-full min-h-[44vh] flex-col p-6 sm:p-8 lg:min-h-screen lg:p-12 xl:p-16">
            <div className="flex items-center gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-white text-sapphire-700 shadow-soft lg:h-14 lg:w-14">
                <Aperture size={24} className="lg:hidden" />
                <Aperture size={28} className="hidden lg:block" />
              </span>
              <div>
                <p className="text-sm font-black uppercase tracking-[0.12em] text-slate-950 sm:text-base lg:text-xl">
                  Galeri SDN Wanasari 15
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-600">Kelola momen, bagikan cerita.</p>
              </div>
            </div>

            <div className="mt-8 max-w-xl sm:mt-10 lg:mt-20 xl:mt-24">
              <h1 className="max-w-sm text-3xl font-black leading-tight tracking-normal text-slate-950 sm:text-4xl lg:max-w-xl lg:text-5xl xl:text-6xl">
                Galeri indah untuk setiap momen.
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-700 sm:text-base lg:mt-6 lg:max-w-lg lg:text-lg lg:leading-8">
                Kelola foto, video, dan kenangan SDN Wanasari 15 dengan tampilan yang rapi dan mudah diakses.
              </p>
            </div>
          </div>
        </section>

        <section className="relative grid min-h-screen place-items-center overflow-hidden bg-gradient-to-br from-white via-blue-50 to-sapphire-100 px-4 py-8 sm:px-6">
          <div className="absolute -right-24 top-16 h-72 w-72 rounded-full bg-blue-200/45 blur-3xl" />
          <div className="absolute -bottom-24 left-10 h-80 w-80 rounded-full bg-sapphire-100/70 blur-3xl" />

          <div className="relative w-full max-w-xl">
            <section className="rounded-[28px] border border-white/80 bg-gradient-to-br from-white/95 via-blue-50/95 to-white/90 p-6 shadow-[0_28px_90px_rgba(30,64,175,0.16)] backdrop-blur sm:p-9">
              <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-sapphire-700 hover:text-sapphire-800">
                <ArrowLeft size={17} />
                Kembali ke galeri
              </Link>

              <div className="mb-8">
                <span className="mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-blue-50 to-white text-sapphire-700 shadow-sm">
                  <ShieldCheck size={29} />
                </span>
                <h1 className="text-3xl font-black tracking-normal text-slate-950 sm:text-4xl">Login Admin</h1>
                <p className="mt-3 max-w-md text-base leading-7 text-slate-600">
                  Masuk dengan username dan password untuk mengelola konten galeri.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-2 block text-sm font-black text-slate-900">Username</span>
                  <span className="relative block">
                    <User className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
                    <input
                      type="text"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      autoComplete="username"
                      className="h-14 w-full rounded-lg border border-blue-100 bg-white/90 pl-12 pr-4 text-base font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sapphire-500 focus:ring-4 focus:ring-blue-100"
                      required
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-black text-slate-900">Password</span>
                  <span className="relative block">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="current-password"
                      className="h-14 w-full rounded-lg border border-blue-100 bg-white/90 pl-12 pr-12 text-base font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sapphire-500 focus:ring-4 focus:ring-blue-100"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((shown) => !shown)}
                      className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md text-slate-400 transition hover:bg-blue-50 hover:text-sapphire-700"
                      aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                  </span>
                </label>

                {errorMessage ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                    {errorMessage}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-sapphire-700 to-blue-600 px-5 text-base font-black text-white shadow-[0_16px_36px_rgba(30,64,175,0.24)] transition hover:from-sapphire-800 hover:to-sapphire-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <LogIn size={21} />
                  {loading ? "Masuk..." : "Masuk"}
                </button>
              </form>
            </section>

            <div className="mt-7 flex items-center justify-center gap-2 text-sm font-semibold text-slate-500">
              <ShieldCheck size={16} />
              Akses aman untuk pengelolaan galeri Anda
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
