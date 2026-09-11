import { site } from "@/lib/data/site";
import ScrollCanvas from "./ScrollCanvas";

const services = [
  { num: "/ 01", name: "Data & ML" },
  { num: "/ 02", name: "Backend & APIs" },
  { num: "/ 03", name: "DevOps & MLOps" },
  { num: "/ 04", name: "Frontend & BI" },
];

export default function Hero() {
  return (
    <>
      <ScrollCanvas />
      <div className="grid-texture" />
      <section className="hero">
        <div className="hero-top">
          <div className="hero-title">
            <p>Hey, I&apos;m a</p>
            <h1>
              Data Science &<br />
              MLOps Student
            </h1>
          </div>
          <div className="hero-right">
            <h3>
              Building systems that
              <br />
              scale predictably.
            </h3>
            <p>{site.tagline}</p>
          </div>
        </div>

        <div className="hero-services" id="skills">
          {services.map((service) => (
            <div className="service-item" key={service.num}>
              <span className="num">{service.num}</span>
              <span className="name">{service.name}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
