import { experienceRoles } from "@/lib/data/experience";
import ExperienceItem from "./ExperienceItem";
import ScrollFadeIn from "./ScrollFadeIn";

export default function Experience() {
  return (
    <ScrollFadeIn className="experience-section-wrapper">
      <section className="experience-section" id="experience">
        <div className="badge">
          <span className="dot" /> Experience
        </div>
        <div className="workflow-header">
          <h2>
            Practical experience,
            <br />
            <em>not just coursework.</em>
          </h2>
          <p className="desc">
            Three engineering roles across two companies, alongside my degree
            — building responsive UIs, integrating backend services, and
            shipping production-ready features.
          </p>
        </div>

        <div className="exp-timeline">
          {experienceRoles.map((role) => (
            <ExperienceItem role={role} key={`${role.company}-${role.dates}`} />
          ))}
        </div>
      </section>
    </ScrollFadeIn>
  );
}
