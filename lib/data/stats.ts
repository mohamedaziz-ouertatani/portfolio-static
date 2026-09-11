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
