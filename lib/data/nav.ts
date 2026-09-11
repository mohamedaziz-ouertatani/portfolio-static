export interface NavLink {
  label: string;
  href: string;
}

/** Shared between the header nav and the footer's "Navigation" column. */
export const navLinks: NavLink[] = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "/projects" },
];
