import { certifications } from "@/lib/data/certifications";
import CertCard from "./CertCard";
import ScrollFadeIn from "./ScrollFadeIn";

export default function Certifications() {
  return (
    <ScrollFadeIn>
      <section className="certifications-section" id="credentials">
        <div className="cert-header">
          <div className="badge">
            <span className="dot" /> Credentials
          </div>
          <h2>Certified across the systems I actually build with.</h2>
        </div>
        <div className="cert-grid">
          {certifications.map((cert) => (
            <CertCard cert={cert} key={cert.index} />
          ))}
        </div>
      </section>
    </ScrollFadeIn>
  );
}
