"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useRouteLoading } from "@/components/navigation/RouteLoadingProvider";
import LoadingOverlay from "@/components/LoadingOverlay";
import { NG_STATES, citiesForStateSlug, slugify } from "@/lib/locations/ng";
import AdPreview from "@/components/post/AdPreview";

type Gating = {
  bioOk: boolean;
  photosOk: boolean;
  contactOk: boolean;
  locationOk: boolean;
};

const CATEGORIES = [
  "Female Escorts",
  "Male Escorts",
  "Female Massage",
  "Male Massage",
  "Males for Couples",
  "Females for Couples",
  "Casual Dating",
  "Platonic Dating",
  "Friendships",
  "Missed Connections",
  "Gay",
  "Lesbian",
] as const;

const ORIENTATION_OPTIONS = [
  { value: "", label: "Select orientation" },
  { value: "STRAIGHT", label: "Straight (Heterosexual)" },
  { value: "BISEXUAL", label: "Bisexual" },
  { value: "GAY", label: "Gay" },
  { value: "LESBIAN", label: "Lesbian" },
  { value: "PANSEXUAL", label: "Pansexual" },
  { value: "ASEXUAL", label: "Asexual" },
  { value: "OTHER", label: "Other" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
] as const;

const SEX_OPTIONS = [
  { value: "", label: "Select sex" },
  { value: "FEMALE", label: "Female" },
  { value: "MALE", label: "Male" },
  { value: "TRANS_FEMALE", label: "Trans Female" },
  { value: "TRANS_MALE", label: "Trans Male" },
  { value: "NON_BINARY", label: "Non-binary" },
  { value: "OTHER", label: "Other" },
] as const;

type SexValue = (typeof SEX_OPTIONS)[number]["value"];
type OrientationValue = (typeof ORIENTATION_OPTIONS)[number]["value"];

type EditableAd = {
  id: string;
  status: string;
  featured: boolean;
  durationDays: number;
  stateSlug: string;
  citySlug: string;
  categorySlug: string;
  title: string;
  body: string;
  sex: string;
  age: string;
  orientation: string;
  locationText: string;
  imageUrls: string[];
  phone: string;
  email: string;
  whatsapp: string;
  snapchat: string;
  expiresAt: string | null;
  publishedAt: string | null;
};

function countContacts(c: {
  phone?: string;
  email?: string;
  whatsapp?: string;
  snapchat?: string;
}) {
  return [c.phone, c.email, c.whatsapp, c.snapchat].filter((v) =>
    Boolean(v?.trim())
  ).length;
}

export default function EditPostWizard({
  ad,
  gating,
  walletCredits,
}: {
  ad: EditableAd;
  gating: Gating;
  walletCredits: number;
}) {
  const router = useRouter();
const { startLoading } = useRouteLoading();

  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [overlay, setOverlay] = useState<
    null | { type: "saving" } | { type: "profile"; message: string }
  >(null);

  const [stateSlug, setStateSlug] = useState(ad.stateSlug || "");
  const [citySlug, setCitySlug] = useState(ad.citySlug || "");
  const [categorySlug, setCategorySlug] = useState(ad.categorySlug || "");
  const cityOptions = useMemo(() => citiesForStateSlug(stateSlug), [stateSlug]);

  const [title, setTitle] = useState(ad.title || "");
  const [body, setBody] = useState(ad.body || "");
  const [age, setAge] = useState(ad.age || "");
  const [sex, setSex] = useState((ad.sex || "") as SexValue);
  const [orientation, setOrientation] = useState(
    (ad.orientation || "") as OrientationValue
  );
  const [locationText, setLocationText] = useState(ad.locationText || "");

  const [imageUrls, setImageUrls] = useState<string[]>(ad.imageUrls || []);

  const [phone, setPhone] = useState(ad.phone || "");
  const [email, setEmail] = useState(ad.email || "");
  const [whatsapp, setWhatsapp] = useState(ad.whatsapp || "");
  const [snapchat, setSnapchat] = useState(ad.snapchat || "");

  const requiredProfileOk =
    gating.bioOk && gating.photosOk && gating.contactOk && gating.locationOk;

  function next() {
    setMsg(null);

    if (step === 1) {
      if (!stateSlug.trim()) return setMsg("State is required.");
      if (!citySlug.trim()) return setMsg("City is required.");
      if (!categorySlug.trim()) return setMsg("Category is required.");
    }

    if (step === 2) {
      if (!title.trim()) return setMsg("Title is required.");
      if (title.trim().length > 200) {
        return setMsg("Title must be 200 characters or less.");
      }
      if (!body.trim()) return setMsg("Description is required.");
      if (!age.trim() || isNaN(Number(age)) || Number(age) < 18) {
        return setMsg("Age is required (18+).");
      }
      if (!sex.trim()) return setMsg("Sex is required.");
      if (!orientation) return setMsg("Please select sexual orientation.");
      if (!locationText.trim()) return setMsg("Location text is required.");
    }

    if (step === 3) {
      if (imageUrls.length < 3) return setMsg("Please upload at least 3 photos.");
      if (imageUrls.length > 5) return setMsg("Maximum is 5 photos.");
    }

    if (step === 4) {
      const n = countContacts({ phone, email, whatsapp, snapchat });
      if (n < 2) return setMsg("Please add at least 2 contact methods.");
    }

    setStep((s) => Math.min(5, s + 1));
  }

  function back() {
    setMsg(null);
    setStep((s) => Math.max(1, s - 1));
  }

  async function saveChanges() {
    setMsg(null);

    if (!requiredProfileOk) {
      setOverlay({
        type: "profile",
        message:
          "Complete your profile (bio, 3–5 photos, contact info, and location) before editing your ad.",
      });
      return;
    }

    setOverlay({ type: "saving" });

    try {
      const res = await fetch("/api/account/ad/update", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          adId: ad.id,
          stateSlug,
          citySlug,
          categorySlug,
          title,
          body,
          sex,
          age,
          orientation,
          locationText,
          imageUrls,
          phone,
          email,
          whatsapp,
          snapchat,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setOverlay(null);
        setMsg(data?.error || "Failed to save changes.");
        return;
      }

      setOverlay(null);
      setSuccess(true);
    } catch {
      setOverlay(null);
      setMsg("Failed to save changes. Please try again.");
    }
  }

  function removeImageUrl(url: string) {
    setImageUrls((prev) => prev.filter((x) => x !== url));
  }

  if (success) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
          <div className="text-xl font-semibold">Ad updated successfully ✅</div>
          <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Your changes have been saved.
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                startLoading();
                router.push("/account/ads");
              }}
              className="rounded-lg border px-4 py-2 text-sm font-semibold gold-border transition-all duration-200 hover:bg-[rgba(212,175,55,0.10)] active:scale-95 active:opacity-80"
            >
              Back to Manage Ads
            </button>

            <button
              type="button"
              onClick={() => {
                startLoading();
                router.push("/account");
              }}
              className="rounded-lg border px-4 py-2 text-sm font-semibold transition-all duration-200 hover:bg-zinc-50 active:scale-95 active:opacity-80 dark:hover:bg-zinc-800/60"
            >
              Go to My Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-6">
      {overlay?.type === "saving" ? (
        <LoadingOverlay label="Saving your changes..." />
      ) : null}

      {overlay?.type === "profile" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
            <div className="text-lg font-semibold">Profile required</div>
            <div className="mt-2 text-sm">{overlay.message}</div>

            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOverlay(null)}
                className="rounded-lg border px-4 py-2 text-sm font-semibold transition-all duration-200 hover:bg-zinc-50 active:scale-95 active:opacity-80 dark:hover:bg-zinc-800/60"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  startLoading();
                  router.push("/account/profile/edit");
                }}
                className="rounded-lg border px-4 py-2 text-sm font-semibold gold-border transition-all duration-200 hover:bg-[rgba(212,175,55,0.10)] active:scale-95 active:opacity-80"
              >
                Complete profile
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div>
        <h1 className="text-2xl font-bold">Edit Ad</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Step {step} of 5 • Status: {ad.status} • Duration: {ad.durationDays} days
          {" • "}Wallet: {walletCredits} credits
        </p>
      </div>

      {!requiredProfileOk ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          <div className="font-semibold">
            Editing is locked until you complete your profile:
          </div>
          <button
            type="button"
            onClick={() => {
              startLoading();
              router.push("/account/profile/edit");
            }}
            className="mt-3 rounded-lg border px-3 py-2 text-xs font-semibold gold-border transition-all duration-200 hover:bg-[rgba(212,175,55,0.10)] active:scale-95 active:opacity-80"
          >
            Complete profile
          </button>
        </div>
      ) : null}

      {msg ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-200">
          {msg}
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="block text-s font-semibold">State</label>
              <select
                value={stateSlug}
                onChange={(e) => {
                  setStateSlug(e.target.value);
                  setCitySlug("");
                }}
                className="mt-1 w-full rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-800"
              >
                <option value="">Select state</option>
                {NG_STATES.map((label) => (
                  <option key={label} value={slugify(label)}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-s font-semibold">City</label>
              <select
                value={citySlug}
                onChange={(e) => setCitySlug(e.target.value)}
                disabled={!stateSlug}
                className="mt-1 w-full rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-800"
              >
                <option value="">
                  {stateSlug ? "Select city" : "Select state first"}
                </option>
                {cityOptions.map((label) => (
                  <option key={label} value={slugify(label)}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-s font-semibold">Category</label>
              <select
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-800"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c.toLowerCase().replace(/\s+/g, "-")}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-4">
          <div>
            <label className="block text-s font-semibold">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 200))}
              className="mt-1 w-full rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-800"
              placeholder="Short catchy title"
            />
            <div className="mt-1 text-[11px]">{title.length}/200</div>
          </div>

          <div>
            <label className="block text-s font-semibold">Description</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="mt-1 w-full rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-800"
              placeholder="Describe your service clearly…"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <label className="block text-s font-semibold">Age (18+)</label>
              <input
                value={age}
                onChange={(e) => setAge(e.target.value.replace(/[^\d]/g, ""))}
                className="mt-1 w-full rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-800"
                placeholder="e.g. 25"
              />
            </div>

            <div>
              <label className="block text-s font-semibold">Sex</label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as SexValue)}
                className="mt-1 w-full rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-800"
              >
                {SEX_OPTIONS.map((option) => (
                  <option
                    key={option.value || "placeholder"}
                    value={option.value}
                    disabled={option.value === ""}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold">
                Sexual orientation
              </label>
              <select
                value={orientation}
                onChange={(e) =>
                  setOrientation(e.target.value as OrientationValue)
                }
                className="mt-1 w-full rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-800"
              >
                {ORIENTATION_OPTIONS.map((o) => (
                  <option
                    key={o.value || "placeholder"}
                    value={o.value}
                    disabled={o.value === ""}
                  >
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-s font-semibold">Location text</label>
              <input
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-800"
                placeholder="e.g. Ikeja, Lagos"
              />
            </div>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-8">
          <div className="p-4 space-y-8">
            <div className="text-s font-bold py-3">Photos (min 3 • max 5)</div>

            <div className="flex flex-wrap items-center gap-3">
              <label
                className={[
                  "inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-semibold gold-border",
                  busy
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer hover:bg-[rgba(212,175,55,0.10)]",
                ].join(" ")}
              >
                {busy ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-transparent dark:border-zinc-700" />
                    Uploading...
                  </span>
                ) : (
                  "Add photos"
                )}

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={busy}
                  onChange={async (e) => {
                    const files = Array.from(e.target.files ?? []);
                    e.target.value = "";

                    if (!files.length) return;

                    const remaining = Math.max(0, 5 - imageUrls.length);
                    const toUpload = files.slice(0, remaining);

                    if (remaining === 0) {
                      setMsg("Maximum is 5 photos.");
                      return;
                    }

                    setBusy(true);
                    setMsg(null);

                    try {
                      for (const file of toUpload) {
                        const fd = new FormData();
                        fd.append("files", file);

                        const res = await fetch("/api/ad-photos", {
                          method: "POST",
                          body: fd,
                        });

                        const data = await res.json().catch(() => ({}));
                        if (!res.ok) {
                          setMsg(data?.error || "Upload failed.");
                          break;
                        }

                        const urls: string[] = Array.isArray(data?.urls)
                          ? data.urls
                          : [];
                        if (urls.length) {
                          setImageUrls((prev) => [...prev, ...urls].slice(0, 5));
                        }
                      }
                    } finally {
                      setBusy(false);
                    }
                  }}
                />
              </label>

              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                {busy ? (
                  "Uploading selected photos..."
                ) : (
                  <>
                    Upload <span className="font-semibold">3–5</span> photos.
                    First 3 required.
                  </>
                )}
              </div>
            </div>

            {imageUrls.length ? (
              <div className="space-y-2">
                {imageUrls.map((u) => (
                  <div
                    key={u}
                    className="flex items-center justify-between gap-3 rounded-xl border p-3"
                  >
                    <div className="truncate text-xs text-zinc-700 dark:text-zinc-300">
                      {u}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImageUrl(u)}
                      className="text-xs font-semibold text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                No photos added yet.
              </div>
            )}
          </div>

          <div
            style={{ backgroundColor: "rgba(212,175,55,0.10)" }}
            className="rounded-2xl p-4 space-y-2"
          >
            <div className="text-s font-bold">Plan summary</div>
            <div className="text-sm">
              Featured:{" "}
              <span className="font-semibold">
                {ad.featured ? "Yes" : "No"}
              </span>
            </div>
            <div className="text-sm">
              Duration:{" "}
              <span className="font-semibold">{ad.durationDays} days</span>
            </div>
            <div className="text-xs">
              Pricing options are not changed from the edit form.
            </div>
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-4">
          <div className="text-sm">
            Add at least <span className="font-semibold">2</span> contact methods.
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold py-3">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 p-3 text-sm text-zinc-900 dark:border-zinc-800"
                placeholder="+234..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold py-3">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 p-3 text-sm text-zinc-900 dark:border-zinc-800"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold py-3">WhatsApp</label>
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 p-3 text-sm text-zinc-900 dark:border-zinc-800"
                placeholder="@handle or number"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold py-3">Snapchat</label>
              <input
                value={snapchat}
                onChange={(e) => setSnapchat(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 p-3 text-sm text-zinc-900 dark:border-zinc-800"
                placeholder="@snap"
              />
            </div>
          </div>

          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            Contacts provided: {countContacts({ phone, email, whatsapp, snapchat })}/4
            (minimum 2)
          </div>
        </div>
      ) : null}

      {step === 5 ? (
        <div className="space-y-6">
          <AdPreview
            title={title}
            description={body}
            stateLabel={stateSlug}
            cityLabel={citySlug}
            categoryLabel={categorySlug}
            sex={sex}
            age={age}
            orientation={orientation}
            locationText={locationText}
            imageUrls={imageUrls}
            phone={phone}
            email={email}
            whatsapp={whatsapp}
            snapchat={snapchat}
            featured={ad.featured}
            expiresDays={ad.durationDays}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                startLoading();
                router.push("/account/ads");
              }}
              className="w-full rounded-lg border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-600 transition-all duration-200 hover:bg-red-700/80 hover:text-zinc-100 active:scale-95 active:opacity-80 sm:w-auto"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={saveChanges}
              disabled={busy}
              className="w-full rounded-lg border border-emerald-500/40 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-800/90 hover:text-zinc-100 disabled:opacity-60 sm:w-auto"
            >
              {busy ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      ) : null}

      {step !== 5 ? (
        <div className="flex justify-between gap-3">
          <button
            type="button"
            onClick={back}
            className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-zinc-600/60"
          >
            Back
          </button>

          <button
            type="button"
            onClick={next}
            className="rounded-lg border px-4 py-2 text-sm font-semibold gold-border hover:bg-amber-600/60"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}