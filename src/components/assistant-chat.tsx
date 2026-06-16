"use client";

import { useState } from "react";
import { Send, Sparkles } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

export function AssistantChat() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || loading) return;

    const q = question.trim();
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setQuestion("");
    setLoading(true);
    setError(null);

    const res = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q }),
    });
    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } else {
      setError(data.error ?? "Something went wrong.");
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="min-h-[200px] space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Sparkles className="h-4 w-4" /> Try asking &quot;What&apos;s our process for handling a customer complaint?&quot;
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`rounded-lg px-4 py-3 text-sm ${
              m.role === "user" ? "bg-indigo-50 text-indigo-900" : "bg-slate-50 text-slate-700"
            }`}
          >
            <p className="whitespace-pre-wrap">{m.content}</p>
          </div>
        ))}
        {loading && <div className="text-sm text-slate-400">Thinking...</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about your SOPs..."
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          <Send className="h-4 w-4" /> Ask
        </button>
      </form>
    </div>
  );
}
