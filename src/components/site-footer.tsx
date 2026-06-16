import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-slate-500 sm:flex-row">
        <p>© {new Date().getFullYear()} SOPilot. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/pricing" className="hover:text-slate-700">
            Pricing
          </Link>
          <Link href="/login" className="hover:text-slate-700">
            Log in
          </Link>
          <Link href="/signup" className="hover:text-slate-700">
            Sign up
          </Link>
        </div>
      </div>
    </footer>
  );
}
