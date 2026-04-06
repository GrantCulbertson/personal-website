import Image from "next/image";
import Link from "next/link";
import FloatingGallery from "./components/FloatingGallery";

export default function Home() {
  return (
    <main className="flex flex-col">
      {/* Hero section — full viewport with photo overlay */}
      <section className="relative w-full" style={{ height: "100vh", minHeight: 600 }}>
        {/* Hero background image */}
        <Image
          src="/hero.jpg"
          alt="Grant Culbertson"
          fill
          priority
          style={{ objectFit: "cover", objectPosition: "center" }}
          sizes="100vw"
        />

        {/* Dark overlay for text legibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(30,34,54,0.15) 0%, rgba(30,34,54,0.45) 60%, rgba(30,34,54,0.75) 100%)",
          }}
        />

        {/* Hero text */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-20 px-8 text-center">
          <h1
            className="font-semibold tracking-tight"
            style={{
              fontSize: "clamp(3rem, 8vw, 7rem)",
              color: "var(--cream)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              textShadow: "0 2px 24px rgba(30,34,54,0.4)",
            }}
          >
            Grant Culbertson
          </h1>
          <p
            className="mt-4 text-lg font-light tracking-widest uppercase"
            style={{ color: "var(--periwinkle-light)", letterSpacing: "0.2em" }}
          >
            Data Analyst &nbsp;·&nbsp; Chicago
          </p>

          <div className="flex gap-6 mt-8">
            <Link
              href="/resume"
              className="px-6 py-3 text-sm font-medium rounded-full transition-all duration-200"
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
              className="px-6 py-3 text-sm font-medium rounded-full border transition-all duration-200"
              style={{
                borderColor: "rgba(232,223,206,0.6)",
                color: "var(--cream)",
              }}
            >
              What I&apos;m Listening To
            </Link>
          </div>
        </div>
      </section>

      {/* Floating gallery section */}
      <section
        className="relative w-full"
        style={{
          height: "100vh",
          minHeight: 700,
          background: "var(--cream)",
        }}
      >
        {/* Title overlay */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ zIndex: 10 }}
        >
          <h2
            className="font-semibold select-none"
            style={{
              fontSize: "clamp(4rem, 12vw, 11rem)",
              color: "rgba(58, 67, 105, 0.08)",
              lineHeight: 1,
              letterSpacing: "-0.04em",
              userSelect: "none",
            }}
          >
            GRANT
          </h2>
          <h2
            className="font-semibold select-none"
            style={{
              fontSize: "clamp(4rem, 12vw, 11rem)",
              color: "rgba(58, 67, 105, 0.08)",
              lineHeight: 1,
              letterSpacing: "-0.04em",
              userSelect: "none",
            }}
          >
            CULBERTSON
          </h2>
          <p
            className="mt-6 text-sm tracking-widest uppercase"
            style={{ color: "var(--muted)" }}
          >
            Drag the photos around
          </p>
        </div>

        <FloatingGallery />
      </section>
    </main>
  );
}
