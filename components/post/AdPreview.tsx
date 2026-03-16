// components/post/AdPreview.tsx
"use client";

import Link from "next/link";

type AdPreviewProps = {
  title: string;
  description: string;
  stateLabel: string;
  cityLabel: string;
  categoryLabel: string;

  sex: string;
  age: number | string;
  orientation: string;
  locationText: string;

  imageUrls: string[];

  // contacts shown on ad (already gated to min 2 in wizard)
  phone?: string;
  email?: string;
  whatsapp?: string;
  snapchat?: string;
  instagram?: string;
  website?: string;

  featured: boolean;
  expiresDays: number;
};

export default function AdPreview(props: AdPreviewProps) {
  const {
    title,
    description,
    stateLabel,
    cityLabel,
    categoryLabel,
    sex,
    age,
    orientation,
    locationText,
    imageUrls,
    phone,
    email,
    whatsapp,
    snapchat,
    instagram,
    website,
    featured,
    expiresDays,
  } = props;

  const contacts = [
    phone ? { label: "Phone", value: phone } : null,
    email ? { label: "Email", value: email } : null,
    whatsapp ? { label: "WhatsApp", value: whatsapp } : null,
    snapchat ? { label: "Snapchat", value: snapchat } : null,
    instagram ? { label: "Instagram", value: instagram } : null,
    website ? { label: "Website", value: website } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs py-3 ">
              Preview • {stateLabel} / {cityLabel} • {categoryLabel}
            </div>
            <div className="mt-1 text-xl font-semiboldm ">
              {title || "(No title yet)"}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full border px-2 py-0.5 text-[11px] font-semibold">
                {sex}
              </span>
              <span className="rounded-full border px-2 py-0.5 text-[11px] font-semibold">
                {age}
              </span>
              <span className="rounded-full border px-2 py-0.5 text-[11px] font-semibold">
                {orientation}
              </span>
              {featured ? (
                <span className="rounded-full border border-[rgba(212,175,55,0.55)] bg-[rgba(212,175,55,0.10)] px-2 py-0.5 text-[11px] font-semibold">
                  Featured
                </span>
              ) : null}
            </div>
          </div>

          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            Expires in <span className="font-semibold">{expiresDays} days</span>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="rounded-2xl p-5">
        <div className="text-sm font-semibold ">
          Photos
        </div>

        {imageUrls?.length ? (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {imageUrls.slice(0, 5).map((u) => (
              <div key={u} className="overflow-hidden rounded-xl border">
                <div className="aspect-square bg-zinc-100 dark:bg-zinc-900">
                  <img src={u} alt="Ad photo" className="h-full w-full object-cover" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-2 text-sm">
            No photos added.
          </div>
        )}
      </div>

      {/* Details */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
        <div className="text-sm font-semibold">
          Details
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border p-3">
            <div className="text-xs font-semibold">Location</div>
            <div className="mt-1 text-sm text-zinc-900 dark:text-zinc-400">{locationText}</div>
          </div>
          <div className="rounded-xl border p-3">
            <div className="text-xs font-semibold">City/State</div>
            <div className="mt-1 text-sm text-zinc-900 dark:text-zinc-400">
              {cityLabel}, {stateLabel}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-sm font-semibold ">
            Description
          </div>
          <div className="mt-2 whitespace-pre-wrap text-sm ">
            {description || "(No description yet)"}
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
        <div className="text-sm font-semibold">
          Contact
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {contacts.map((c) => (
            <div key={c.label} className="rounded-xl border p-3">
              <div className="text-xs font-semibold">
                {c.label}
              </div>
              <div className="mt-1 text-sm text-zinc-900 dark:text-zinc-400">
                {c.value}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 text-[11px] text-zinc-600 dark:text-zinc-400">
          Preview only. Links/calls will be active after publishing.
        </div>
      </div>
    </div>
  );
}