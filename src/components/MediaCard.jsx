import { Download, Image, PlayCircle } from "lucide-react";
import { getDownloadUrl, getImageUrl, getVideoEmbedUrl } from "../lib/drive.js";

export default function MediaCard({ media, onOpen }) {
  const isImage = media.type === "image";
  const imageUrl = getImageUrl(media.drive_url);
  const videoEmbedUrl = getVideoEmbedUrl(media.drive_url);
  const downloadUrl = getDownloadUrl(media.drive_url);

  return (
    <article className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-soft">
      <div className="relative aspect-[4/3] bg-slate-100">
        {isImage ? (
          <button type="button" className="h-full w-full" onClick={() => onOpen(media)}>
            <img src={imageUrl} alt={media.title} className="h-full w-full object-cover" loading="lazy" />
          </button>
        ) : videoEmbedUrl ? (
          <iframe
            title={media.title}
            src={videoEmbedUrl}
            className="h-full w-full"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <video src={media.drive_url} controls className="h-full w-full object-cover" />
        )}

        <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-white/95 px-2.5 py-1 text-xs font-bold text-sapphire-800 shadow-sm">
          {isImage ? <Image size={14} /> : <PlayCircle size={14} />}
          {isImage ? "Foto" : "Video"}
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="min-w-0 truncate text-base font-bold text-slate-950">{media.title}</h3>
          <span className="shrink-0 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-sapphire-700">
            {media.folder_category}
          </span>
        </div>
        {media.description ? (
          <p className="line-clamp-2 text-sm leading-6 text-slate-600">{media.description}</p>
        ) : (
          <p className="text-sm leading-6 text-slate-400">Tidak ada deskripsi.</p>
        )}
        <a
          href={downloadUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-sapphire-700 px-4 text-sm font-bold text-white transition hover:bg-sapphire-800"
        >
          <Download size={17} />
          Download
        </a>
      </div>
    </article>
  );
}
