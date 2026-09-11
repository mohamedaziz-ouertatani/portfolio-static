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
    // href may be a bare in-page anchor ("#about") or a route-qualified
    // one ("/#about", so the link also works from other routes) — pull
    // out just the "#about" hash to look up the target element.
    // document.querySelector returns null when the target isn't on the
    // current page (e.g. "#about" while on /projects), which is the
    // correct no-op case here.
    const hashIndex = href.indexOf("#");
    if (hashIndex === -1) return;
    const hash = href.slice(hashIndex);
    const target = document.querySelector(hash);
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
