"use client";

import { useMemo, useState } from "react";

type Msg = { role: "user" | "bot"; text: string };

const FAQ = [
  { k: "How do I edit my profile?" },
  { k: "Why are my photos not showing?" },
  { k: "How do I report an ad or profile?" },
  { k: "I can’t log in" },
];

function Spinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-transparent dark:border-zinc-700"
      aria-hidden
    />
  );
}

export default function SupportChat() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "bot",
      text:
        "Hi — I’m the SecretLink assistant. Ask me anything about using the app. " +
        "If you need a human, you can request support and we’ll create a ticket.",
    },
  ]);
  const [input, setInput] = useState("");
  const [showTicket, setShowTicket] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ticketBusy, setTicketBusy] = useState(false);

  const suggested = useMemo(() => FAQ.slice(0, 4), []);

  async function send(customText?: string) {
    const text = (customText ?? input).trim();
    if (!text || busy) return;

    const nextMessages = [...messages, { role: "user" as const, text }];
    setMessages(nextMessages);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/support/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          history: messages,
        }),
      });

      const data = await res.json().catch(() => ({}));

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text:
            res.ok && data?.reply
              ? data.reply
              : data?.error || "Sorry — I couldn’t answer that right now. You can create a support ticket below.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Network error. Please try again or create a support ticket.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  async function submitTicket(form: FormData) {
    const subject = String(form.get("subject") ?? "").trim();
    const details = String(form.get("details") ?? "").trim();

    if (!subject || !details || ticketBusy) return;

    setTicketBusy(true);

    try {
      const res = await fetch("/api/support/ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          message: details,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessages((m) => [
          ...m,
          {
            role: "bot",
            text: data?.error || "Sorry — failed to create your support ticket.",
          },
        ]);
        return;
      }

      setMessages((m) => [
        ...m,
        { role: "user", text: `Ticket request: ${subject}` },
        {
          role: "bot",
          text:
            "Thanks — your support ticket has been submitted successfully. " +
            "Our team can now review and respond from the admin panel.",
        },
      ]);

      setShowTicket(false);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "bot",
          text: "Network error. Please try again.",
        },
      ]);
    } finally {
      setTicketBusy(false);
    }
  }

  return (
    <div className="card p-6 bg-white/80 dark:bg-zinc-900/40 space-y-4">
      <div>
        <div className="text-xl font-semibold">Support Chat</div>
        <div className="mt-1 text-sm">
          Ask a question or request a human support ticket.
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3 h-[420px] overflow-auto">
        <div className="space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={[
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap",
                  m.role === "user"
                    ? "bg-zinc-900 text-white dark:bg-zinc-600 dark:text-zinc-100"
                    : "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100",
                ].join(" ")}
              >
                {m.text}
              </div>
            </div>
          ))}

          {busy ? (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl px-3 py-2 text-sm bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 inline-flex items-center gap-2">
                <Spinner />
                Thinking...
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {!showTicket ? (
        <div className="flex flex-wrap gap-2">
          {suggested.map((s) => (
            <button
              key={s.k}
              type="button"
              onClick={() => send(s.k)}
              disabled={busy}
              className="rounded-full border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs font-semibold disabled:opacity-60"
            >
              {s.k}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setShowTicket(true)}
            className="rounded-full border px-3 py-2 text-xs font-semibold gold-border hover:bg-amber-600/60"
          >
            Talk to a human
          </button>
        </div>
      ) : (
        <form action={submitTicket} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
          <div className="text-sm font-semibold">Create a support ticket</div>

          <div>
            <label className="block text-xs font-semibold">Subject</label>
            <input
              name="subject"
              className="mt-1 w-full rounded-xl border border-zinc-200 p-3 text-sm placeholder:text-zinc-500 dark:border-zinc-800 dark:placeholder:text-zinc-400"
              placeholder="e.g. Can’t upload photos"
              required
              disabled={ticketBusy}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold">Details</label>
            <textarea
              name="details"
              rows={4}
              className="mt-1 w-full rounded-xl border border-zinc-200 p-3 text-sm placeholder:text-zinc-500 dark:border-zinc-800 dark:placeholder:text-zinc-400"
              placeholder="Include what happened, your username, and any ad/profile IDs if relevant."
              required
              disabled={ticketBusy}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={ticketBusy}
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold gold-border hover:bg-amber-600/60 disabled:opacity-60"
            >
              {ticketBusy ? <Spinner /> : null}
              {ticketBusy ? "Submitting..." : "Submit ticket"}
            </button>

            <button
              type="button"
              onClick={() => setShowTicket(false)}
              disabled={ticketBusy}
              className="text-xs underline text-zinc-700 hover:text-zinc-300 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>

          <div className="text-[11px]">
            Support tickets are saved to your account and visible to admins.
          </div>
        </form>
      )}

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              send();
            }
          }}
          disabled={busy}
          className="flex-1 rounded-xl border border-zinc-200 p-3 text-sm placeholder:text-zinc-500 dark:border-zinc-800 dark:placeholder:text-zinc-400 disabled:opacity-60"
          placeholder="Type your question…"
        />
        <button
          type="button"
          onClick={() => send()}
          disabled={busy || !input.trim()}
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold gold-border hover:bg-amber-600/60 disabled:opacity-60"
        >
          {busy ? <Spinner /> : null}
          {busy ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}