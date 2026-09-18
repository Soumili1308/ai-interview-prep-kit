export default function PracticeProgress({
  current,
  total,
  covered,
  uncovered,
}) {
  const percentage =
    total === 0
      ? 0
      : Math.round(
          (covered / total) * 100
        );

  return (
    <div className="card p-5">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Practice progress
          </p>

          <p className="mt-1 text-lg font-semibold text-slate-900">
            Card {current} of {total}
          </p>
        </div>

        <div className="text-right">
          <p className="text-lg font-bold text-slate-900">
            {percentage}%
          </p>

          <p className="text-xs text-slate-400">
            covered
          </p>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-slate-900 transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <div className="mt-4 flex gap-4 text-xs text-slate-500">
        <span>
          Covered:{" "}
          <strong className="text-slate-900">
            {covered}
          </strong>
        </span>

        <span>
          Uncovered:{" "}
          <strong className="text-slate-900">
            {uncovered}
          </strong>
        </span>
      </div>
    </div>
  );
}