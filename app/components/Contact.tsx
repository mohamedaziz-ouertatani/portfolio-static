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
            <label htmlFor="contact-name">YOUR NAME*</label>
            <input id="contact-name" name="name" type="text" placeholder="John Doe" required />
          </div>
          <div className="form-group">
            <label htmlFor="contact-phone">YOUR NUMBER</label>
            <input id="contact-phone" name="phone" type="tel" placeholder="+123-456-7890" />
          </div>
          <div className="form-group" style={{ gridColumn: "span 2" }}>
            <label htmlFor="contact-email">YOUR EMAIL*</label>
            <input id="contact-email" name="email" type="email" placeholder="john@example.com" required />
          </div>
          <div className="form-group" style={{ gridColumn: "span 2" }}>
            <label htmlFor="contact-message">HOW CAN I HELP?</label>
            <input
              id="contact-message"
              name="message"
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
