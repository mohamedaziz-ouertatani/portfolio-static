import { describe, it, expect } from "vitest";
import { site } from "./site";
import { navLinks } from "./nav";
import { experienceRoles } from "./experience";
import { techStackCategories } from "./techStack";
import { certifications } from "./certifications";
import { homeStats } from "./stats";
import { philosophyStats, philosophyCopy } from "./philosophy";
import { projects } from "./projects";
import { services } from "./services";
import { sectionIndexItems } from "./sectionIndex";

describe("site data", () => {
  it("has the expected identity fields", () => {
    expect(site.name).toBe("Mohamed Aziz Ouertatani");
    expect(site.email).toBe("ouertatanimohamedaziz@gmail.com");
    expect(site.phone).toBe("+216 29 241 717");
  });

  it("has all three social links", () => {
    expect(site.socials.linkedin).toContain("linkedin.com");
    expect(site.socials.github).toContain("github.com");
    expect(site.socials.livePortfolio).toContain("vercel.app");
  });
});

describe("nav data", () => {
  it("has 4 nav links ending with Projects", () => {
    expect(navLinks).toHaveLength(4);
    expect(navLinks[navLinks.length - 1].label).toBe("Projects");
  });
});

describe("experience data", () => {
  it("has exactly 3 roles in reverse-chronological-by-recency order", () => {
    expect(experienceRoles).toHaveLength(3);
    expect(experienceRoles[0].company).toBe("iTransform365");
    expect(experienceRoles[1].company).toBe("Swiver");
    expect(experienceRoles[2].company).toBe("Swiver");
  });

  it("every role has at least one bullet and one tag", () => {
    for (const role of experienceRoles) {
      expect(role.bullets.length).toBeGreaterThan(0);
      expect(role.tags.length).toBeGreaterThan(0);
    }
  });
});

describe("tech stack data", () => {
  it("has exactly 6 categories", () => {
    expect(techStackCategories).toHaveLength(6);
  });

  it("every category has a non-empty label and at least one tag", () => {
    for (const category of techStackCategories) {
      expect(category.label.length).toBeGreaterThan(0);
      expect(category.tags.length).toBeGreaterThan(0);
    }
  });
});

describe("certifications data", () => {
  it("has exactly 3 certifications, indexed 01-03", () => {
    expect(certifications).toHaveLength(3);
    expect(certifications.map((c) => c.index)).toEqual(["01", "02", "03"]);
  });
});

describe("home stats data", () => {
  it("has exactly 2 stats", () => {
    expect(homeStats).toHaveLength(2);
  });

  it("includes the graduation year and years of experience", () => {
    const values = homeStats.map((s) => s.value);
    expect(values).toContain(2027);
    expect(values).toContain(2);
  });
});

describe("philosophy data", () => {
  it("has exactly 4 stat items", () => {
    expect(philosophyStats).toHaveLength(4);
  });

  it("has heading and body copy", () => {
    expect(philosophyCopy.heading.length).toBeGreaterThan(0);
    expect(philosophyCopy.body.length).toBeGreaterThan(0);
  });
});

describe("projects data", () => {
  it("has exactly 4 projects", () => {
    expect(projects).toHaveLength(4);
  });

  it("every project has a slug, image, and link", () => {
    for (const project of projects) {
      expect(project.slug.length).toBeGreaterThan(0);
      expect(project.image.length).toBeGreaterThan(0);
      expect(project.link.startsWith("https://")).toBe(true);
    }
  });

  it("includes the real GitHub repo links", () => {
    const links = projects.map((p) => p.link);
    expect(links).toContain(
      "https://github.com/mohamedaziz-ouertatani/ResearchBridge",
    );
    expect(links).toContain(
      "https://github.com/mohamedaziz-ouertatani/estate-mind",
    );
    expect(links).toContain(
      "https://github.com/mohamedaziz-ouertatani/smart_inventory",
    );
  });
});

describe("services data", () => {
  it("has exactly 4 services, each with a description", () => {
    expect(services).toHaveLength(4);
    for (const service of services) {
      expect(service.description.length).toBeGreaterThan(0);
    }
  });
});

describe("section index data", () => {
  it("has exactly 6 items, each pointing at an in-page anchor", () => {
    expect(sectionIndexItems).toHaveLength(6);
    for (const item of sectionIndexItems) {
      expect(item.href.startsWith("#")).toBe(true);
    }
  });

  it("is numbered 01 through 06 in order", () => {
    expect(sectionIndexItems.map((i) => i.num)).toEqual([
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
    ]);
  });
});
