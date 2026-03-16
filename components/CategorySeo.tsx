type Props = {
  city: string;
  state: string;
};

export default function CategorySeo({ city, state }: Props) {
  return (
    <div className="card mt-8 p-5 text-sm leading-6">
      <h2 className="text-base font-semibold mb-2 gold-text">
        Find verified private connections in {city}, {state}
      </h2>

      <p className="mb-3">
        Looking to meet new people, explore discreet companionship, or enjoy
        private experiences in {city}? SecretLink connects verified adults in{" "}
        {city}, {state} through a secure and modern platform designed for
        privacy, safety and authenticity.
      </p>

      <p className="mb-3">
        Our platform allows you to browse real profiles, discover trusted
        listings, and communicate directly with individuals in your area.
        Whether you are interested in companionship, massage services,
        friendships, casual dating or meaningful private encounters, SecretLink
        offers a structured and easy-to-use directory.
      </p>

      <p className="mb-3">
        Every verified profile displays a blue badge to help reduce scams and
        improve trust. We also provide tools that help users stay safe while
        maintaining discretion. You can connect using phone, email or WhatsApp
        where available.
      </p>

      <p>
        Start exploring today and discover trusted listings in {city}, {state}.
        SecretLink is designed to give you control, privacy and confidence when
        making private connections.
      </p>
    </div>
  );
}