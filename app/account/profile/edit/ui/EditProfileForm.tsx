"use client";

import { useState } from "react";
import { saveProfile } from "../actions";
import PhotoManager from "./PhotoManager";
import Link from "next/link";

type Initial = {
  userSlug: string;
  accountEmail: string;
  accountEmailVerified: boolean;

  bio: string;
  phone: string;
  email: string;
  whatsapp: string;
  snapchat: string;
  instagram: string;
  website: string;
  city: string;
  state: string;

  avatarUrl: string;
  photoUrls: string[];
};

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={[
        "rounded-full border px-2 py-0.5 text-[11px] font-semibold",
        ok
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
          : "border-zinc-300 bg-zinc-100 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200",
      ].join(" ")}
    >
      {label}
    </span>
  );
}

export default function EditProfileForm({ initial }: { initial: Initial }) {
  const [bio, setBio] = useState(initial.bio);

  return (
    <form action={saveProfile} className="space-y-6">
      {/* Photos first */}
      <PhotoManager initialAvatarUrl={initial.avatarUrl} initialPhotoUrls={initial.photoUrls} />

      {/* Username */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
        <div className="text-s font-bold">Username</div>
        <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          This is your public profile URL: <span className="font-semibold">/profile/{initial.userSlug}</span>
        </div>

        <label className="mt-3 block text-xs font-semibold text-zinc-700 dark:text-zinc-400">
          Change username
        </label>
        <input
          name="userSlug"
          defaultValue={initial.userSlug}
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-transparent p-3 text-sm placeholder:text-zinc-500 dark:border-zinc-800  dark:placeholder:text-zinc-400"
          placeholder="e.g. lagos-bella"
        />
        <div className="mt-1 text-[11px] text-zinc-600 dark:text-zinc-400">
          Allowed: letters, numbers, hyphens. 3–30 characters.
        </div>
      </div>

      {/* Bio */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
        <label className="block text-s font-bold ">
          Bio (max 150)
        </label>
        <textarea
          name="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, 150))}
          rows={4}
          className="mt-2 w-full rounded-xl border border-zinc-200 bg-transparent p-3 text-sm placeholder:text-zinc-500 dark:border-zinc-800 dark:placeholder:text-zinc-400"
          placeholder="Write a short bio..."
        />
        <div className="mt-1 text-[11px] text-zinc-600 dark:text-zinc-400">
          {bio.length}/150
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold ">State</label>
            <input
              name="state"
              defaultValue={initial.state}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-transparent p-3 text-sm placeholder:text-zinc-500 dark:border-zinc-800 dark:placeholder:text-zinc-400"
              placeholder="e.g. Lagos"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">City</label>
            <input
              name="city"
              defaultValue={initial.city}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-transparent p-3 text-sm placeholder:text-zinc-500 dark:border-zinc-800 dark:placeholder:text-zinc-400"
              placeholder="e.g. Ikeja"
            />
          </div>
        </div>
      </div>

      {/* Contacts + Verify buttons */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-s font-bold">Contact</div>
            <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              Add how people can reach you. Verification will be handled on the verification page.
            </div>
          </div>
          <Link
            href="/account/verification"
            className="rounded-lg border px-3 py-2 text-xs font-semibold gold-border hover:bg-amber-600/60"
          >
            Verification
          </Link>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {/* Phone */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold ">Phone</label>
              <div className="flex items-center gap-2">
                <Badge ok={false} label="Unverified" />
                <Link
                  href="/account/verification?type=phone"
                  className="text-[11px] font-semibold underline hover:text-zinc-900 dark:hover:text-zinc-300"
                >
                  Verify
                </Link>
              </div>
            </div>
            <input
              name="phone"
              defaultValue={initial.phone}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-transparent p-3 text-sm placeholder:text-zinc-500 dark:border-zinc-800 dark:placeholder:text-zinc-400"
              placeholder="+234..."
            />
          </div>

          {/* Email */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold ">Email</label>
              <div className="flex items-center gap-2">
                <Badge ok={initial.accountEmailVerified} label={initial.accountEmailVerified ? "Verified" : "Unverified"} />
                <Link
                  href="/account/verification?type=email"
                  className="text-[11px] font-semibold underline hover:text-zinc-900 dark:hover:text-zinc-300"
                >
                  Verify
                </Link>
              </div>
            </div>
            <input
              name="email"
              defaultValue={initial.email}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-transparent p-3 text-sm placeholder:text-zinc-500 dark:border-zinc-800 dark:placeholder:text-zinc-400"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold ">WhatsApp</label>
            <input
              name="whatsapp"
              defaultValue={initial.whatsapp}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-transparent p-3 text-sm placeholder:text-zinc-500 dark:border-zinc-800 dark:placeholder:text-zinc-400"
              placeholder="@handle or number"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold">Snapchat</label>
            <input
              name="snapchat"
              defaultValue={initial.snapchat}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-transparent p-3 text-sm placeholder:text-zinc-500 dark:border-zinc-800 dark:placeholder:text-zinc-400"
              placeholder="@snap"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold">Instagram</label>
            <input
              name="instagram"
              defaultValue={initial.instagram}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-transparent p-3 text-sm placeholder:text-zinc-500 dark:border-zinc-800 dark:placeholder:text-zinc-400"
              placeholder="@insta"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold">Website</label>
            <input
              name="website"
              defaultValue={initial.website}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-transparent p-3 text-sm placeholder:text-zinc-500 dark:border-zinc-800 dark:placeholder:text-zinc-400"
              placeholder="https://..."
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between" >
        <button
          type="submit"
          className="rounded-lg border px-4 py-2 text-sm font-semibold gold-border hover:bg-emerald-700/80" 
        >
          Save profile
        </button>

        <a href="/account" className="text-sm text-zinc-700 hover:underline dark:text-zinc-500">
          Cancel
        </a>
      </div>
    </form>
  );
}