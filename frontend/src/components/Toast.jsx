export default function Toast({ tone = "neutral", children }) {
  const toneClasses =
    tone === "success"
      ? "border-accent/30 bg-accent/10 text-[#c9f7db]"
      : tone === "error"
        ? "border-red-500/30 bg-red-500/10 text-red-200"
        : "border-ink-700 bg-ink-900 text-neutral-200";

  return (
    <div
      className={`pointer-events-none fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-md border px-4 py-3 text-sm shadow-panel ${toneClasses}`}
      role="status"
      aria-live="polite"
    >
      {children}
    </div>
  );
}
