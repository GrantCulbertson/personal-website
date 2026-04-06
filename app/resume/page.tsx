"use client";

import { useRef, useState } from "react";

const SECTIONS = ["Experience", "Education", "Awards", "Skills"] as const;
type Section = (typeof SECTIONS)[number];

export default function ResumePage() {
  const [active, setActive] = useState<Section>("Experience");

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

  return (
    <div
      className="flex min-h-screen pt-16"
      style={{ background: "var(--cream)" }}
    >
      {/* Sticky sidebar */}
      <aside
        className="hidden lg:flex flex-col gap-1 sticky top-16 self-start pt-12 pl-10 pr-6"
        style={{ width: 220, minWidth: 220 }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-4"
          style={{ color: "var(--muted)" }}
        >
          Jump to
        </p>
        {SECTIONS.map((s) => (
          <button
            key={s}
            onClick={() => scrollTo(s)}
            className="text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
            style={{
              background: active === s ? "var(--navy)" : "transparent",
              color: active === s ? "var(--cream)" : "var(--slate-blue)",
            }}
          >
            {s}
          </button>
        ))}

        <div className="mt-8 pt-8" style={{ borderTop: "1px solid var(--cream-dark)" }}>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            culbertsongrant@gmail.com
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
            614-477-7526
          </p>
          <a
            href="https://linkedin.com/in/grantculbertson"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs mt-1 block transition-colors"
            style={{ color: "var(--slate-blue)" }}
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
            className="font-semibold tracking-tight"
            style={{ fontSize: "2.5rem", color: "var(--dark)", lineHeight: 1.1 }}
          >
            Grant Culbertson
          </h1>
          <p className="mt-2 text-base" style={{ color: "var(--slate-blue)" }}>
            Greater Chicago Area
          </p>
        </div>

        {/* Experience */}
        <Section
          id="Experience"
          title="Work Experience"
          ref={(el) => { sectionRefs.current["Experience"] = el; }}
        >
          <JobEntry
            company="Surefoot"
            location="Remote"
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
        >
          <div
            className="rounded-2xl p-6"
            style={{ background: "white", border: "1px solid var(--cream-dark)" }}
          >
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-semibold text-base" style={{ color: "var(--dark)" }}>
                  Kenyon College
                </h3>
                <p className="text-sm mt-0.5" style={{ color: "var(--slate-blue)" }}>
                  Gambier, OH
                </p>
              </div>
              <span className="text-sm" style={{ color: "var(--muted)" }}>
                May 2025
              </span>
            </div>
            <p className="text-sm mt-3 font-medium" style={{ color: "var(--navy)" }}>
              Bachelor of Arts, Economics with Distinction, Cum Laude
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              Minors in Statistics &amp; Scientific Computing · GPA: 3.53
            </p>

            <div className="mt-4 space-y-2">
              <Detail label="Research">
                NBA Predictive Shot Modeling, &ldquo;Hub Bucks&rdquo; Earning Simulator, Incentivized Studying
                Research Proposal, Kenyon Car Connect.
              </Detail>
              <Detail label="Coursework">
                Intermediate Micro/Macroeconomics, Behavioral Public Policy, Econometrics, Statistical
                Computing in R, Sports Statistics, Software Development &amp; Design.
              </Detail>
              <Detail label="Study Abroad">
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
        >
          <div className="space-y-4">
            <AwardCard
              title="Wendell D. Lindstrom Memorial Prize"
              org="Kenyon College"
              description="Awarded to outstanding math and statistics students — 1 of 3 students selected campus-wide."
            />
            <AwardCard
              title="Distinction on the Senior Economics Exercise"
              org="Kenyon College, Department of Economics"
              description="Earned distinction on the senior thesis — 1 of 5 out of 40 economics majors."
            />
          </div>
        </Section>

        {/* Skills */}
        <Section
          id="Skills"
          title="Skills"
          ref={(el) => { sectionRefs.current["Skills"] = el; }}
        >
          <div
            className="rounded-2xl p-6 space-y-4"
            style={{ background: "white", border: "1px solid var(--cream-dark)" }}
          >
            <SkillGroup
              label="Languages"
              items={["Python", "R", "SQL", "HTML", "JavaScript", "C++"]}
            />
            <SkillGroup
              label="Tools"
              items={[
                "Google Looker Studio",
                "BigQuery",
                "Shopify",
                "Excel",
                "Google Analytics",
                "ClickUp",
                "N8N",
                "Claude",
                "ChatGPT",
              ]}
            />
            <SkillGroup
              label="Methods"
              items={[
                "Statistical Modeling",
                "Econometrics",
                "CRO",
                "A/B Testing",
                "Data Analysis",
                "Critical Thinking",
              ]}
            />
          </div>
        </Section>
      </main>
    </div>
  );
}

/* ── Sub-components ── */

import { forwardRef } from "react";

const Section = forwardRef<
  HTMLElement,
  { id: string; title: string; children: React.ReactNode }
>(function Section({ id, title, children }, ref) {
  return (
    <section
      id={id}
      ref={ref}
      className="mb-14 scroll-mt-20"
    >
      <h2
        className="text-xs font-semibold uppercase tracking-widest mb-5"
        style={{ color: "var(--muted)" }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
});

interface Role {
  title: string;
  period: string;
  bullets: string[];
}

function JobEntry({
  company,
  location,
  roles,
}: {
  company: string;
  location: string;
  roles: Role[];
}) {
  return (
    <div
      className="rounded-2xl p-6 mb-4"
      style={{ background: "white", border: "1px solid var(--cream-dark)" }}
    >
      <div className="flex items-start justify-between flex-wrap gap-1 mb-4">
        <h3 className="font-semibold text-base" style={{ color: "var(--dark)" }}>
          {company}
        </h3>
        <span className="text-sm" style={{ color: "var(--muted)" }}>
          {location}
        </span>
      </div>

      <div className="space-y-5">
        {roles.map((role) => (
          <div key={role.title}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: "var(--navy)" }}>
                {role.title}
              </span>
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                {role.period}
              </span>
            </div>
            <ul className="space-y-1.5">
              {role.bullets.map((b, i) => (
                <li key={i} className="flex gap-3 text-sm" style={{ color: "var(--dark)" }}>
                  <span
                    className="mt-2 flex-shrink-0 rounded-full"
                    style={{
                      width: 4,
                      height: 4,
                      background: "var(--periwinkle)",
                      marginTop: 8,
                    }}
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
  title,
  org,
  description,
}: {
  title: string;
  org: string;
  description: string;
}) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: "white", border: "1px solid var(--cream-dark)" }}
    >
      <h3 className="font-semibold text-sm" style={{ color: "var(--navy)" }}>
        {title}
      </h3>
      <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
        {org}
      </p>
      <p className="text-sm mt-3" style={{ color: "var(--dark)" }}>
        {description}
      </p>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 text-sm">
      <span className="font-medium flex-shrink-0 w-24" style={{ color: "var(--slate-blue)" }}>
        {label}
      </span>
      <span style={{ color: "var(--dark)" }}>{children}</span>
    </div>
  );
}

function SkillGroup({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              background: "var(--cream)",
              color: "var(--navy)",
              border: "1px solid var(--cream-dark)",
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
