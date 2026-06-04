import { useEffect, useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ArrowUpRight, Download } from "lucide-react";

export interface LightboxImage {
  src: string;
  alt: string;
  label?: string;
}

interface LightboxProps {
  images: LightboxImage[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (i: number) => void;
}

export function Lightbox({ images, index, onClose, onIndexChange }: LightboxProps) {
  const open = index !== null && index >= 0 && index < images.length;
  const [loaded, setLoaded] = useState(false);

  const next = useCallback(() => {
    if (index === null) return;
    onIndexChange((index + 1) % images.length);
  }, [index, images.length, onIndexChange]);

  const prev = useCallback(() => {
    if (index === null) return;
    onIndexChange((index - 1 + images.length) % images.length);
  }, [index, images.length, onIndexChange]);

  useEffect(() => {
    if (!open) return;
    setLoaded(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, next, prev, onClose, index]);

  if (!open) return null;
  const img = images[index!];

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={img.alt}
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex min-w-0 items-center gap-3 text-white/80">
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium">
            {index! + 1} / {images.length}
          </span>
          {img.label && (
            <span className="truncate text-sm font-medium">{img.label}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <a
            href={img.src}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
            title="Open original"
          >
            <ArrowUpRight className="h-3.5 w-3.5" /> Open
          </a>
          <a
            href={img.src}
            download
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
            title="Download"
          >
            <Download className="h-3.5 w-3.5" /> Save
          </a>
          <button
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Image stage */}
      <div className="relative flex flex-1 items-center justify-center px-2 sm:px-12">
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Previous image"
            className="absolute left-2 sm:left-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        <div
          className="relative flex max-h-full max-w-full items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            </div>
          )}
          <img
            key={img.src}
            src={img.src}
            alt={img.alt}
            onLoad={() => setLoaded(true)}
            className="max-h-[78vh] max-w-[92vw] rounded-xl object-contain shadow-2xl transition-opacity duration-300"
            style={{ opacity: loaded ? 1 : 0 }}
          />
        </div>

        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Next image"
            className="absolute right-2 sm:right-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div
          className="flex items-center justify-center gap-2 px-4 py-4"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((im, i) => (
            <button
              key={im.src + i}
              onClick={() => onIndexChange(i)}
              aria-label={`Show image ${i + 1}`}
              className={`relative h-14 w-20 overflow-hidden rounded-md border transition ${
                i === index
                  ? "border-white shadow-lg"
                  : "border-white/20 opacity-60 hover:opacity-100"
              }`}
            >
              <img src={im.src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
