export interface NavLink {
  label: string;
  href: string;
}

/**
 * Shared between the header nav and the footer's "Navigation" column.
 * The in-page anchors are qualified with the home route ("/#about", not
 * "#about") because Nav/Footer render on every route — a bare "#about"
 * clicked from /projects tries to scroll to an element on the current
 * page, finds nothing, and silently does nothing.
 */
export const navLinks: NavLink[] = [
  { label: "About", href: "/#about" },
  { label: "Skills", href: "/#skills" },
  { label: "Experience", href: "/#experience" },
  { label: "Projects", href: "/projects" },
];
