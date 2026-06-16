import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardCheck, LayoutGrid, CreditCard, LogOut, Sparkles } from "lucide-react";
import { auth, signOut } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-60 flex-col border-r border-slate-200 bg-white sm:flex">
        <div className="flex items-center gap-2 px-6 py-5 font-semibold text-slate-900">
          <ClipboardCheck className="h-6 w-6 text-indigo-600" />
          <span>SOPilot</span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <LayoutGrid className="h-4 w-4" /> SOP Library
          </Link>
          <Link
            href="/dashboard/assistant"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <Sparkles className="h-4 w-4" /> Ask AI
          </Link>
          <Link
            href="/dashboard/billing"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <CreditCard className="h-4 w-4" /> Billing
          </Link>
        </nav>
        <div className="border-t border-slate-200 p-3">
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </form>
        </div>
      </aside>
      <div className="flex-1">
        <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
      </div>
    </div>
  );
}
