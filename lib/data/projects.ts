export interface Project {
  slug: string;
  title: string;
  tagLabel: string;
  tagline: string;
  description: string;
  image: string;
  link: string;
  featured: boolean;
}

export const projects: Project[] = [
  {
    slug: "researchbridge",
    title: "ResearchBridge",
    tagLabel: "Python & LLM APIs",
    tagline: "Research Intelligence Platform",
    description:
      "Solo-built platform that takes a research idea or paper and returns an evidence-grounded assessment — novelty, gaps, and feasibility — via PostgreSQL + pgvector retrieval and LLM-based knowledge extraction, with every claim tied to cited sources.",
    image: "/images/projects/researchbridge.jpg",
    link: "https://github.com/mohamedaziz-ouertatani/ResearchBridge",
    featured: false,
  },
  {
    slug: "estate-mind",
    title: "Estate-Mind",
    tagLabel: "Pandas & Plotly",
    tagline: "Tunisian Real Estate Data Pipeline & EDA",
    description:
      "Reproducible pipeline cleaning and standardizing multi-source scraped listings, with advanced EDA — price distribution, density heatmaps, and property-segment clustering — for Tunisia's second-hand real estate market.",
    image: "/images/projects/estate-mind.jpg",
    link: "https://github.com/mohamedaziz-ouertatani/estate-mind",
    featured: false,
  },
  {
    slug: "smart-inventory",
    title: "Smart Inventory Forecasting & Replenishment Platform",
    tagLabel: "Fastify & MLflow",
    tagline: "Production-Style Forecasting System",
    description:
      "Containerized platform with data ingestion, feature engineering, rolling backtests, and ETS/ARIMA model selection tracked in MLflow. Forecasts and accuracy metrics are persisted to PostgreSQL and served through JWT-protected Fastify APIs.",
    image: "/images/projects/smart-inventory.jpg",
    link: "https://github.com/mohamedaziz-ouertatani/smart_inventory",
    featured: true,
  },
  {
    slug: "mlops-pipeline",
    title: "ML Project — MLOps Pipeline",
    tagLabel: "scikit-learn & Docker",
    tagline: "Reproducible Training & Deployment",
    description:
      "End-to-end scikit-learn pipeline with MLflow experiment tracking, versioned artifacts via Joblib, and a containerized inference app for reproducible deployment.",
    image: "/images/projects/mlops-pipeline.jpg",
    link: "https://github.com/mohamedaziz-ouertatani",
    featured: false,
  },
];
