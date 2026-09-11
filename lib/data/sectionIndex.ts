export interface SectionIndexItem {
  num: string;
  label: string;
  href: string;
}

/** Left-edge scroll-spy navigator for the home page's major sections. */
export const sectionIndexItems: SectionIndexItem[] = [
  { num: "01", label: "Intro", href: "#hero" },
  { num: "02", label: "Experience", href: "#experience" },
  { num: "03", label: "About", href: "#about" },
  { num: "04", label: "Stack", href: "#stack" },
  { num: "05", label: "Contact", href: "#contact" },
  { num: "06", label: "Credentials", href: "#credentials" },
];
