import Link from "next/link";
import { navLinks } from "@/lib/data/nav";
import { site } from "@/lib/data/site";
import NavActiveLink from "./NavActiveLink";

export default function Nav() {
  return (
    <nav>
      <Link href="/" className="logo">
        {site.shortName}
      </Link>
      <div className="nav-links">
        {navLinks.map((link) => (
          <NavActiveLink key={link.href} href={link.href} label={link.label} />
        ))}
      </div>
      <Link href="/#contact" className="btn">
        Get in touch <span className="icon">↗</span>
      </Link>
    </nav>
  );
}
