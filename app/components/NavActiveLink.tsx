"use client";

export default function NavActiveLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return <a href={href}>{label}</a>;
}
