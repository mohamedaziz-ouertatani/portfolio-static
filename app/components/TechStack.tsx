import { techStackCategories } from "@/lib/data/techStack";
import StackCard from "./StackCard";
import ScrollFadeIn from "./ScrollFadeIn";

export default function TechStack() {
  return (
    <ScrollFadeIn>
      <section className="workflow-section">
        <div className="badge">
          <span className="dot" /> TECH STACK
        </div>
        <div className="workflow-header">
          <h2>
            Proficient in <em>modern tools</em>
            <br />
            for data engineering and web apps.
          </h2>
          <p className="desc">
            My stack is focused on high-performance backends, reproducible
            machine learning environments, and type-safe frontends. I
            strongly believe in free/open-source-first technologies.
          </p>
        </div>
        <div className="stack-grid">
          {techStackCategories.map((category) => (
            <StackCard category={category} key={category.label} />
          ))}
        </div>
        <p className="workflow-footer">
          Currently pursuing an Engineering Degree in Computer Science (Data
          Science) at ESPRIT, Tunis. Expected graduation in 2027.
        </p>
      </section>
    </ScrollFadeIn>
  );
}
