export interface SiteData {
  name: string;
  shortName: string;
  role: string;
  tagline: string;
  email: string;
  phone: string;
  socials: {
    linkedin: string;
    github: string;
    livePortfolio: string;
  };
  metaDescription: string;
}

export const site: SiteData = {
  name: "Mohamed Aziz Ouertatani",
  shortName: "Aziz Ouertatani",
  role: "Data Science & MLOps Engineer",
  tagline:
    "Final-year Computer Science Engineering student specializing in Data Science, bridging backend APIs and predictive analytics.",
  email: "ouertatanimohamedaziz@gmail.com",
  phone: "+216 29 241 717",
  socials: {
    linkedin: "https://linkedin.com/in/mohamed-aziz-ouertatani",
    github: "https://github.com/mohamedaziz-ouertatani",
    livePortfolio: "https://mohamedaziz-ouertatani.vercel.app",
  },
  metaDescription:
    "Final-year Computer Science Engineering student specializing in Data Science. Building end-to-end data pipelines, ML systems, and scalable web applications — seeking a 6-month PFE internship.",
};
