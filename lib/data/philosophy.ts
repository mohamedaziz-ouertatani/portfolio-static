export interface PhilosophyStat {
  value: string;
  label: string;
}

/** Projects page's static (non-animated) philosophy stat grid. */
export const philosophyStats: PhilosophyStat[] = [
  { value: "3+", label: "Major Projects" },
  { value: "2+", label: "Years Experience" },
  { value: "3", label: "Professional Certs" },
  { value: "100%", label: "Open-Source First" },
];

export const philosophyCopy = {
  heading: "Engineering Robust Solutions.",
  body: "Every system is approached with a focus on reliability, scalability, and type-safety. I don't just write scripts; I architect production-oriented platforms bridging APIs and predictive analytics.",
};
