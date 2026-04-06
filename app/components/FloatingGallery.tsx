"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";

interface Photo {
  src: string;
  alt: string;
  initialX: number;
  initialY: number;
  rotate: number;
  width: number;
  height: number;
}

const PHOTOS: Photo[] = [
  { src: "/hero.jpg", alt: "Grant", initialX: 4, initialY: 8, rotate: -3, width: 240, height: 180 },
  { src: "/hero.jpg", alt: "Photo 2", initialX: 62, initialY: 5, rotate: 4, width: 200, height: 160 },
  { src: "/hero.jpg", alt: "Photo 3", initialX: 78, initialY: 52, rotate: -2, width: 220, height: 175 },
  { src: "/hero.jpg", alt: "Photo 4", initialX: 2, initialY: 58, rotate: 5, width: 210, height: 165 },
  { src: "/hero.jpg", alt: "Photo 5", initialX: 35, initialY: 70, rotate: -4, width: 190, height: 150 },
];

interface CardPos {
  x: number;
  y: number;
}

export default function FloatingGallery() {
  const [positions, setPositions] = useState<CardPos[]>(
    PHOTOS.map((p) => ({ x: 0, y: 0 }))
  );
  const [zIndices, setZIndices] = useState<number[]>(PHOTOS.map((_, i) => i + 1));
  const [topZ, setTopZ] = useState(PHOTOS.length);
  const dragRef = useRef<{
    active: boolean;
    index: number;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const bringToFront = useCallback(
    (index: number) => {
      const next = topZ + 1;
      setTopZ(next);
      setZIndices((prev) => {
        const updated = [...prev];
        updated[index] = next;
        return updated;
      });
    },
    [topZ]
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent, index: number) => {
      e.preventDefault();
      bringToFront(index);
      dragRef.current = {
        active: true,
        index,
        startX: e.clientX,
        startY: e.clientY,
        origX: positions[index].x,
        origY: positions[index].y,
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!dragRef.current?.active) return;
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        setPositions((prev) => {
          const updated = [...prev];
          updated[dragRef.current!.index] = {
            x: dragRef.current!.origX + dx,
            y: dragRef.current!.origY + dy,
          };
          return updated;
        });
      };

      const onMouseUp = () => {
        dragRef.current = null;
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [positions, bringToFront]
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {PHOTOS.map((photo, i) => (
        <div
          key={i}
          className="photo-card absolute pointer-events-auto"
          style={{
            left: `${photo.initialX}%`,
            top: `${photo.initialY}%`,
            transform: `translate(${positions[i].x}px, ${positions[i].y}px) rotate(${photo.rotate}deg)`,
            zIndex: zIndices[i],
            background: "white",
            padding: "10px 10px 32px 10px",
            boxShadow: "0 8px 32px rgba(30, 34, 54, 0.18)",
            borderRadius: "2px",
          }}
          onMouseDown={(e) => onMouseDown(e, i)}
        >
          <div
            style={{
              width: photo.width,
              height: photo.height,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              style={{ objectFit: "cover" }}
              draggable={false}
              sizes={`${photo.width}px`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
