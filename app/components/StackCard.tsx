import type { TechStackCategory } from "@/lib/data/techStack";

export default function StackCard({
  category,
}: {
  category: TechStackCategory;
}) {
  return (
    <div className="stack-card">
      <span className="stack-label">{category.label}</span>
      <div className="stack-tags">
        {category.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </div>
  );
}
