"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { sectionIndexItems } from "@/lib/data/sectionIndex";

export default function SectionIndex() {
  const [mounted, setMounted] = useState(false);
  const [activeHref, setActiveHref] = useState(sectionIndexItems[0].href);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!("IntersectionObserver" in window)) return;

    const sections = sectionIndexItems
      .map((item) => ({
        href: item.href,
        el: document.querySelector(item.href),
      }))
      .filter((s): s is { href: string; el: Element } => s.el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const match = sections.find((s) => s.el === entry.target);
            if (match) setActiveHref(match.href);
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px" },
    );

    sections.forEach((s) => observer.observe(s.el));
    return () => observer.disconnect();
  }, [mounted]);

  if (!mounted) return null;

  return createPortal(
    <nav className="section-index" aria-label="Section navigator">
      {sectionIndexItems.map((item) => {
        const active = item.href === activeHref;
        return (
          <a
            key={item.href}
            href={item.href}
            className={`section-index-item${active ? " active" : ""}`}
          >
            <span className="line" />
            <span className="num">{item.num}</span>
            <span className="label">{item.label}</span>
          </a>
        );
      })}
    </nav>,
    document.body,
  );
}
