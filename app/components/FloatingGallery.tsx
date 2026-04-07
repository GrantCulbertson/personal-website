"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

interface Photo {
  id: string;
  name: string;
  src: string;
}

// Scatter positions/rotations are derived deterministically from index
const LAYOUTS = [
  { initialX: 4,  initialY: 8,  rotate: -3, width: 240, height: 180 },
  { initialX: 62, initialY: 5,  rotate:  4, width: 200, height: 160 },
  { initialX: 78, initialY: 52, rotate: -2, width: 220, height: 175 },
  { initialX: 2,  initialY: 58, rotate:  5, width: 210, height: 165 },
  { initialX: 35, initialY: 70, rotate: -4, width: 190, height: 150 },
  { initialX: 50, initialY: 30, rotate:  3, width: 230, height: 170 },
  { initialX: 18, initialY: 35, rotate: -5, width: 200, height: 155 },
  { initialX: 70, initialY: 22, rotate:  2, width: 215, height: 165 },
];

interface CardPos { x: number; y: number; }

const DRAG_THRESHOLD = 5;

export default function FloatingGallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [positions, setPositions] = useState<CardPos[]>([]);
  const [zIndices, setZIndices] = useState<number[]>([]);
  const [topZ, setTopZ] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((data: Photo[]) => {
        setPhotos(data);
        setPositions(data.map(() => ({ x: 0, y: 0 })));
        setZIndices(data.map((_, i) => i + 1));
        setTopZ(data.length);
      })
      .finally(() => setLoading(false));
  }, []);

  const dragRef = useRef<{
    active: boolean;
    index: number;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    moved: boolean;
  } | null>(null);

  const bringToFront = useCallback((index: number) => {
    const next = topZ + 1;
    setTopZ(next);
    setZIndices((prev) => {
      const updated = [...prev];
      updated[index] = next;
      return updated;
    });
  }, [topZ]);

  const onMouseDown = useCallback((e: React.MouseEvent, index: number) => {
    e.preventDefault();
    bringToFront(index);
    dragRef.current = {
      active: true,
      index,
      startX: e.clientX,
      startY: e.clientY,
      origX: positions[index].x,
      origY: positions[index].y,
      moved: false,
    };

    const onMouseMove = (e: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag?.active) return;
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      if (!drag.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD) drag.moved = true;
      if (drag.moved) {
        setPositions((prev) => {
          const updated = [...prev];
          updated[drag.index] = { x: drag.origX + dx, y: drag.origY + dy };
          return updated;
        });
      }
    };

    const onMouseUp = () => {
      const drag = dragRef.current;
      if (drag && !drag.moved) setLightbox(drag.index);
      dragRef.current = null;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, [positions, bringToFront]);

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-sm" style={{ color: "var(--muted)" }}>Loading photos…</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return null;
  }

  return (
    <>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {photos.map((photo, i) => {
          const layout = LAYOUTS[i % LAYOUTS.length];
          return (
            <div
              key={photo.id}
              className="photo-card absolute pointer-events-auto"
              style={{
                left: `${layout.initialX}%`,
                top: `${layout.initialY}%`,
                transform: `translate(${positions[i]?.x ?? 0}px, ${positions[i]?.y ?? 0}px) rotate(${layout.rotate}deg)`,
                zIndex: zIndices[i] ?? i + 1,
                background: "white",
                padding: "10px 10px 32px 10px",
                boxShadow: "0 8px 32px rgba(30, 34, 54, 0.18)",
                borderRadius: "2px",
              }}
              onMouseDown={(e) => onMouseDown(e, i)}
            >
              <div style={{ width: layout.width, height: layout.height, overflow: "hidden", position: "relative" }}>
                <Image
                  src={photo.src}
                  alt={photo.name}
                  fill
                  style={{ objectFit: "cover" }}
                  draggable={false}
                  sizes={`${layout.width}px`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {lightbox !== null && (
        <Lightbox
          index={lightbox}
          total={photos.length}
          photos={photos}
          layouts={LAYOUTS}
          onClose={() => setLightbox(null)}
          onChange={setLightbox}
        />
      )}
    </>
  );
}

function Lightbox({
  index, total, photos, onClose, onChange,
}: {
  index: number;
  total: number;
  photos: Photo[];
  layouts: typeof LAYOUTS;
  onClose: () => void;
  onChange: (i: number) => void;
}) {
  const prev = () => onChange((index - 1 + total) % total);
  const next = () => onChange((index + 1) % total);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index]);

  const photo = photos[index];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 9999, background: "rgba(10,12,30,0.88)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: "absolute", top: 24, right: 28,
          background: "rgba(255,255,255,0.1)", border: "none",
          color: "white", width: 40, height: 40, borderRadius: "50%",
          cursor: "pointer", fontSize: 20, display: "flex",
          alignItems: "center", justifyContent: "center",
          transition: "background 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
        onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
      >
        ×
      </button>

      {/* Prev */}
      <button
        onClick={(e) => { e.stopPropagation(); prev(); }}
        aria-label="Previous photo"
        style={{
          position: "absolute", left: 24,
          background: "rgba(255,255,255,0.1)", border: "none",
          color: "white", width: 48, height: 48, borderRadius: "50%",
          cursor: "pointer", fontSize: 22, display: "flex",
          alignItems: "center", justifyContent: "center",
          transition: "background 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
        onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
      >
        ‹
      </button>

      {/* Photo */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          padding: "12px 12px 48px 12px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
          borderRadius: "2px",
          position: "relative",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.src}
          alt={photo.name}
          style={{
            display: "block",
            maxWidth: "min(70vw, 720px)",
            maxHeight: "min(55vh, 500px)",
            width: "auto",
            height: "auto",
          }}
        />
        <p style={{
          position: "absolute", bottom: 14, left: 0, right: 0,
          textAlign: "center", fontSize: 12,
          color: "var(--muted)", fontFamily: "inherit",
        }}>
          {index + 1} / {total}
        </p>
      </div>

      {/* Next */}
      <button
        onClick={(e) => { e.stopPropagation(); next(); }}
        aria-label="Next photo"
        style={{
          position: "absolute", right: 24,
          background: "rgba(255,255,255,0.1)", border: "none",
          color: "white", width: 48, height: 48, borderRadius: "50%",
          cursor: "pointer", fontSize: 22, display: "flex",
          alignItems: "center", justifyContent: "center",
          transition: "background 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
        onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
      >
        ›
      </button>

      {/* Dot indicators */}
      <div style={{ position: "absolute", bottom: 28, display: "flex", gap: 8 }}>
        {photos.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); onChange(i); }}
            aria-label={`Go to photo ${i + 1}`}
            style={{
              width: i === index ? 20 : 8, height: 8,
              borderRadius: 4, border: "none", cursor: "pointer",
              background: i === index ? "white" : "rgba(255,255,255,0.35)",
              transition: "all 0.2s ease",
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
