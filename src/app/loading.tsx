export default function Loading() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center gap-5 px-4">
      {/* Loader */}
      <div className="relative flex size-20 items-center justify-center">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary/15 border-t-primary" />
      </div>

      {/* Content */}
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold tracking-tight">Loading...</h2>
      </div>
    </main>
  );
}
