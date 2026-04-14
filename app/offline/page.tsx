import Link from "next/link";

export const metadata = {
  title: "Offline — Nywele.ai",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 bg-transparent px-6 text-center">
      <p className="text-lg font-medium text-foreground">You&apos;re offline</p>
      <p className="max-w-sm text-sm text-foreground/80">
        Check your connection, then try again. Cached pages may still open from your home screen.
      </p>
      <Link
        href="/"
        className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-cream"
      >
        Go home
      </Link>
    </div>
  );
}
