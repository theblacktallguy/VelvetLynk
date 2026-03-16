export default function NoAds() {
  return (
    <div className="card p-6 text-center" style={{ backgroundColor: "rgba(212,175,55,0.10)" }}>
      <div className="text-base font-semibold">No matching ads</div>
      <div className="mt-2 text-sm ">
        Try another category or choose a different city.
      </div>
    </div>
  );
}