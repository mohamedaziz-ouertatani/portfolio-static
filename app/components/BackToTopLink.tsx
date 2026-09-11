"use client";

export default function BackToTopLink() {
  return (
    <a
      href="#top"
      onClick={(e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      Back to top &uarr;
    </a>
  );
}
