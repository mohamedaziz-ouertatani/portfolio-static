import { philosophyStats, philosophyCopy } from "@/lib/data/philosophy";
import ScrollFadeIn from "./ScrollFadeIn";

export default function Philosophy() {
  return (
    <ScrollFadeIn>
      <div className="philosophy">
        <div className="phil-left">
          <h2>{philosophyCopy.heading}</h2>
          <p>{philosophyCopy.body}</p>
        </div>
        <div className="phil-right">
          {philosophyStats.map((stat) => (
            <div className="stat-item" key={stat.label}>
              <h4>{stat.value}</h4>
              <p>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </ScrollFadeIn>
  );
}
