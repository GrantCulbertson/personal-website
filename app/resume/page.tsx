"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const SECTIONS = ["Experience", "Education", "Awards", "Skills"] as const;
type Section = (typeof SECTIONS)[number];

export default function ResumePage() {
  const [active, setActive] = useState<Section>("Experience");
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);

  const sectionRefs = useRef<Record<Section, HTMLElement | null>>({
    Experience: null,
    Education: null,
    Awards: null,
    Skills: null,
  });

  const scrollTo = (section: Section) => {
    setActive(section);
    sectionRefs.current[section]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Always lit — hero image is always behind the page
  const card: React.CSSProperties = {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
  };

  const textPrimary = "rgba(255,255,255,0.95)";
  const textSecondary = "rgba(255,255,255,0.65)";
  const textMuted = "rgba(255,255,255,0.4)";
  const divider = "rgba(255,255,255,0.1)";

  return (
    <>
      {/* Fixed blurred hero background */}
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{
          position: "absolute",
          inset: "-60px",
          backgroundImage: "url(/hero.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(24px) saturate(1.8) brightness(0.9)",
          transform: "scale(1.1)",
        }} />
        {/* Dark overlay so text stays readable */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(160deg, rgba(10,12,30,0.45) 0%, rgba(10,12,30,0.55) 100%)",
        }} />
      </div>

      <div
        className={`flex min-h-screen pt-16${ready ? " page-ready" : ""}`}
        style={{ position: "relative", zIndex: 1 }}
      >
        {/* Sticky sidebar */}
        <aside
          className="hidden lg:flex flex-col gap-1 sticky top-16 self-start pt-12 pl-10 pr-6"
          style={{ width: 220, minWidth: 220 }}
        >
          <p
            className="fade-up text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: textMuted, animationDelay: "0.15s" }}
          >
            Jump to
          </p>
          {SECTIONS.map((s, i) => (
            <button
              key={s}
              onClick={() => scrollTo(s)}
              className="fade-up text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
            style={{
              background: active === s ? "rgba(255,255,255,0.15)" : "transparent",
              color: active === s ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.5)",
              animationDelay: `${0.2 + i * 0.07}s`,
            }}
              onMouseEnter={e => {
                if (active !== s) e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              }}
              onMouseLeave={e => {
                if (active !== s) e.currentTarget.style.background = "transparent";
              }}
            >
              {s}
            </button>
          ))}

          <div className="mt-8 pt-8" style={{ borderTop: `1px solid ${divider}` }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: textMuted }}>Contact Me</p>
            <p className="text-xs" style={{ color: textMuted }}>culbertsongrant@gmail.com</p>
            <p className="text-xs mt-1" style={{ color: textMuted }}>614-477-7526</p>
            <a
              href="https://linkedin.com/in/grantculbertson"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs mt-1 block transition-colors"
              style={{ color: "rgba(255,255,255,0.5)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.9)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
            >
              linkedin.com/in/grantculbertson
            </a>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 px-6 lg:px-12 py-12 max-w-3xl">
          {/* Header */}
          <div className="mb-12">
            <h1
              className="fade-up font-semibold tracking-tight"
              style={{ fontSize: "2.5rem", color: textPrimary, lineHeight: 1.1, animationDelay: "0.05s" }}
            >
              Grant Culbertson
            </h1>
            <p className="fade-up mt-2 text-base" style={{ color: textSecondary, animationDelay: "0.12s" }}>
              Greater Chicago Area
            </p>
          </div>

          {/* Experience */}
          <Section
            id="Experience"
            title="Work Experience"
            ref={(el) => { sectionRefs.current["Experience"] = el; }}
            textMuted={textMuted}
            delay={0.2}
          >
            <JobEntry
              company="Surefoot"
              location="Remote"
              delay={0.28}
              card={card}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textMuted={textMuted}
              divider={divider}
              roles={[
                {
                  title: "Data Analyst",
                  period: "10/2025 – 3/2026",
                  bullets: [
                    "Led end-to-end A/B test preparation, monitoring, and results analysis across multiple client accounts, delivering data-driven recommendations.",
                    "Solely responsible for implementation and maintenance of 25+ company-wide process automations through N8N, streamlining internal workflows.",
                    "Built a custom internal reporting system for test monitoring and automated client reporting, replacing paid tools.",
                    "Identified gaps and automated numerous data quality checks, improving reliability of A/B test data reporting pipelines.",
                  ],
                },
                {
                  title: "Data Specialist",
                  period: "8/2024 – 10/2025",
                  bullets: [
                    "Brought on full-time following graduation from Kenyon College in May 2025.",
                  ],
                },
                {
                  title: "Data Analyst Intern",
                  period: "5/2024 – 8/2024",
                  bullets: [
                    "Independently developed and presented a custom Looker dashboard with a Shopify data pipeline to a $30M+ annual revenue client.",
                    "Optimized preexisting BigQuery data pulls to reduce automated daily query sizes by 70%.",
                  ],
                },
              ]}
            />
            <JobEntry
              company="Transamerica Agency Network"
              location="Columbus, OH"
              delay={0.38}
              card={card}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textMuted={textMuted}
              divider={divider}
              roles={[
                {
                  title: "Life Insurance Agent",
                  period: "5/2023 – 8/2023",
                  bullets: [
                    "Obtained Series 6 insurance license, passing the exam on the first attempt.",
                    "Learned adaptable customer service skills through a variety of difficult situations.",
                    "Handled direct sales as well as coverage and cost projections for expected client needs before meetings.",
                  ],
                },
              ]}
            />
            <JobEntry
              company="United Parcel Service"
              location="Columbus, OH"
              delay={0.46}
              card={card}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textMuted={textMuted}
              divider={divider}
              roles={[
                {
                  title: "Loader",
                  period: "6/2022 – 8/2022",
                  bullets: [
                    "Handled 1,000+ packages per day with precise attention to detail.",
                    "Learned to communicate with and be a part of a fast-moving, high-performance team.",
                    "Followed company guidelines and performed with an extremely low error rate.",
                  ],
                },
              ]}
            />
          </Section>

          {/* Education */}
          <Section
            id="Education"
            title="Education"
            ref={(el) => { sectionRefs.current["Education"] = el; }}
            textMuted={textMuted}
            delay={0.2}
          >
            <div className="fade-up rounded-2xl p-6" style={{ ...card, animationDelay: "0.28s" }}>
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-semibold text-base" style={{ color: textPrimary }}>
                    Kenyon College
                  </h3>
                  <p className="text-sm mt-0.5" style={{ color: textSecondary }}>Gambier, OH</p>
                </div>
                <span className="text-sm" style={{ color: textMuted }}>May 2025</span>
              </div>
              <p className="text-sm mt-3 font-medium" style={{ color: "rgba(168,180,216,0.95)" }}>
                Bachelor of Arts, Economics with Distinction, Cum Laude
              </p>
              <p className="text-sm mt-1" style={{ color: textMuted }}>
                Minors in Statistics &amp; Scientific Computing · GPA: 3.53
              </p>
              <div className="mt-4 space-y-2">
                <Detail label="Research" textSecondary={textSecondary} textMuted={textMuted}>
                  <RepoLink href="https://github.com/grantculbertson/NBA-Shot-Modeling">NBA Predictive Shot Modeling</RepoLink>,{" "}
                  <RepoLink href="https://github.com/grantculbertson/HubBucksSimulator">&ldquo;Hub Bucks&rdquo; Earning Simulator</RepoLink>,{" "}
                  <RepoLink href="https://drive.google.com/file/d/1gfHcRDqNMNrq3J2fk20K7hamTrYWMst9/view?usp=sharing">Incentivized Studying Research Proposal</RepoLink>,{" "}
                  <RepoLink href="https://github.com/grantculbertson/kenyon-car-connect">Kenyon Car Connect</RepoLink>.
                </Detail>
                <Detail label="Coursework" textSecondary={textSecondary} textMuted={textMuted}>
                  Intermediate Micro/Macroeconomics, Behavioral Public Policy, Econometrics, Statistical
                  Computing in R, Sports Statistics, Software Development &amp; Design.
                </Detail>
                <Detail label="Study Abroad" textSecondary={textSecondary} textMuted={textMuted}>
                  Copenhagen, Denmark at DIS — Fall 2023. Courses: Globalization and European Economies,
                  Urban Economics, Danish.
                </Detail>
              </div>
            </div>
          </Section>

          {/* Awards */}
          <Section
            id="Awards"
            title="Awards"
            ref={(el) => { sectionRefs.current["Awards"] = el; }}
            textMuted={textMuted}
            delay={0.2}
          >
            <div className="space-y-4">
              <AwardCard
                title="Wendell D. Lindstrom Memorial Prize"
                org="Kenyon College"
                description="Awarded to outstanding math and statistics students — 1 of 3 students selected campus-wide."
                card={card}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                textMuted={textMuted}
                delay={0.28}
              />
              <AwardCard
                title="Distinction on the Senior Economics Exercise"
                org="Kenyon College, Department of Economics"
                description="Awarded distinction on a two-sitting exam covering the full economics curriculum — 1 of 5 out of approximately 40 senior economics majors."
                card={card}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                textMuted={textMuted}
                delay={0.36}
              />
            </div>
          </Section>

          {/* Skills */}
          <Section
            id="Skills"
            title="Skills"
            ref={(el) => { sectionRefs.current["Skills"] = el; }}
            textMuted={textMuted}
            delay={0.2}
          >
            <div className="fade-up rounded-2xl p-6 space-y-4" style={{ ...card, animationDelay: "0.28s" }}>
              <SkillGroup
                label="Languages"
                items={["Python", "R", "SQL", "HTML", "JavaScript", "C++"]}
                textMuted={textMuted}
                textPrimary={textPrimary}
              />
              <SkillGroup
                label="Tools"
                items={["Google Looker Studio", "BigQuery", "Shopify", "Excel", "Google Analytics", "ClickUp", "N8N", "Claude", "ChatGPT"]}
                textMuted={textMuted}
                textPrimary={textPrimary}
              />
              <SkillGroup
                label="Methods"
                items={["Statistical Modeling", "Econometrics", "CRO", "A/B Testing", "Data Analysis", "Critical Thinking"]}
                textMuted={textMuted}
                textPrimary={textPrimary}
              />
            </div>
          </Section>
        </main>
      </div>
    </>
  );
}

/* ── Sub-components ── */

import { forwardRef } from "react";

const Section = forwardRef<
  HTMLElement,
  { id: string; title: string; children: React.ReactNode; textMuted: string; delay?: number }
>(function Section({ id, title, children, textMuted, delay = 0 }, ref) {
  return (
    <section id={id} ref={ref} className="mb-14 scroll-mt-20">
      <h2
        className="fade-up text-xs font-semibold uppercase tracking-widest mb-5"
        style={{ color: textMuted, animationDelay: `${delay}s` }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
});

interface Role { title: string; period: string; bullets: string[]; }

function JobEntry({
  company, location, roles, card, textPrimary, textSecondary, textMuted, divider, delay = 0,
}: {
  company: string; location: string; roles: Role[];
  card: React.CSSProperties;
  textPrimary: string; textSecondary: string; textMuted: string; divider: string;
  delay?: number;
}) {
  return (
    <div className="fade-up rounded-2xl p-6 mb-4" style={{ ...card, animationDelay: `${delay}s` }}>
      <div className="flex items-start justify-between flex-wrap gap-1 mb-4">
        <h3 className="font-semibold text-base" style={{ color: textPrimary }}>{company}</h3>
        <span className="text-sm" style={{ color: textMuted }}>{location}</span>
      </div>
      <div className="space-y-5">
        {roles.map((role, ri) => (
          <div key={role.title}>
            {ri > 0 && <div style={{ borderTop: `1px solid ${divider}`, marginBottom: "1.25rem" }} />}
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: textSecondary }}>{role.title}</span>
              <span className="text-xs" style={{ color: textMuted }}>{role.period}</span>
            </div>
            <ul className="space-y-1.5">
              {role.bullets.map((b, i) => (
                <li key={i} className="flex gap-3 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                  <span
                    className="flex-shrink-0 rounded-full"
                    style={{ width: 4, height: 4, background: "rgba(168,180,216,0.7)", marginTop: 8, flexShrink: 0 }}
                  />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function AwardCard({
  title, org, description, card, textPrimary, textSecondary, textMuted, delay = 0,
}: {
  title: string; org: string; description: string;
  card: React.CSSProperties;
  textPrimary: string; textSecondary: string; textMuted: string;
  delay?: number;
}) {
  return (
    <div className="fade-up rounded-2xl p-6" style={{ ...card, animationDelay: `${delay}s` }}>
      <h3 className="font-semibold text-sm" style={{ color: textSecondary }}>{title}</h3>
      <p className="text-xs mt-0.5" style={{ color: textMuted }}>{org}</p>
      <p className="text-sm mt-3" style={{ color: "rgba(255,255,255,0.7)" }}>{description}</p>
    </div>
  );
}

function Detail({
  label, children, textSecondary, textMuted,
}: {
  label: string; children: React.ReactNode; textSecondary: string; textMuted: string;
}) {
  return (
    <div className="flex gap-3 text-sm">
      <span className="font-medium flex-shrink-0 w-24" style={{ color: textSecondary }}>{label}</span>
      <span style={{ color: "rgba(255,255,255,0.65)" }}>{children}</span>
    </div>
  );
}

function RepoLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: "rgba(168,180,216,0.9)", textDecoration: "underline", textUnderlineOffset: "3px" }}
      onMouseEnter={e => (e.currentTarget.style.color = "rgba(200,210,240,1)")}
      onMouseLeave={e => (e.currentTarget.style.color = "rgba(168,180,216,0.9)")}
    >
      {children}
    </a>
  );
}

function SkillGroup({
  label, items, textMuted, textPrimary,
}: {
  label: string; items: string[]; textMuted: string; textPrimary: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: textMuted }}>
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="px-3 py-1 rounded-full text-xs font-medium transition-all duration-150"
            style={{
              background: "rgba(255,255,255,0.08)",
              color: textPrimary,
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
