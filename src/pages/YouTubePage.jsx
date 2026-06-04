import { useEffect, useMemo, useState } from "react";
import { PlayCircle, Search } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import YouTubeCard from "../components/YouTubeCard.jsx";
import { supabase } from "../lib/supabase.js";

export default function YouTubePage() {
  const [session, setSession] = useState(null);
  const [videos, setVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchVideos() {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("youtube_gallery")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setVideos(data || []);
      }

      setLoading(false);
    }

    fetchVideos();
  }, []);

  const filteredVideos = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return videos.filter((video) => {
      const searchableText = `${video.title || ""} ${video.description || ""} ${video.youtube_id || ""}`.toLowerCase();
      return !query || searchableText.includes(query);
    });
  }, [searchQuery, videos]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar session={session} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 space-y-5">
          <div className="max-w-3xl">
            <div className="mb-2 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-red-700">
              <PlayCircle size={17} />
              Video YouTube
            </div>
            <h1 className="text-3xl font-black tracking-normal text-slate-950">Galeri YouTube</h1>
            <p className="mt-2 text-base leading-7 text-slate-600 sm:text-lg">
              Kumpulan highlight acara kelulusan dan tasyakuran kelas 6 SDN Wanasari 15 pada 02 Juni 2026.
            </p>
          </div>

          <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
            <label className="relative block max-w-xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Cari judul, deskripsi, atau ID YouTube"
                className="h-11 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-sapphire-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>
          </div>
        </section>

        {errorMessage ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {loading ? (
          <div className="grid min-h-64 place-items-center rounded-lg border border-blue-100 bg-white text-slate-600">
            Memuat video YouTube...
          </div>
        ) : filteredVideos.length ? (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredVideos.map((video) => (
              <YouTubeCard key={video.id} video={video} />
            ))}
          </section>
        ) : (
          <div className="grid min-h-64 place-items-center rounded-lg border border-dashed border-blue-200 bg-white px-4 text-center">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Belum ada video YouTube</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                Tambahkan video lewat tab YouTube di halaman admin.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
