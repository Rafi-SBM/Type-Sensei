import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-mono text-sm uppercase tracking-widest text-muted">Error 404</p>
      <h1 className="text-2xl font-semibold text-text">This page does not exist</h1>
      <p className="text-sm text-muted">
        The link may be out of date. The typing test is on the home page.
      </p>
      <Link
        to="/"
        className="mt-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-contrast transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Back to the test
      </Link>
    </main>
  );
}
