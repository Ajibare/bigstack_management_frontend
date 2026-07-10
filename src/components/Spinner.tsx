export default function Spinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="spinner" aria-hidden="true" />
      <p className="text-sm text-gray-400 animate-pulse">{label}</p>
    </div>
  );
}
