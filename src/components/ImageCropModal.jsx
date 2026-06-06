import { useEffect, useRef, useState } from "react";
import { Check, Move, X, ZoomIn } from "lucide-react";

const PREVIEW_WIDTH = 600;

function clampOffset(image, canvas, scale, offset) {
  const width = image.width * scale;
  const height = image.height * scale;
  const maxX = Math.max(0, (width - canvas.width) / 2);
  const maxY = Math.max(0, (height - canvas.height) / 2);

  return {
    x: Math.max(-maxX, Math.min(maxX, offset.x)),
    y: Math.max(-maxY, Math.min(maxY, offset.y)),
  };
}

export default function ImageCropModal({
  file,
  aspectRatio = 1,
  title = "Atur Potongan Foto",
  outputName = "cropped-image.jpg",
  onCancel,
  onConfirm,
}) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const dragRef = useRef(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);

  const previewHeight = Math.round(PREVIEW_WIDTH / aspectRatio);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image?.complete || !image.naturalWidth) return;

    const context = canvas.getContext("2d");
    const baseScale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
    const scale = baseScale * zoom;
    const safeOffset = clampOffset(
      { width: image.naturalWidth, height: image.naturalHeight },
      canvas,
      scale,
      offset
    );

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#0f172a";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(
      image,
      canvas.width / 2 - (image.naturalWidth * scale) / 2 + safeOffset.x,
      canvas.height / 2 - (image.naturalHeight * scale) / 2 + safeOffset.y,
      image.naturalWidth * scale,
      image.naturalHeight * scale
    );
  }, [imageLoaded, imageUrl, offset, previewHeight, zoom]);

  function handleImageLoad() {
    setImageLoaded(true);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }

  function handlePointerDown(event) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offset,
    };
  }

  function handlePointerMove(event) {
    const drag = dragRef.current;
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !canvas || !image?.naturalWidth) return;

    const displayScale = canvas.width / canvas.getBoundingClientRect().width;
    const baseScale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
    const scale = baseScale * zoom;
    const nextOffset = {
      x: drag.offset.x + (event.clientX - drag.startX) * displayScale,
      y: drag.offset.y + (event.clientY - drag.startY) * displayScale,
    };
    setOffset(
      clampOffset(
        { width: image.naturalWidth, height: image.naturalHeight },
        canvas,
        scale,
        nextOffset
      )
    );
  }

  function handlePointerUp(event) {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  }

  function handleZoomChange(event) {
    const nextZoom = Number(event.target.value);
    const canvas = canvasRef.current;
    const image = imageRef.current;
    setZoom(nextZoom);

    if (canvas && image?.naturalWidth) {
      const baseScale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
      setOffset((current) => clampOffset(image, canvas, baseScale * nextZoom, current));
    }
  }

  async function handleConfirm() {
    const previewCanvas = canvasRef.current;
    if (!previewCanvas) return;

    setSaving(true);
    const outputWidth = aspectRatio === 1 ? 1000 : 960;
    const outputHeight = Math.round(outputWidth / aspectRatio);
    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = outputWidth;
    outputCanvas.height = outputHeight;
    outputCanvas.getContext("2d").drawImage(previewCanvas, 0, 0, outputWidth, outputHeight);

    const blob = await new Promise((resolve) => outputCanvas.toBlob(resolve, "image/jpeg", 0.9));
    if (blob) {
      await onConfirm(new File([blob], outputName, { type: "image/jpeg" }));
    }
    setSaving(false);
  }

  return (
    <div className="crop-modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <section className="crop-modal">
        <div className="crop-modal-heading">
          <div>
            <h2>{title}</h2>
            <p>Geser foto dengan mouse atau jari, lalu atur pembesarannya.</p>
          </div>
          <button type="button" onClick={onCancel} aria-label="Tutup editor foto">
            <X size={20} />
          </button>
        </div>

        <div className="crop-stage" style={{ aspectRatio }}>
          <img ref={imageRef} src={imageUrl} alt="" onLoad={handleImageLoad} hidden />
          <canvas
            ref={canvasRef}
            width={PREVIEW_WIDTH}
            height={previewHeight}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />
          <span className="crop-move-hint">
            <Move size={16} />
            Geser foto
          </span>
        </div>

        <label className="crop-zoom">
          <ZoomIn size={18} />
          <span>Perbesar</span>
          <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={handleZoomChange} />
          <strong>{Math.round(zoom * 100)}%</strong>
        </label>

        <div className="crop-actions">
          <button type="button" className="secondary-action" onClick={onCancel}>
            Batal
          </button>
          <button type="button" className="primary-action" onClick={handleConfirm} disabled={saving}>
            <Check size={18} />
            {saving ? "Memproses..." : "Gunakan Foto"}
          </button>
        </div>
      </section>
    </div>
  );
}
