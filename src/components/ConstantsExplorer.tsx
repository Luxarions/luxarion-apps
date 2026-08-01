import React, { useState } from 'react';
import { Constants } from '../luxarion';
import { Search, BookOpen, Hash, Tag, Layers } from 'lucide-react';

export const ConstantsExplorer: React.FC = () => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const allEntries = Object.entries(Constants).filter(
    ([key]) => typeof Constants[key as keyof typeof Constants] !== 'function'
  );

  const getCategory = (key: string): string => {
    if (key.includes('DEPTH')) return 'DEPTH';
    if (key.includes('BLEND')) return 'BLENDING';
    if (key.includes('TONE')) return 'TONE_MAPPING';
    if (key.includes('FORMAT') || key.includes('PIXEL')) return 'PIXEL_FORMATS';
    if (key.includes('KEY_')) return 'KEYBOARD';
    if (key.includes('MOUSE_')) return 'MOUSE';
    if (key.includes('ERR_') || key === 'OK' || key === 'FAILED') return 'RESULT_CODES';
    if (key.includes('PROPERTY_')) return 'PROPERTY_HINTS';
    if (key.includes('TYPE_')) return 'VARIANT_TYPES';
    if (key.includes('SECURITY_')) return 'SECURITY';
    return 'GENERAL';
  };

  const categories = ['ALL', 'DEPTH', 'BLENDING', 'TONE_MAPPING', 'PIXEL_FORMATS', 'KEYBOARD', 'MOUSE', 'RESULT_CODES', 'PROPERTY_HINTS', 'VARIANT_TYPES', 'SECURITY'];

  const filteredEntries = allEntries.filter(([key, value]) => {
    const cat = getCategory(key);
    const matchesCat = categoryFilter === 'ALL' || cat === categoryFilter;
    const matchesSearch = key.toLowerCase().includes(search.toLowerCase()) || String(value).toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            id="input-search-constants"
            type="text"
            placeholder="Search 300+ Luxarion Constants (e.g. DEPTH, BLEND, KEY_ENTER)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <BookOpen size={16} className="text-cyan-400" />
          <span>Showing <strong className="text-cyan-300">{filteredEntries.length}</strong> / {allEntries.length} Constants</span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            id={`btn-cat-${cat}`}
            onClick={() => setCategoryFilter(cat)}
            className={`py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              categoryFilter === cat
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md font-bold'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Constants Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[550px] overflow-y-auto pr-1">
        {filteredEntries.map(([key, value]) => {
          const displayVal = typeof value === 'object' ? JSON.stringify(value) : String(value);
          const cat = getCategory(key);
          return (
            <div
              key={key}
              className="bg-slate-900/80 border border-slate-800/90 hover:border-cyan-500/40 rounded-xl p-3 flex flex-col justify-between space-y-2 transition-all group"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-mono font-bold text-slate-200 group-hover:text-cyan-300 break-all">
                  {key}
                </span>
                <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-950 text-slate-500 border border-slate-800">
                  {cat}
                </span>
              </div>

              <div className="bg-slate-950 border border-slate-800/80 rounded-lg px-2.5 py-1.5 font-mono text-xs text-cyan-400 overflow-x-auto">
                {displayVal}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
