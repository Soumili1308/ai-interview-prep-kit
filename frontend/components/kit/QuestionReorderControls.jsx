"use client";

import {
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function QuestionReorderControls({
  index,
  total,
  onMove,
}) {
  return (
    <div className="flex gap-1">
      <button
        type="button"
        disabled={index === 0}
        onClick={() =>
          onMove(index, index - 1)
        }
        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
        title="Move up"
      >
        <ChevronUp size={16} />
      </button>

      <button
        type="button"
        disabled={index === total - 1}
        onClick={() =>
          onMove(index, index + 1)
        }
        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
        title="Move down"
      >
        <ChevronDown size={16} />
      </button>
    </div>
  );
}