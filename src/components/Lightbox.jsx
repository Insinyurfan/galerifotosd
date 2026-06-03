import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { getDownloadUrl, getImageCandidates } from "../lib/drive.js";

export default function Lightbox({ media, onClose }) {
  const imageCandidates = getImageCandidates(media?.drive_url || "");
  const [imageIndex, setImageIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageIndex(0);
    setImageFailed(false);
  }, [media?.drive_url]);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="relative max-h-full w-full max-w-6xl" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-md bg-white text-slate-900 shadow-soft transition hover:bg-blue-50"
          aria-label="Tutup lightbox"
          title="Tutup"
        >
          <X size={20} />
        </button>
        {imageFailed ? (
          <div className="grid min-h-[45vh] place-items-center rounded-lg bg-white px-5 text-center shadow-soft">
            <div>
              <p className="text-base font-bold text-slate-900">Preview gambar belum tersedia</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">File tetap bisa dibuka lewat tombol Download.</p>
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
        <div className="mt-3 rounded-lg bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-950">{media.title}</h2>
              {media.description ? <p className="mt-1 text-sm text-slate-600">{media.description}</p> : null}
            </div>
            <a
              href={getDownloadUrl(media.drive_url)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-sapphire-700 px-4 text-sm font-bold text-white transition hover:bg-sapphire-800"
            >
              <Download size={17} />
              Download
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
