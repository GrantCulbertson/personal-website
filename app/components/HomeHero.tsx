"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomeHero() {
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);

  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-end pb-20 px-8 text-center${ready ? " page-ready" : ""}`}>
      <h1
        className="fade-up-hero font-semibold tracking-tight"
        style={{
          fontSize: "clamp(3rem, 8vw, 7rem)",
          color: "var(--cream)",
          lineHeight: 1.05,
          letterSpacing: "-0.03em",
          textShadow: "0 2px 24px rgba(30,34,54,0.4)",
          animationDelay: "0.2s",
        }}
      >
        Grant Culbertson
      </h1>
      <p
        className="fade-up-hero mt-4 text-lg font-light tracking-widest uppercase"
        style={{ color: "var(--periwinkle-light)", letterSpacing: "0.2em", animationDelay: "0.45s" }}
      >
        Data Analyst &nbsp;·&nbsp; Chicago
      </p>
      <div className="fade-up-hero flex gap-6 mt-8" style={{ animationDelay: "0.7s" }}>
        <Link
          href="/resume"
          className="px-6 py-3 text-sm font-medium rounded-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(30,34,54,0.32)]"
          style={{
            background: "var(--cream)",
            color: "var(--navy)",
            boxShadow: "0 4px 16px rgba(30,34,54,0.2)",
          }}
        >
          View Experience
        </Link>
        <Link
          href="/spotify"
          className="px-6 py-3 text-sm font-medium rounded-full border transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10"
          style={{
            borderColor: "rgba(232,223,206,0.6)",
            color: "var(--cream)",
          }}
        >
          What I&apos;m Listening To
        </Link>
      </div>
    </div>
  );
}
