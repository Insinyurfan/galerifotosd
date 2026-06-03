import { useEffect, useMemo, useState } from "react";
import { Image, PlayCircle, Search } from "lucide-react";
import CategoryTabs from "../components/CategoryTabs.jsx";
import Lightbox from "../components/Lightbox.jsx";
import MediaCard from "../components/MediaCard.jsx";
import Navbar from "../components/Navbar.jsx";
import { supabase } from "../lib/supabase.js";

export default function GalleryPage() {
  const [session, setSession] = useState(null);
  const [mediaItems, setMediaItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [mediaTypeFilter, setMediaTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [lightboxMedia, setLightboxMedia] = useState(null);
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
    async function fetchMedia() {
      setLoading(true);
      setErrorMessage("");
      const { data, error } = await supabase
        .from("media_gallery")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setMediaItems(data || []);
      }

      setLoading(false);
    }

    fetchMedia();
  }, []);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return mediaItems.filter((item) => {
      const matchesCategory = activeCategory === "Semua" || item.folder_category === activeCategory;
      const matchesType = mediaTypeFilter === "all" || item.type === mediaTypeFilter;
      const searchableText = `${item.title || ""} ${item.description || ""} ${item.folder_category || ""}`.toLowerCase();
      const matchesSearch = !query || searchableText.includes(query);

      return matchesCategory && matchesType && matchesSearch;
    });
  }, [activeCategory, mediaItems, mediaTypeFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar session={session} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 space-y-5">
          <div className="max-w-3xl">
            <h1 className="sr-only">Galeri SDN Wanasari 15</h1>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-sapphire-700">
              Kamera, iPhone, Drone
            </p>
            <p className="text-base leading-7 text-slate-600 sm:text-lg">
              Kumpulan foto dan video kenangan 02 Juni 2026 pada SDN Wanasari 15.
            </p>
          </div>

          <div className="grid gap-4 rounded-lg border border-blue-100 bg-white p-4 shadow-sm lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="min-w-0">
              <CategoryTabs activeCategory={activeCategory} onChange={setActiveCategory} />
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(220px,1fr)_auto] lg:min-w-[520px]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Cari judul atau deskripsi"
                  className="h-11 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-sapphire-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <div className="inline-flex h-11 rounded-lg border border-blue-100 bg-blue-50 p-1">
                <button
                  type="button"
                  onClick={() => setMediaTypeFilter("all")}
                  className={`rounded-md px-3 text-sm font-bold transition ${
                    mediaTypeFilter === "all" ? "bg-white text-sapphire-700 shadow-sm" : "text-slate-600 hover:text-sapphire-700"
                  }`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setMediaTypeFilter("image")}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 text-sm font-bold transition ${
                    mediaTypeFilter === "image" ? "bg-white text-sapphire-700 shadow-sm" : "text-slate-600 hover:text-sapphire-700"
                  }`}
                >
                  <Image size={16} />
                  Foto
                </button>
                <button
                  type="button"
                  onClick={() => setMediaTypeFilter("video")}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 text-sm font-bold transition ${
                    mediaTypeFilter === "video" ? "bg-white text-sapphire-700 shadow-sm" : "text-slate-600 hover:text-sapphire-700"
                  }`}
                >
                  <PlayCircle size={16} />
                  Video
                </button>
              </div>
            </div>
          </div>
        </section>

        {errorMessage ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {loading ? (
          <div className="grid min-h-64 place-items-center rounded-lg border border-blue-100 bg-white text-slate-600">
            Memuat media...
          </div>
        ) : filteredItems.length ? (
          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((media) => (
              <MediaCard key={media.id} media={media} onOpen={setLightboxMedia} />
            ))}
          </section>
        ) : (
          <div className="grid min-h-64 place-items-center rounded-lg border border-dashed border-blue-200 bg-white px-4 text-center">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Belum ada media</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                Tambahkan data lewat halaman admin agar foto dan video tampil di galeri publik.
              </p>
            </div>
          </div>
        )}
      </main>

      <Lightbox media={lightboxMedia} onClose={() => setLightboxMedia(null)} />
    </div>
  );
}
