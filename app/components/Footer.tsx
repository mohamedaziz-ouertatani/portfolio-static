import { site } from "@/lib/data/site";
import { navLinks } from "@/lib/data/nav";
import BackToTopLink from "./BackToTopLink";

const socialLinks = [
  { label: "LinkedIn", href: site.socials.linkedin },
  { label: "GitHub", href: site.socials.github },
  { label: "Portfolio", href: site.socials.livePortfolio },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <h3>{site.shortName}</h3>
          <p>
            Architecting production-oriented platforms bridging APIs and
            predictive analytics.
          </p>
          <p className="footer-contact">
            {site.phone}
            <br />
            {site.email}
          </p>
        </div>
        <div className="footer-links">
          <div className="link-column">
            <h4>Socials</h4>
            {socialLinks.map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label}
              </a>
            ))}
          </div>
          <div className="link-column">
            <h4>Navigation</h4>
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 {site.name}. All rights reserved.</p>
        <div className="footer-bottom-links">
          <BackToTopLink />
        </div>
      </div>
    </footer>
  );
}
