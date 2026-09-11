import { homeStats } from "@/lib/data/stats";
import AnimatedStat from "./AnimatedStat";
import ScrollFadeIn from "./ScrollFadeIn";

export default function Stats() {
  return (
    <ScrollFadeIn>
      <section className="stats-section">
        <div className="stats-container">
          {homeStats.map((stat) => (
            <div className="stat-block" key={stat.label}>
              <div className="stat-top">{stat.label}</div>
              <div className="stat-line" />
              <div className="stat-number">
                <AnimatedStat value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="stat-desc">{stat.description}</div>
            </div>
          ))}
        </div>
      </section>
    </ScrollFadeIn>
  );
}
