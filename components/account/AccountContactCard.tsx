import {
  Mail,
  Phone,
  MessageCircle,
  Ghost,
  Instagram,
  Globe,
} from "lucide-react";
import LoadingLink from "@/components/navigation/LoadingLink";

type Contact = {
  email?: string;
  phone?: string;
  whatsapp?: string; // digits preferred
  snapchat?: string;
  instagram?: string; // username
  website?: string; // full url
};

function Field({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  href?: string;
}) {
  const v = (value ?? "").trim();
  const has = v.length > 0;

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border p-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="">{icon}</span>

        <div className="min-w-0">
          <div className="text-xs font-semibold ">
            {label}
          </div>
          <div className="truncate text-sm text-zinc-800 dark:text-zinc-400">
            {has ? v : <span className="text-zinc-500 dark:text-zinc-400">Not set</span>}
          </div>
        </div>
      </div>

      {has && href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-xs underline hover:text-zinc-900  dark:hover:text-zinc-400"
        >
          Open
        </a>
      ) : null}
    </div>
  );
}

export default function AccountContactCard({ contact }: { contact: Contact }) {
  const email = (contact.email ?? "").trim();
  const phone = (contact.phone ?? "").trim();
  const whatsappRaw = (contact.whatsapp ?? "").trim();
  const whatsapp = whatsappRaw.replace(/\D/g, "");
  const snapchat = (contact.snapchat ?? "").trim();
  const instagram = (contact.instagram ?? "").trim();
  const website = (contact.website ?? "").trim();

  const websiteHref =
    website && !/^https?:\/\//i.test(website) ? `https://${website}` : website;

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-s font-bold">
            Contact & Socials
          </div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Add links so clients can reach you quickly.
          </div>
        </div>

        <LoadingLink
          href="/account/profile/edit"
          className="rounded-lg border px-3 py-2 text-xs font-semibold gold-border transition-all duration-200 hover:bg-amber-600/60 active:scale-95 active:opacity-80"
        >
          Edit
        </LoadingLink>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field
          icon={<Mail className="h-4 w-4" />}
          label="Email"
          value={email}
          href={email ? `mailto:${email}` : undefined}
        />

        <Field
          icon={<Phone className="h-4 w-4" />}
          label="Phone"
          value={phone}
          href={phone ? `tel:${phone}` : undefined}
        />

        <Field
          icon={<MessageCircle className="h-4 w-4" />}
          label="WhatsApp"
          value={whatsappRaw}
          href={whatsapp ? `https://wa.me/${whatsapp}` : undefined}
        />

        <Field
          icon={<Ghost className="h-4 w-4" />}
          label="Snapchat"
          value={snapchat}
          href={
            snapchat
              ? `https://www.snapchat.com/add/${encodeURIComponent(snapchat)}`
              : undefined
          }
        />

        <Field
          icon={<Instagram className="h-4 w-4" />}
          label="Instagram"
          value={instagram}
          href={
            instagram
              ? `https://instagram.com/${encodeURIComponent(instagram)}`
              : undefined
          }
        />

        <Field
          icon={<Globe className="h-4 w-4" />}
          label="Website"
          value={website}
          href={websiteHref || undefined}
        />
      </div>
    </div>
  );
}