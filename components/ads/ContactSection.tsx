// components/ad/ContactSection.tsx
"use client";

import ContactTile from "./ContactTile";
import { Phone, Mail, MessageCircle, AtSign } from "lucide-react";

type AdContact = {
  phone?: string | null;
  email?: string | null;
  whatsapp?: string | null; // phone number preferred
  snapchat?: string | null; // username
};

export default function ContactSection({ contact }: { contact: AdContact }) {
  const items = [
    contact.phone
      ? {
          key: "phone",
          label: "Phone",
          icon: Phone,
          value: contact.phone,
          kind: "phone" as const,
        }
      : null,
    contact.email
      ? {
          key: "email",
          label: "Email",
          icon: Mail,
          value: contact.email,
          kind: "email" as const,
        }
      : null,
    contact.whatsapp
      ? {
          key: "whatsapp",
          label: "WhatsApp",
          icon: MessageCircle,
          value: contact.whatsapp,
          kind: "whatsapp" as const,
        }
      : null,
    contact.snapchat
      ? {
          key: "snapchat",
          label: "Snapchat",
          icon: AtSign,
          value: contact.snapchat,
          kind: "snapchat" as const,
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    label: string;
    icon: any;
    value: string;
    kind: "phone" | "email" | "whatsapp" | "snapchat";
  }>;

  if (items.length === 0) {
    return (
      <section className="mt-6 rounded-2xl border border-zinc-200  p-4 dark:border-zinc-800 ">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          Contact me
        </h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          No contact details provided.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-6 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
      <h3 className="text-sm font-bold ">
        Contact me
      </h3>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map(({ key, ...tileProps }) => (
            <ContactTile key={key} {...tileProps} />
        ))}
      </div>

      <ul className="mt-4 list-disc space-y-1 pl-5 text-xs">
        <li>It is ok to contact this poster with commercial interests.</li>
      </ul>
    </section>
  );
}