import Link from "next/link";
import { ClipboardCheck } from "lucide-react";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <ClipboardCheck className="h-6 w-6 text-indigo-600" />
          <span>SOPilot</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 sm:flex">
          <Link href="/#features" className="hover:text-slate-900">
            Features
          </Link>
          <Link href="/#how-it-works" className="hover:text-slate-900">
            How it works
          </Link>
          <Link href="/pricing" className="hover:text-slate-900">
            Pricing
          </Link>
          <Link href="/demo" className="hover:text-slate-900">
            Live demo
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Start free trial
          </Link>
        </div>
      </div>
    </header>
  );
}
