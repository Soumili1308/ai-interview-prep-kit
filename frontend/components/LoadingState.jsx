export default function LoadingState({
  message = "Loading...",
}) {
  return (
    <div className="flex min-h-[240px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

        <p className="text-sm text-slate-500">
          {message}
        </p>
      </div>
    </div>
  );
}