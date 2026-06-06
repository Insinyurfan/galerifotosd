import { useEffect, useMemo, useState } from "react";
import { Camera, Image, PlayCircle, Search } from "lucide-react";
import CategoryTabs from "../components/CategoryTabs.jsx";
import Lightbox from "../components/Lightbox.jsx";
import MediaCard from "../components/MediaCard.jsx";
import Navbar from "../components/Navbar.jsx";
import { useSession } from "../hooks/useSession.js";
import { supabase } from "../lib/supabase.js";

export default function GalleryPage({ mediaType = "image" }) {
  const session = useSession();
  const [mediaItems, setMediaItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [lightboxMedia, setLightboxMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const isPhotoPage = mediaType === "image";

  useEffect(() => {
    async function fetchMedia() {
      setLoading(true);
      setErrorMessage("");
      const { data, error } = await supabase
        .from("media_gallery")
        .select("*")
        .eq("type", mediaType)
        .order("created_at", { ascending: false });

      if (error) setErrorMessage(error.message);
      else setMediaItems(data || []);
      setLoading(false);
    }

    fetchMedia();
  }, [mediaType]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return mediaItems.filter((item) => {
      const matchesCategory = activeCategory === "Semua" || item.folder_category === activeCategory;
      const searchableText = `${item.title || ""} ${item.description || ""} ${item.folder_category || ""}`.toLowerCase();
      return matchesCategory && (!query || searchableText.includes(query));
    });
  }, [activeCategory, mediaItems, searchQuery]);

  const PageIcon = isPhotoPage ? Image : PlayCircle;

  return (
    <div className="app-shell-page">
      <Navbar session={session} />
      <main className="page-content">
        <section className="page-heading media-heading">
          <span className="eyebrow">
            <PageIcon size={17} />
            Galeri {isPhotoPage ? "Foto" : "Video"}
          </span>
          <h1>{isPhotoPage ? "Kenangan dalam setiap bingkai" : "Putar kembali momen terbaik"}</h1>
          <p>
            {isPhotoPage
              ? "Temukan dokumentasi perpisahan kelas 6 dari berbagai sudut pengambilan."
              : "Saksikan kembali suasana perpisahan kelas 6 SDN Wanasari 15 dalam bentuk video."}
          </p>
        </section>

        <section className="filter-panel">
          <div>
            <span className="filter-label">
              <Camera size={16} />
              Sumber Dokumentasi
            </span>
            <CategoryTabs activeCategory={activeCategory} onChange={setActiveCategory} />
          </div>
          <label className="search-box">
            <Search size={18} />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={`Cari ${isPhotoPage ? "foto" : "video"}...`}
            />
          </label>
        </section>

        <div className="result-summary">
          <strong>{filteredItems.length}</strong> {isPhotoPage ? "foto" : "video"} ditemukan
        </div>

        {errorMessage ? <div className="alert-error">{errorMessage}</div> : null}

        {loading ? (
          <div className="empty-state">Memuat {isPhotoPage ? "foto" : "video"}...</div>
        ) : filteredItems.length ? (
          <section className="media-grid">
            {filteredItems.map((media) => (
              <MediaCard key={media.id} media={media} onOpen={setLightboxMedia} />
            ))}
          </section>
        ) : (
          <div className="empty-state">
            <PageIcon size={34} />
            <h2>Belum ada {isPhotoPage ? "foto" : "video"}</h2>
            <p>Konten akan tampil di sini setelah ditambahkan melalui dashboard admin.</p>
          </div>
        )}
      </main>
      <Lightbox media={lightboxMedia} onClose={() => setLightboxMedia(null)} />
    </div>
  );
}
