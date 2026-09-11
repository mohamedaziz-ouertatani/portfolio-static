export interface HomeStat {
  label: string;
  value: number;
  suffix?: string;
  description: string;
}

/** Home page's animated (count-up-on-scroll) stat blocks. */
export const homeStats: HomeStat[] = [
  {
    label: "ACADEMIC EXCELLENCE",
    value: 2027,
    description: "Expected Engineering Degree in Computer Science at ESPRIT",
  },
  {
    label: "PROFESSIONAL EXPERIENCE",
    value: 2,
    suffix: "+",
    description: "Years of applied experience building web & data solutions",
  },
];

export interface AboutHighlight {
  value: number;
  suffix?: string;
  label: string;
}

/** About section's compact quick-scan stat row. */
export const aboutHighlights: AboutHighlight[] = [
  { value: 2, suffix: "+", label: "Years Building" },
  { value: 3, label: "Engineering Roles" },
  { value: 3, label: "Certifications" },
];
