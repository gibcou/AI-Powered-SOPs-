import Link from "next/link";
import { Lock } from "lucide-react";
import { auth } from "@/lib/auth";
import { getBusinessWithAccess } from "@/lib/access";
import { AssistantChat } from "@/components/assistant-chat";

export default async function AssistantPage() {
  const session = await auth();
  const businessId = session!.user.businessId!;

  const access = await getBusinessWithAccess(businessId);
  if (!access?.hasAccess) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ask AI</h1>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
          <Lock className="mx-auto h-8 w-8 text-amber-600" />
          <h2 className="mt-3 text-lg font-semibold text-amber-900">Subscribe to use the AI assistant</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-amber-800">
            Reactivate your plan to ask questions against your SOP library.
          </p>
          <Link
            href="/dashboard/billing"
            className="mt-5 inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Choose a plan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ask AI</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ask questions about your processes and get answers grounded in your own SOP library.
        </p>
      </div>
      <AssistantChat />
    </div>
  );
}
