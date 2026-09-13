export default function ProductGridSkeleton({ count = 3 }) {
  return (
    <div role="status" aria-label="Loading products" aria-busy="true" className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} aria-hidden="true" className="animate-pulse">
          <div className="aspect-[4/5] rounded-brand bg-[#FFF1D8]" />
          <div className="mt-4 flex items-start justify-between gap-4">
            <div className="space-y-2"><div className="h-4 w-32 rounded bg-ink/10" /><div className="h-3 w-20 rounded bg-ink/10" /></div>
            <div className="h-4 w-14 rounded bg-ink/10" />
          </div>
          <div className="mt-4 h-11 rounded-full bg-ink/10" />
        </div>
      ))}
    </div>
  );
}
