import type { Metadata } from "next";
import { site } from "@/lib/data/site";
import Hero from "./components/Hero";
import Experience from "./components/Experience";
import About from "./components/About";
import TechStack from "./components/TechStack";
import Contact from "./components/Contact";
import Stats from "./components/Stats";
import Certifications from "./components/Certifications";
import SectionIndex from "./components/SectionIndex";

export const metadata: Metadata = {
  title: `${site.name} — ${site.role}`,
  description: site.metaDescription,
};

export default function HomePage() {
  return (
    <main className="container">
      <SectionIndex />
      <Hero />
      <Experience />
      <About />
      <TechStack />
      <Contact />
      <Stats />
      <Certifications />
    </main>
  );
}
