import LocationSearch from "./LocationSearch";
import TopLinks from "./TopLinks";

export default function TopRow() {
  return (
    <div className="mt-6 flex items-center gap-2">
      {/* Left half: Search */}
      <div className="w-1/2">
        <LocationSearch />
      </div>

      {/* Right half: My Account + Post Ad */}
      <div className="w-1/2">
        <TopLinks />
      </div>
    </div>
  );
}