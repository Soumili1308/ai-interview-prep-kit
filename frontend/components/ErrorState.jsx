export default function ErrorState({
  message = "Something went wrong.",
  onRetry,
}) {
  return (
    <div className="card p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
        !
      </div>

      <h2 className="text-lg font-semibold text-slate-900">
        Something went wrong
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="secondary-button mt-5"
        >
          Try again
        </button>
      )}
    </div>
  );
}