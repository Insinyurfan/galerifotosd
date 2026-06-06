import { useEffect, useMemo, useState } from "react";
import { Clapperboard, Search } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import EditablePageHeading from "../components/EditablePageHeading.jsx";
import TikTokCard from "../components/TikTokCard.jsx";
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
        <EditablePageHeading
          session={session}
          fieldPrefix="tiktok"
          icon={Clapperboard}
          eyebrowClassName="tiktok-eyebrow"
          sectionClassName="media-heading"
        />

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
              <TikTokCard key={item.id} item={item} />
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
