
export default function SectionHeading({
  eyebrow,
  title,
  accent,
  description,
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[.25em] text-violet-300">
        {eyebrow}
      </p>

      <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">
        {title}

        {accent && (
          <span className="mt-1 block bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">
            {accent}
          </span>
        )}
      </h2>

      {description && (
        <p className="mt-5 text-sm leading-7 text-slate-400 sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}
