export default function CollectionSearch({ value, onChange, placeholder = 'Search this collection' }) {
  return (
    <label className="relative block w-full md:w-72">
      <span className="sr-only">{placeholder}</span>
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/50">⌕</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-ink/15 bg-cream py-3 pl-10 pr-4 text-xs placeholder:text-ink/45 focus:border-cherry focus:outline-none focus:ring-4 focus:ring-cherry/10"
      />
    </label>
  );
}
