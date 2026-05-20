export default function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-lg border border-ink-700 bg-ink-900 p-6">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {description ? <p className="mt-2 text-sm text-neutral-500">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
