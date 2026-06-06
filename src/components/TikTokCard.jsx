import { Clapperboard, ExternalLink } from "lucide-react";
import { getTikTokEmbedUrl } from "../lib/tiktok.js";

export default function TikTokCard({ item }) {
  const embedUrl = getTikTokEmbedUrl(item.tiktok_url);

  return (
    <article className="tiktok-card">
      {embedUrl ? (
        <div className="tiktok-embed-wrap">
          <iframe
            src={embedUrl}
            title={item.title}
            allow="fullscreen; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      ) : (
        <div className="tiktok-card-visual">
          <Clapperboard size={46} />
          <span>Preview membutuhkan link video TikTok lengkap</span>
        </div>
      )}

      <div className="tiktok-card-content">
        <h2>{item.title}</h2>
        <p>{item.description || "Tonton video selengkapnya langsung di TikTok."}</p>
        <a href={item.tiktok_url} target="_blank" rel="noreferrer">
          Buka TikTok <ExternalLink size={17} />
        </a>
      </div>
    </article>
  );
}
