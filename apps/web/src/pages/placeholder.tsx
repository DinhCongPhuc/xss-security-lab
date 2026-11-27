export function Placeholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="max-w-3xl rounded-xl border border-border bg-surface p-6 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-secondary-foreground">
        {description}
      </p>
    </section>
  );
}
