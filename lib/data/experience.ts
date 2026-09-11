export interface ExperienceRole {
  role: string;
  company: string;
  dates: string;
  bullets: string[];
  tags: string[];
}

export const experienceRoles: ExperienceRole[] = [
  {
    role: "Next.js Developer Intern",
    company: "iTransform365",
    dates: "May 2024 — Aug 2024",
    bullets: [
      "Built and optimized Next.js components for performance and scalability; implemented responsive UI with Tailwind CSS and TypeScript.",
      "Collaborated with backend engineers to integrate PostgreSQL services and delivered production-ready features.",
    ],
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL"],
  },
  {
    role: "React.js Developer",
    company: "Swiver",
    dates: "Aug 2022 — Apr 2023",
    bullets: [
      "Developed responsive UI components with React.js and TypeScript; implemented multilingual support (Arabic, English, French).",
      "Optimized application logic to improve UX performance, building on a prior internship at Swiver.",
    ],
    tags: ["React.js", "TypeScript", "JavaScript", "Multilingual Support"],
  },
  {
    role: "React.js Developer Intern",
    company: "Swiver",
    dates: "Jun 2022 — Aug 2022",
    bullets: [
      "Improved UI responsiveness and translation features; implemented component logic to enhance functionality.",
      "Collaborated on accessibility improvements for wider usability.",
    ],
    tags: ["React.js", "Bootstrap", "JavaScript", "Accessibility"],
  },
];
