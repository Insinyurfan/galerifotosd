import { useEffect, useState } from "react";
import { Download, ExternalLink, Image, PlayCircle } from "lucide-react";
import { getDownloadUrl, getDriveViewUrl, getImageCandidates, getVideoEmbedUrl } from "../lib/drive.js";

export default function MediaCard({ media, onOpen }) {
  const isImage = media.type === "image";
  const imageCandidates = getImageCandidates(media.drive_url);
  const [imageIndex, setImageIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const videoEmbedUrl = getVideoEmbedUrl(media.drive_url);
  const downloadUrl = getDownloadUrl(media.drive_url);
  const driveViewUrl = getDriveViewUrl(media.drive_url);

  useEffect(() => {
    setImageIndex(0);
    setImageFailed(false);
  }, [media.drive_url]);

  function handleImageError() {
    if (imageIndex < imageCandidates.length - 1) {
      setImageIndex((current) => current + 1);
      return;
    }

    setImageFailed(true);
  }

  return (
    <article className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-soft">
      <div className="relative aspect-[4/3] bg-slate-100">
        {isImage ? (
          <button type="button" className="h-full w-full" onClick={() => onOpen(media)}>
            {imageFailed ? (
              <div className="grid h-full w-full place-items-center bg-slate-100 px-5 text-center">
                <div>
                  <Image className="mx-auto text-slate-400" size={34} />
                  <p className="mt-3 text-sm font-semibold text-slate-600">Preview belum tersedia</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">File tetap bisa dibuka lewat tombol Drive.</p>
                </div>
              </div>
            ) : (
              <img
                src={imageCandidates[imageIndex]}
                alt={media.title}
                className="h-full w-full object-cover"
                loading="lazy"
                onError={handleImageError}
              />
            )}
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
        <div className="grid gap-2 sm:grid-cols-2">
          <a
            href={driveViewUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-blue-100 bg-white px-4 text-sm font-bold text-sapphire-700 transition hover:bg-blue-50"
          >
            <ExternalLink size={17} />
            Buka Drive
          </a>
          <a
            href={downloadUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-sapphire-700 px-4 text-sm font-bold text-white transition hover:bg-sapphire-800"
          >
            <Download size={17} />
            Download
          </a>
        </div>
      </div>
    </article>
  );
}
