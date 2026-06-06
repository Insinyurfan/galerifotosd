import { useEffect, useMemo, useState } from "react";
import { Clapperboard, ExternalLink, Search } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import { useSession } from "../hooks/useSession.js";
import { supabase } from "../lib/supabase.js";

export default function TikTokPage() {
  const session = useSession();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchItems() {
      const { data, error } = await supabase.from("tiktok_gallery").select("*").order("created_at", { ascending: false });
      if (error) setErrorMessage(error.message);
      else setItems(data || []);
      setLoading(false);
    }
    fetchItems();
  }, []);

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => `${item.title} ${item.description || ""}`.toLowerCase().includes(normalizedQuery));
  }, [items, query]);

  return (
    <div className="app-shell-page">
      <Navbar session={session} />
      <main className="page-content">
        <section className="page-heading media-heading">
          <span className="eyebrow tiktok-eyebrow">
            <Clapperboard size={17} />
            Galeri TikTok
          </span>
          <h1>Video singkat, kenangan yang melekat</h1>
          <p>Kumpulan video TikTok perpisahan kelas 6 yang ditambahkan langsung melalui dashboard admin.</p>
        </section>

        <section className="filter-panel single-filter">
          <label className="search-box">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari video TikTok..." />
          </label>
        </section>

        {errorMessage ? <div className="alert-error">{errorMessage}</div> : null}
        {loading ? (
          <div className="empty-state">Memuat video TikTok...</div>
        ) : visibleItems.length ? (
          <section className="tiktok-grid">
            {visibleItems.map((item) => (
              <article key={item.id} className="tiktok-card">
                <div className="tiktok-card-visual">
                  <Clapperboard size={46} />
                  <span>TikTok</span>
                </div>
                <div className="tiktok-card-content">
                  <h2>{item.title}</h2>
                  <p>{item.description || "Tonton video selengkapnya langsung di TikTok."}</p>
                  <a href={item.tiktok_url} target="_blank" rel="noreferrer">
                    Buka TikTok <ExternalLink size={17} />
                  </a>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="empty-state">
            <Clapperboard size={34} />
            <h2>Belum ada video TikTok</h2>
            <p>Admin dapat menambahkan tautan video melalui menu Kelola TikTok.</p>
          </div>
        )}
      </main>
    </div>
  );
}
