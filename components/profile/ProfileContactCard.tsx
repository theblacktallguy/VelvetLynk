type Props = {
  phone?: string;
  email?: string;
  whatsapp?: string; // use 234xxxxxxxxxx or full link later
  socials?: Partial<{
    whatsapp: string;
    instagram: string;
    snapchat: string;
    telegram: string;
  }>;
};

function Icon({ name }: { name: "whatsapp" | "instagram" | "snapchat" | "telegram" }) {
  // simple inline icons (no external libs)
  const common = "h-5 w-5";
  if (name === "whatsapp")
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none">
        <path
          d="M20 11.9a8 8 0 10-15.1 3.7L4 20l4.6-1.2A8 8 0 0020 11.9z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M9.6 9.3c.2-.5.4-.5.6-.5h.5c.2 0 .4 0 .5.3l.7 1.7c.1.2.1.4 0 .5l-.4.5c-.1.1-.1.3 0 .5.3.7 1.2 1.6 2 2 .2.1.4.1.5 0l.6-.4c.1-.1.3-.1.5 0l1.7.8c.2.1.3.3.3.5 0 .6-.3 1.2-.9 1.4-.6.2-1.7.3-3.3-.3-1.6-.6-3.5-2.4-4.3-4-.8-1.6-.6-2.7-.4-3.2z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );

  if (name === "instagram")
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none">
        <path
          d="M7 7a4 4 0 014-4h2a4 4 0 014 4v2a4 4 0 01-4 4h-2a4 4 0 01-4-4V7z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M9.5 12a2.5 2.5 0 105 0 2.5 2.5 0 00-5 0z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M15.8 8.2h.01"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M7 17a4 4 0 004 4h2a4 4 0 004-4v-2"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </svg>
    );

  if (name === "snapchat")
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3c2.6 0 4.6 2.1 4.6 4.7v2.2c0 1.2.8 1.6 1.6 1.9.7.3 1.2.6 1.2 1.2 0 .7-.8 1-1.6 1.3-.7.3-1.5.6-1.8 1.4-.3.9.2 1.8-1 2.1-.8.2-1.6-.2-3 .9-.9.7-1 .9-1.9.9s-1-.2-1.9-.9c-1.4-1.1-2.2-.7-3-.9-1.2-.3-.7-1.2-1-2.1-.3-.8-1.1-1.1-1.8-1.4-.8-.3-1.6-.6-1.6-1.3 0-.6.5-.9 1.2-1.2.8-.3 1.6-.7 1.6-1.9V7.7C7.4 5.1 9.4 3 12 3z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    );

  // telegram
  return (
    <svg className={common} viewBox="0 0 24 24" fill="none">
      <path
        d="M21 4L3.6 11.2c-.7.3-.6 1.3.1 1.5l4.6 1.4 1.7 5.2c.2.7 1.1.8 1.5.2l2.6-3.3 4.6 3.4c.5.4 1.2.1 1.3-.5L22 5.2c.1-.9-.6-1.6-1-1.2z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M8.3 14.1L20.2 6.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ExternalIconLink({
  href,
  name,
}: {
  href: string;
  name: "whatsapp" | "instagram" | "snapchat" | "telegram";
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-center rounded-xl border p-3 hover:bg-[rgba(212,175,55,0.10)]"
      aria-label={name}
      title={name}
    >
      <Icon name={name} />
    </a>
  );
}

export default function ProfileContactCard({
  phone,
  email,
  whatsapp,
  socials,
}: Props) {
  const waHref =
    socials?.whatsapp ||
    (whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, "")}` : "");

  return (
    <div className="card mt-6 p-4">
      <div className="text-s font-bold">
        Contact
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border p-3">
          <div className="text-xs font-semibold">
            Phone
          </div>
          <div className="mt-1 text-sm text-zinc-800 dark:text-zinc-400">
            {phone || "—"}
          </div>
        </div>

        <div className="rounded-xl border p-3">
          <div className="text-xs font-semibold ">
            Email
          </div>
          <div className="mt-1 text-sm text-zinc-800 dark:text-zinc-400">
            {email || "—"}
          </div>
        </div>

        <div className="rounded-xl border p-3">
          <div className="text-xs font-semibold">
            WhatsApp
          </div>
          <div className="mt-1 text-sm text-zinc-800 dark:text-zinc-400">
            {waHref ? (
              <a
                href={waHref}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                Chat on WhatsApp
              </a>
            ) : (
              <span className="text-zinc-800 dark:text-zinc-200">—</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-xs font-semibold ">
          Socials
        </div>

        <div className="mt-2 flex flex-wrap gap-3">
          {waHref && <ExternalIconLink href={waHref} name="whatsapp" />}
          {socials?.instagram && (
            <ExternalIconLink href={socials.instagram} name="instagram" />
          )}
          {socials?.snapchat && (
            <ExternalIconLink href={socials.snapchat} name="snapchat" />
          )}
          {socials?.telegram && (
            <ExternalIconLink href={socials.telegram} name="telegram" />
          )}

          {/* If none linked */}
          {!waHref &&
            !socials?.instagram &&
            !socials?.snapchat &&
            !socials?.telegram && (
              <div className="text-sm text-zinc-600 dark:text-zinc-500">
                No social links added.
              </div>
            )}
        </div>
      </div>
    </div>
  );
}