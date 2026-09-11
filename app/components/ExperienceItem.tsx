import type { ExperienceRole } from "@/lib/data/experience";

export default function ExperienceItem({ role }: { role: ExperienceRole }) {
  return (
    <div className="exp-item">
      <div className="exp-meta">
        <div className="exp-role-company">
          <span className="exp-role">{role.role}</span>
          <span className="exp-company">{role.company}</span>
        </div>
        <span className="exp-date">{role.dates}</span>
      </div>
      <ul className="exp-bullets">
        {role.bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
      <div className="exp-tags">
        {role.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </div>
  );
}
