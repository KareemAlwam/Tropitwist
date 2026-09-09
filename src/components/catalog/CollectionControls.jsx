import { useState } from 'react';
import { SORT_OPTIONS } from '../../constants/catalog';
import CollectionSearch from '../ui/CollectionSearch';

export default function CollectionControls({ filters, state, placeholder }) {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const selectedSort = SORT_OPTIONS.find((option) => option.value === state.sort) || SORT_OPTIONS[0];

  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center">
      <CollectionSearch value={state.query} onChange={state.setQuery} placeholder={placeholder} />
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => (
          <button
            type="button"
            key={filter}
            onClick={() => state.setActiveFilter(filter)}
            className={`rounded-full px-4 py-2.5 text-xs font-bold tracking-widest transition-colors ${state.activeFilter === filter ? 'bg-banana text-ink' : 'border border-ink/15 bg-cream text-ink hover:border-banana hover:bg-banana'}`}
          >
            {filter}
          </button>
        ))}
        <div className="relative w-full sm:ml-auto sm:w-auto">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={isSortOpen}
            onClick={() => setIsSortOpen((open) => !open)}
            className="w-full rounded-full border border-ink/15 bg-cream px-4 py-2.5 text-xs font-bold tracking-widest text-ink transition-colors hover:border-banana hover:bg-banana sm:w-auto"
          >
            SORT: {selectedSort.label.toUpperCase()} <span className="ml-1">⌄</span>
          </button>
          {isSortOpen && (
            <div role="listbox" aria-label="Sort products" className="absolute right-0 z-20 mt-2 min-w-48 overflow-hidden rounded-brand border border-ink/10 bg-cream p-1 shadow-lg">
              {SORT_OPTIONS.map((option) => (
                <button
                  type="button"
                  role="option"
                  aria-selected={state.sort === option.value}
                  key={option.value}
                  onClick={() => {
                    state.setSort(option.value);
                    setIsSortOpen(false);
                  }}
                  className={`block w-full rounded-xl px-4 py-3 text-left text-xs font-bold tracking-widest transition-colors ${state.sort === option.value ? 'bg-banana text-ink' : 'text-ink hover:bg-banana/60'}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
