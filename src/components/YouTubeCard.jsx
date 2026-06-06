import { ExternalLink, PlayCircle } from "lucide-react";
import { getYouTubeEmbedUrl, getYouTubeWatchUrl } from "../lib/youtube.js";

export default function YouTubeCard({ video }) {
  const embedUrl = getYouTubeEmbedUrl(video.youtube_id);
  const watchUrl = getYouTubeWatchUrl(video.youtube_id);

  return (
    <article className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-soft">
      <div className="relative aspect-video bg-slate-100">
        {embedUrl ? (
          <iframe
            title={video.title}
            src={embedUrl}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <div className="grid h-full place-items-center px-5 text-center text-sm font-semibold text-slate-500">
            Video YouTube belum bisa ditampilkan.
          </div>
        )}
        <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-white/95 px-2.5 py-1 text-xs font-bold text-red-700 shadow-sm">
          <PlayCircle size={14} />
          YouTube
        </div>
      </div>

      <div className="space-y-3 p-4">
        <h3 className="line-clamp-2 text-base font-bold text-slate-950">{video.title}</h3>
        {video.description ? (
          <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">{video.description}</p>
        ) : (
          <p className="text-sm leading-6 text-slate-400">Tidak ada deskripsi.</p>
        )}
        <a
          href={watchUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-blue-100 bg-white px-4 text-sm font-bold text-sapphire-700 transition hover:bg-blue-50"
        >
          <ExternalLink size={17} />
          Buka YouTube
        </a>
      </div>
    </article>
  );
}
