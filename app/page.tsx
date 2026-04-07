import Image from "next/image";
import FloatingGallery from "./components/FloatingGallery";
import HomeHero from "./components/HomeHero";

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
        <HomeHero />
      </section>

      {/* Floating gallery section */}
      <section
        className="relative w-full"
        style={{
          minHeight: 700,
          background: "var(--cream)",
          paddingBottom: "4rem",
        }}
      >
        {/* Section header */}
        <div className="relative pt-16 pb-4 px-8 text-center" style={{ zIndex: 20 }}>
          <h2
            className="font-semibold tracking-tight"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              color: "var(--navy)",
              lineHeight: 1.1,
            }}
          >
            what I&apos;ve been up to
          </h2>
          <p
            className="mt-2 text-sm tracking-widest uppercase"
            style={{ color: "var(--muted)" }}
          >
            Drag the photos around
          </p>
        </div>

        {/* Gallery canvas */}
        <div className="relative" style={{ height: 600 }}>
          <FloatingGallery />
        </div>
      </section>
    </main>
  );
}
