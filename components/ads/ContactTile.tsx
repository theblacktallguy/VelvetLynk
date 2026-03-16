// components/ad/ContactTile.tsx
"use client";

import { useMemo, useState } from "react";
import { Copy, ExternalLink } from "lucide-react";

function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  if (!user || !domain) return "••••••";
  return `${user[0] ?? "•"}•••@${domain}`;
}

function digitsOnly(s: string) {
  return s.replace(/[^\d]/g, "");
}

function maskPhone(phone: string) {
  const d = digitsOnly(phone);
  if (d.length < 4) return "••••";
  const last4 = d.slice(-4);
  return `••• ••• ${last4}`;
}

export default function ContactTile(props: {
  label: string;
  icon: any;
  value: string;
  kind: "phone" | "email" | "whatsapp" | "snapchat";
}) {
  const { label, icon: Icon, value, kind } = props;
  const [revealed, setRevealed] = useState(false);

  const displayValue = useMemo(() => {
    if (revealed) return value;

    if (kind === "email") return maskEmail(value);
    if (kind === "phone" || kind === "whatsapp") return maskPhone(value);
    // snapchat
    return value.length > 2 ? `${value.slice(0, 1)}•••` : "•••";
  }, [revealed, value, kind]);

  const openHref = useMemo(() => {
    if (!revealed) return null;

    if (kind === "phone") return `tel:${value}`;
    if (kind === "email") return `mailto:${value}`;
    if (kind === "whatsapp") {
      const d = digitsOnly(value);
      return d ? `https://wa.me/${d}` : null;
    }
    return null; // snapchat: copy-only by default
  }, [revealed, value, kind]);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // ignore; optional toast later
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 p-3 dark:border-zinc-800">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <div className="text-xs font-medium ">
          {label}
        </div>
      </div>

      <div className="mt-2 text-xs ">
        {displayValue}
      </div>

      <div className="mt-3 flex gap-2">
        {!revealed ? (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="w-full rounded-xl border border-zinc-200 px-2 py-1.5 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-800 "
          >
            Show
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onCopy}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 px-2 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy
            </button>

            {openHref ? (
              <a
                href={openHref}
                target={kind === "whatsapp" ? "_blank" : undefined}
                rel={kind === "whatsapp" ? "noreferrer" : undefined}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-2 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open
              </a>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}