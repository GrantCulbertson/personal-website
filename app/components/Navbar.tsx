"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/resume", label: "Experience" },
  { href: "/spotify", label: "Listening" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
      style={{
        background: "rgba(232, 223, 206, 0.75)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(139, 155, 200, 0.2)",
      }}
    >
      <Link
        href="/"
        className="text-lg font-semibold tracking-tight"
        style={{ color: "var(--navy)" }}
      >
        GC
      </Link>

      <div className="flex items-center gap-8">
        {links.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium transition-colors duration-150"
              style={{
                color: active ? "var(--navy)" : "var(--slate-blue)",
                borderBottom: active
                  ? "2px solid var(--navy)"
                  : "2px solid transparent",
                paddingBottom: "2px",
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
