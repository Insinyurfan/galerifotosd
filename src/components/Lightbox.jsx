import { useEffect, useState } from "react";
import { Download, ExternalLink, X } from "lucide-react";
import { getDownloadUrl, getDriveViewUrl, getImageCandidates, getVideoEmbedUrl } from "../lib/drive.js";

function isIOSDevice() {
  if (typeof navigator === "undefined") return false;

  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export default function Lightbox({ media, onClose }) {
  const isVideo = media?.type === "video";
  const usesIOSPlayer = isVideo && isIOSDevice();
  const imageCandidates = getImageCandidates(media?.drive_url || "");
  const videoEmbedUrl = getVideoEmbedUrl(media?.drive_url || "");
  const [imageIndex, setImageIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageIndex(0);
    setImageFailed(false);
  }, [media?.drive_url]);

  useEffect(() => {
    if (!media) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [media]);

  if (!media) return null;

  function handleImageError() {
    if (imageIndex < imageCandidates.length - 1) {
      setImageIndex((current) => current + 1);
      return;
    }

    setImageFailed(true);
  }

  return (
    <div
      className="media-lightbox-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={`media-lightbox ${isVideo ? "video-lightbox" : ""} ${usesIOSPlayer ? "ios-video-lightbox" : ""}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-md bg-white text-slate-900 shadow-soft transition hover:bg-blue-50"
          aria-label="Tutup lightbox"
          title="Tutup"
        >
          <X size={20} />
        </button>
        {isVideo ? (
          <div className="media-lightbox-player">
            {videoEmbedUrl ? (
              <iframe
                title={media.title}
                src={videoEmbedUrl}
                className="media-lightbox-frame"
                allow={
                  usesIOSPlayer
                    ? "autoplay; encrypted-media; picture-in-picture"
                    : "autoplay; encrypted-media; picture-in-picture; fullscreen"
                }
                allowFullScreen={!usesIOSPlayer}
                loading="eager"
              />
            ) : (
              <video src={media.drive_url} controls className="media-lightbox-frame bg-black object-contain" />
            )}
          </div>
        ) : imageFailed ? (
          <div className="grid min-h-[45vh] place-items-center rounded-lg bg-white px-5 text-center shadow-soft">
            <div>
              <p className="text-base font-bold text-slate-900">Preview gambar belum tersedia</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">File tetap bisa dibuka langsung lewat Google Drive.</p>
            </div>
          </div>
        ) : (
          <img
            src={imageCandidates[imageIndex]}
            alt={media.title}
            className="mx-auto max-h-[86vh] w-auto rounded-lg bg-white object-contain shadow-soft"
            onError={handleImageError}
          />
        )}
        <div className={`media-lightbox-details ${isVideo ? "video-lightbox-details" : ""}`}>
          {usesIOSPlayer ? (
            <p className="ios-player-notice">
              Video sudah dibuka dalam mode layar penuh website. Gunakan tombol putar tanpa menekan fullscreen player iPhone.
            </p>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-950">{media.title}</h2>
              {media.description ? <p className="mt-1 text-sm text-slate-600">{media.description}</p> : null}
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <a
                href={getDriveViewUrl(media.drive_url)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-blue-100 bg-white px-4 text-sm font-bold text-sapphire-700 transition hover:bg-blue-50"
              >
                <ExternalLink size={17} />
                Buka Drive
              </a>
              <a
                href={getDownloadUrl(media.drive_url)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-sapphire-700 px-4 text-sm font-bold text-white transition hover:bg-sapphire-800"
              >
                <Download size={17} />
                Download
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
