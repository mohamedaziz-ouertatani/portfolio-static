import { site } from "@/lib/data/site";
import { services } from "@/lib/data/services";
import ScrollCanvas from "./ScrollCanvas";

export default function Hero() {
  return (
    <>
      <ScrollCanvas />
      <section className="hero" id="hero">
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
              <p className="desc">{service.description}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
