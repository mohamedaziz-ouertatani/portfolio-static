export interface Certification {
  index: string;
  title: string;
  issuer: string;
}

export const certifications: Certification[] = [
  {
    index: "01",
    title: "CCNA: Switching, Routing & Wireless Essentials",
    issuer: "Cisco Networking Academy",
  },
  {
    index: "02",
    title: "MongoDB Node.js Developer Path",
    issuer: "MongoDB University",
  },
  {
    index: "03",
    title: "Neo4j Fundamentals",
    issuer: "Neo4j GraphAcademy",
  },
];
