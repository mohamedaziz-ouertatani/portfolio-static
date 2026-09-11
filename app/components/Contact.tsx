import { site } from "@/lib/data/site";
import ScrollFadeIn from "./ScrollFadeIn";

export default function Contact() {
  return (
    <ScrollFadeIn>
      <section className="contact-section" id="contact">
        <div className="contact-header">
          <h2>
            Ready to build
            <br />& scale your
            <br />
            <em>systems?</em>
          </h2>
          <div className="lets-talk">
            <strong>Let&apos;s talk</strong>
            I am actively seeking a 6-month PFE internship starting February
            2027.
          </div>
        </div>

        <form
          className="contact-form"
          action={`mailto:${site.email}`}
          method="post"
          encType="text/plain"
        >
          <div className="form-group">
            <label>YOUR NAME*</label>
            <input type="text" placeholder="John Doe" required />
          </div>
          <div className="form-group">
            <label>YOUR NUMBER</label>
            <input type="text" placeholder="+123-456-7890" />
          </div>
          <div className="form-group" style={{ gridColumn: "span 2" }}>
            <label>YOUR EMAIL*</label>
            <input type="email" placeholder="john@example.com" required />
          </div>
          <div className="form-group" style={{ gridColumn: "span 2" }}>
            <label>HOW CAN I HELP?</label>
            <input
              type="text"
              placeholder="Tell me about your project or opportunity..."
            />
          </div>
          <div className="form-group">
            <button
              type="submit"
              className="btn orange"
              style={{ border: "none", cursor: "pointer" }}
            >
              Send Message <span className="icon">↗</span>
            </button>
          </div>
        </form>
      </section>
    </ScrollFadeIn>
  );
}
