import Link from "next/link";

export function ComingSoon() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Coming Soon!
      </h1>

      <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
       This page will be available soon.
      </p>

      <Link
        href="/"
        className="mt-7 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-primary-hover"
      >
        Back to Home
      </Link>
    </div>
  );
}
