"use client";

import { useEffect, useState } from "react";

export default function NavActiveLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!href.startsWith("#")) return;
    const target = document.querySelector(href);
    if (!target || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(true);
          else setActive(false);
        });
      },
      { rootMargin: "-40% 0px -50% 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [href]);

  return (
    <a href={href} className={active ? "active" : ""}>
      {label}
    </a>
  );
}
