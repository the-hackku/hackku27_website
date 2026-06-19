"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface Doodle {
  src: string;
  top: number;
  left: number;
  size: number;
  rotate: number;
  opacity: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateDoodles(images: string[]): Doodle[] {
  if (!images.length) return [];

  // Shuffle and take at most one of each image
  const pool = shuffle(images);
  const count = pool.length;

  const cols = Math.min(4, count);
  const rows = Math.ceil(count / cols);

  const topStart = 16, topEnd = 90;
  const leftStart = 2, leftEnd = 95;
  const cellH = (topEnd - topStart) / rows;
  const cellW = (leftEnd - leftStart) / cols;

  return pool.map((src, idx) => {
    const r = Math.floor(idx / cols);
    const c = idx % cols;
    const pad = 0.15;
    return {
      src,
      top:     topStart + cellH * (r + pad + Math.random() * (1 - pad * 2)),
      left:    leftStart + cellW * (c + pad + Math.random() * (1 - pad * 2)),
      size:    4 + Math.random() * 5,       // 4–9 vw
      rotate:  (Math.random() - 0.5) * 40,  // ±20 deg
      opacity: 0.40 + Math.random() * 0.12, // 0.10–0.22
    };
  });
}

export default function DoodleBackground({ images }: { images: string[] }) {
  const [doodles, setDoodles] = useState<Doodle[]>([]);

  useEffect(() => {
    setDoodles(generateDoodles(images));
  }, [images]);

  if (!doodles.length) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: -1,
        overflow: "hidden",
      }}
    >
      {doodles.map((d, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top:     `${d.top}vh`,
            left:    `${d.left}vw`,
            width:   `${d.size}vw`,
            opacity: d.opacity,
            transform: `rotate(${d.rotate}deg)`,
          }}
        >
          <Image
            src={d.src}
            alt=""
            width={200}
            height={200}
            style={{ width: "100%", height: "auto" }}
          />
        </div>
      ))}
    </div>
  );
}
