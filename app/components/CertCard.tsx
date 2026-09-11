import type { Certification } from "@/lib/data/certifications";

export default function CertCard({ cert }: { cert: Certification }) {
  return (
    <div className="cert-card">
      <span className="cert-index">{cert.index}</span>
      <h4>{cert.title}</h4>
      <p>{cert.issuer}</p>
    </div>
  );
}
