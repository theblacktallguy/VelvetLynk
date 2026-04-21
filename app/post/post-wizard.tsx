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

type Prefill = {
  phone: string;
  email: string;
  whatsapp: string;
  snapchat: string;
  state: string;
  city: string;
};

const BASE_COST = 650;
const FEATURED_COST = 1000;
const EXTENDED_COST = 600;

const BASE_DAYS = 10;
const EXTENDED_DAYS = 20;

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

export default function PostWizard({
  gating,
  walletCredits,
  profilePrefill,
}: {
  gating: Gating;
  walletCredits: number;
  profilePrefill: Prefill;
}) {
  const router = useRouter();
const { startLoading } = useRouteLoading();
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [overlay, setOverlay] = useState<
    null | { type: "publishing" } | { type: "profile"; message: string }
  >(null);

  const [successAdId, setSuccessAdId] = useState<string | null>(null);

  // Step 1
  const [stateSlug, setStateSlug] = useState(
    profilePrefill.state ? slugify(profilePrefill.state) : ""
  );
  const [citySlug, setCitySlug] = useState(
    profilePrefill.city ? slugify(profilePrefill.city) : ""
  );
  const [categorySlug, setCategorySlug] = useState<string>("");
  const cityOptions = useMemo(() => citiesForStateSlug(stateSlug), [stateSlug]);

  // Step 2 (all required)
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [age, setAge] = useState<string>("");
  const [sex, setSex] = useState<SexValue>("");
  const [orientation, setOrientation] = useState<OrientationValue>("");
  const [locationText, setLocationText] = useState("");

  // Step 3 photos (required 3-5)
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [featured, setFeatured] = useState<"YES" | "NO">("NO");
  const [extended, setExtended] = useState<"YES" | "NO">("NO");

  // Step 4 contact (min 2 required)
  const [phone, setPhone] = useState(profilePrefill.phone || "");
  const [email, setEmail] = useState(profilePrefill.email || "");
  const [whatsapp, setWhatsapp] = useState(profilePrefill.whatsapp || "");
  const [snapchat, setSnapchat] = useState(profilePrefill.snapchat || "");

  const requiredProfileOk =
    gating.bioOk && gating.photosOk && gating.contactOk && gating.locationOk;

  const expiresDays = extended === "YES" ? EXTENDED_DAYS : BASE_DAYS;

  const totalCost = useMemo(() => {
    let total = BASE_COST;
    if (featured === "YES") total += FEATURED_COST;
    if (extended === "YES") total += EXTENDED_COST;
    return total;
  }, [featured, extended]);

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

  async function publish() {
    setMsg(null);
    setOverlay({ type: "publishing" });

    try {
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
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
          featured: featured === "YES",
          expiresDays,
          phone,
          email,
          whatsapp,
          snapchat,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 403 && data?.code === "PROFILE_INCOMPLETE") {
        setOverlay({
          type: "profile",
          message:
            "Complete your profile (bio, 3–5 photos, contact info, and location) before posting.",
        });
        return;
      }

      if (res.status === 403 && data?.code === "EMAIL_NOT_VERIFIED") {
        setOverlay(null);
        setMsg(
          data?.error ||
            "Please verify your email address before posting an ad."
        );
        return;
      }

      if (res.status === 402 && data?.code === "INSUFFICIENT_CREDITS") {
        setOverlay(null);
        setMsg(
          data?.error ||
            `You do not have enough credits to publish this ad.`
        );
        return;
      }

      if (!res.ok) {
        setOverlay(null);
        setMsg(data?.error || "Failed to publish.");
        return;
      }

      setOverlay(null);
      setSuccessAdId(String(data?.adId || ""));
    } catch {
      setOverlay(null);
      setMsg("Failed to publish. Please try again.");
    }
  }

  function addImageUrl(url: string) {
    const u = url.trim();
    if (!u) return;
    setImageUrls((prev) => [...prev, u].slice(0, 5));
  }

  function removeImageUrl(url: string) {
    setImageUrls((prev) => prev.filter((x) => x !== url));
  }

  if (successAdId) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-3">
          <div className="text-xl font-semibold ">
            Ad posted successfully ✅
          </div>
          <div className="text-sm">
            Your ad is now live.
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end pt-2">
            <button
              type="button"
              onClick={() => {
                startLoading();
                router.push("/account");
              }}
              className="rounded-lg border px-4 py-2 text-sm font-semibold gold-border transition-all duration-200 hover:bg-[rgba(212,175,55,0.10)] active:scale-95 active:opacity-80"
            >
              Go to my account
            </button>

            <button
              type="button"
              onClick={() => {
                setSuccessAdId(null);
                setStep(1);
              }}
              className="rounded-lg border px-4 py-2 text-sm font-semibold"
            >
              Post another ad
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-6">
      {overlay?.type === "publishing" ? (
        <LoadingOverlay label="Publishing your ad..." />
      ) : null}

      {overlay?.type === "profile" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
            <div className="text-lg font-semibold">
              Profile required
            </div>
            <div className="mt-2 text-sm ">
              {overlay.message}
            </div>

            <div className="mt-4 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setOverlay(null)}
                className="rounded-lg border px-4 py-2 text-sm font-semibold"
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
        <h1 className="text-2xl font-bold">Post Ad</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Step {step} of 5 • Expiry: {expiresDays} days • Total cost: {totalCost} credits
        </p>
      </div>

      {!requiredProfileOk ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          <div className="font-semibold">
            Posting is locked until you complete your profile:
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
                required
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
                required
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
                  busy ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-[rgba(212,175,55,0.10)]",
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

                        const urls: string[] = Array.isArray(data?.urls) ? data.urls : [];
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
                {busy ? "Uploading selected photos..." : <>Upload <span className="font-semibold">3–5</span> photos. First 3 required.</>}
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

          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 space-y-3">
              <div className="text-s font-bold">Promote your ad</div>
              <div className="text-xs">
                Featured ads are placed top-most in each category and are shown highlighted.
              </div>

              <div>
                <label className="block text-s py-3">Featured Ad</label>
                <select
                  value={featured}
                  onChange={(e) => setFeatured(e.target.value as "YES" | "NO")}
                  className="mt-1 w-full rounded-xl border p-3 text-sm"
                >
                  <option value="NO">No</option>
                  <option value="YES">Yes (+{FEATURED_COST} credits)</option>
                </select>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="text-s font-bold">Extended Ad</div>
              <div className="text-xs">
                Want your ad running longer? Extend the duration.
              </div>

              <div>
                <label className="block text-s py-3">Extend duration</label>
                <select
                  value={extended}
                  onChange={(e) => setExtended(e.target.value as "YES" | "NO")}
                  className="mt-1 w-full rounded-xl border p-3 text-sm"
                >
                  <option value="NO">No (10 days)</option>
                  <option value="YES">
                    Yes (+{EXTENDED_COST} credits, 20 days)
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div
            style={{ backgroundColor: "rgba(212,175,55,0.10)" }}
            className="rounded-2xl p-4 space-y-2"
          >
            <div className="text-s font-bold">Cost summary</div>
            <div className="text-sm">
              You will be charged <span className="font-semibold">{BASE_COST}</span>{" "}
              credits for making a post to this section.
            </div>
            <div className="text-sm">
              This ad will be displayed for{" "}
              <span className="font-semibold">{expiresDays} days</span>.
            </div>

            <div className="mt-2 text-xs">
              Total: <span className="font-semibold">{totalCost}</span> credits •
              Your wallet: {walletCredits} credits
            </div>

            <div className="text-xs">
              Buy any Extended or Featured plan above to increase placement or duration.
            </div>
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-4">
          <div className="text-sm">
            Add at least <span className="font-semibold">2</span> contact methods.
            Prefilled from your profile.
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
            featured={featured === "YES"}
            expiresDays={expiresDays}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                startLoading();
                router.push("/account");
              }}
              className="w-full sm:w-auto rounded-lg border px-4 py-2 text-sm font-semibold text-red-600 border-red-500/40 transition-all duration-200 hover:bg-red-500/10 active:scale-95 active:opacity-80"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={publish}
              disabled={busy}
              className="w-full rounded-lg border border-emerald-500/40 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-800/90 hover:text-zinc-100 disabled:opacity-60 sm:w-auto"
            >
              {busy ? "Publishing..." : "Publish"}
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