export type AdStatus = "ACTIVE" | "EXPIRED" | "REMOVED";

export type AdRecord = {
  id: string;
  username: string;
  userSlug: string;
  verified: boolean;
  postedAt: string;
  title: string;

  state: string;
  city: string;
  category: string;

  images: string[];
  details: {
    sex: string;
    age: number;
    orientation: string;
    location: string;
  };
  body: string;
  contact: {
    phone?: string;
    email?: string;
    whatsapp?: string;
    snapchat?: string;
  };

  status: AdStatus;
  featured?: boolean;
};

const ADS: AdRecord[] = [
  {
    id: "f-1",
    username: "GoldGoddess",
    userSlug: "goldgoddess",
    verified: true,
    postedAt: "19 hours ago",
    title: "Premium discreet service • classy & verified",
    state: "Lagos",
    city: "Ikeja",
    category: "Female Escorts",
    images: ["/mock/ad1.jpg", "/mock/ad2.jpg", "/mock/ad3.jpg"],
    details: {
      sex: "Female",
      age: 26,
      orientation: "Heterosexual / Straight",
      location: "Ikeja, Lagos",
    },
    body: "This is the main subject/body.\nPoster can write anything here.",
    contact: {
      phone: "+234 000 000 0000",
      email: "hello@example.com",
      whatsapp: "2340000000000",
      snapchat: "gold.snap",
    },
    status: "ACTIVE",
    featured: true,
  },
  {
    id: "a-1",
    username: "NinaLuxe",
    userSlug: "ninaluxe",
    verified: false,
    postedAt: "1 hour ago",
    title: "New in town • soft vibes • serious only",
    state: "Lagos",
    city: "Ikeja",
    category: "Female Escorts",
    images: ["/mock/ad1.jpg"],
    details: {
      sex: "Female",
      age: 24,
      orientation: "Straight",
      location: "Ikeja, Lagos",
    },
    body: "Sample ad details page. Later this content will come from the database.",
    contact: {
      phone: "+234 000 000 0000",
      whatsapp: "2340000000000",
      snapchat: "nina.snap",
    },
    status: "ACTIVE",
  },
  {
    id: "a-2",
    username: "JayMassage",
    userSlug: "jaymassage",
    verified: true,
    postedAt: "Yesterday",
    title: "Relaxing massage • private studio • clean",
    state: "Lagos",
    city: "Ikeja",
    category: "Male Massage",
    images: [],
    details: {
      sex: "Male",
      age: 29,
      orientation: "Straight",
      location: "Ikeja, Lagos",
    },
    body: "Sample massage ad. Later: services list, availability, location hints.",
    contact: {
      phone: "+234 000 000 0000",
      whatsapp: "2340000000000",
    },
    status: "ACTIVE",
  },
];

function normalizeId(raw: string) {
  let s = String(raw ?? "");
  try {
    s = decodeURIComponent(s);
  } catch {}
  s = s.split("?")[0].split("#")[0];
  s = s.replace(/\/+$/, "").trim();
  return s;
}

export function getAdsList(): AdRecord[] {
  return ADS.filter((a) => a.status === "ACTIVE");
}

export function getAdById(id: string): AdRecord | null {
  const nid = normalizeId(id);
  return ADS.find((a) => a.id === nid) ?? null;
}