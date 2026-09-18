"use client";

const levels = [
  {
    value: 1,
    label: "Very weak",
  },
  {
    value: 2,
    label: "Weak",
  },
  {
    value: 3,
    label: "Okay",
  },
  {
    value: 4,
    label: "Good",
  },
  {
    value: 5,
    label: "Very confident",
  },
];

export default function ConfidenceSelector({
  value,
  onSelect,
  disabled = false,
}) {
  return (
    <div>
      <p className="mb-3 text-sm font-medium text-slate-700">
        How confident did you feel?
      </p>

      <div className="grid grid-cols-5 gap-2">
        {levels.map((level) => (
          <button
            key={level.value}
            disabled={disabled}
            onClick={() =>
              onSelect(level.value)
            }
            className={`rounded-xl border px-2 py-3 text-center transition ${
              value === level.value
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <div className="text-sm font-semibold">
              {level.value}
            </div>

            <div className="mt-1 hidden text-[10px] sm:block">
              {level.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}