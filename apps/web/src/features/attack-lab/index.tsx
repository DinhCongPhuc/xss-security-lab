import { Link } from "react-router";
import { Placeholder } from "../../pages/placeholder.tsx";
export const labs = [
  ["reflected", "Reflected XSS"],
  ["stored", "Stored XSS"],
  ["dom", "DOM-based XSS"],
] as const;
export function AttackLab() {
  return (
    <>
      <Placeholder
        title="Attack Lab"
        description="Danh mục chủ đề về Cross-Site Scripting."
      />
      <ul className="mt-4 grid max-w-3xl gap-2 sm:grid-cols-3">
        {labs.map(([slug, title]) => (
          <li key={slug}>
            <Link
              className="block rounded-lg border border-border p-3 text-sm text-primary hover:bg-elevated"
              to={slug}
            >
              {title}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
