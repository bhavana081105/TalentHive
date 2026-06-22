import React, { useState, useMemo, useEffect } from 'react';
import { 
  MapPin, 
  SlidersHorizontal, 
  Search, 
  Star, 
  Grid, 
  List, 
  X, 
  DollarSign, 
  Filter, 
  ChevronRight, 
  Users 
} from 'lucide-react';
import { WorkerProfile } from '../types';

interface CustomerHomeProps {
  workers: WorkerProfile[];
  onSelectWorker: (worker: WorkerProfile) => void;
  initialSearchQuery?: string;
  onClearSearch?: () => void;
  isSearchPage?: boolean;
}

// Pre-defined list of talent/skill categories
const CATEGORIES_LIST = [
  'Music',
  'Dance',
  'Photography',
  'Visual Arts',
  'Acting',
  'Comedy',
  'Writing',
  'Crafts',
  'DJ',
  'Makeup Artist'
];

// Helper to assign reliable decorative abstract banner backgrounds based on worker ID or role
const getBannerBackground = (id: string, index: number) => {
  const gradients = [
    'from-indigo-500/20 to-purple-500/10 bg-indigo-50',
    'from-emerald-500/20 to-teal-500/10 bg-emerald-50',
    'from-amber-500/20 to-orange-500/10 bg-amber-50',
    'from-sky-500/20 to-blue-500/10 bg-sky-50',
    'from-rose-500/20 to-pink-500/10 bg-rose-50',
    'from-violet-500/20 to-fuchsia-500/10 bg-violet-50',
    'from-cyan-500/20 to-teal-500/10 bg-cyan-50'
  ];
  const charCodeSum = id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return gradients[(charCodeSum + index) % gradients.length];
};

export default function CustomerHome({ 
  workers, 
  onSelectWorker,
  initialSearchQuery = '',
  onClearSearch,
  isSearchPage = false,
}: CustomerHomeProps) {
  // Search state query modifiers
  const [searchTerm, setSearchTerm] = useState(initialSearchQuery);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [locationTerm, setLocationTerm] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(300);
  const [ratingFourPlus, setRatingFourPlus] = useState(false);
  
  // Custom display view mode state: 'grid' (aesthetic 3-per-row compact cards) or 'list' (sleek horizontal items)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Sync search state if initial search parameter updates
  useEffect(() => {
    if (initialSearchQuery) {
      setSearchTerm(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // Toggle dynamic categories selection list
  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  // Perform accurate keyword evaluation and matching
  const filteredWorkers = useMemo(() => {
    return workers.filter(worker => {
      // 1. Text Search Input matches name, bio, talents, location or career title
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch = query === '' || 
        worker.name.toLowerCase().includes(query) ||
        worker.profession.toLowerCase().includes(query) ||
        worker.location.toLowerCase().includes(query) ||
        worker.bio.toLowerCase().includes(query);

      // 2. Multiselect checklist filters match
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.some(cat => {
        const term = cat.toLowerCase();
        if (worker.category.toLowerCase().includes(term)) return true;
        if (worker.profession.toLowerCase().includes(term)) return true;
        if (worker.bio && worker.bio.toLowerCase().includes(term)) return true;

        // Custom variations
        if (term === 'photography' && worker.profession.toLowerCase().includes('photograph')) return true;
        if (term === 'music' && (
          worker.profession.toLowerCase().includes('music') || 
          worker.profession.toLowerCase().includes('sing') || 
          worker.profession.toLowerCase().includes('pianist') || 
          worker.profession.toLowerCase().includes('vocal') ||
          worker.profession.toLowerCase().includes('viol') ||
          worker.profession.toLowerCase().includes('guitar')
        )) return true;
        if (term === 'comedy' && worker.profession.toLowerCase().includes('comed')) return true;
        if (term === 'crafts' && (
          worker.profession.toLowerCase().includes('craft') || 
          worker.profession.toLowerCase().includes('tailor') || 
          worker.profession.toLowerCase().includes('artisan') ||
          worker.profession.toLowerCase().includes('sew')
        )) return true;

        return false;
      });

      // 3. Location term matching query
      const locQuery = locationTerm.toLowerCase().trim();
      const matchesLocation = locQuery === '' || worker.location.toLowerCase().includes(locQuery);

      // 4. Price range starting hourly matching slider limit
      const matchesPrice = worker.pricePerHour <= maxPrice;

      // 5. Star limits checks
      const matchesRating = !ratingFourPlus || worker.rating >= 4.0;

      return matchesSearch && matchesCategory && matchesLocation && matchesPrice && matchesRating;
    });
  }, [workers, searchTerm, selectedCategories, locationTerm, maxPrice, ratingFourPlus]);

  // Handle resetting active state filters immediately
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setLocationTerm('');
    setMaxPrice(300);
    setRatingFourPlus(false);
    if (onClearSearch) {
      onClearSearch();
    }
  };

  return (
    <div id="explore-artists-portal" className="space-y-6 py-1">
      
      {/* Dynamic Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-2 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Explore Artists
            <span className="text-xs font-semibold bg-neutral-100 text-neutral-800 px-2.5 py-0.5 rounded-full border border-neutral-200">
              {filteredWorkers.length} {filteredWorkers.length === 1 ? 'Talent' : 'Talents'} Listed
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Discover, book, and collaborate with top creative professionals and performers.
          </p>
        </div>

        {/* Layout View Toggles (Grid vs List Layout) */}
        <div className="flex items-center gap-2 self-start md:self-center bg-slate-100 p-1 rounded-xl border border-slate-200/60 self-end">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === 'grid' 
                ? 'bg-white text-black shadow-3xs font-medium' 
                : 'text-slate-500 hover:text-black'
            }`}
            title="Grid View"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === 'list' 
                ? 'bg-white text-black shadow-3xs font-medium' 
                : 'text-slate-500 hover:text-black'
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Container Grid: Filter sidebar + dynamic results panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Left Side: Intelligent Filter Panel Card */}
        <aside 
          id="search-filter-sidebar" 
          className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/90 p-5 space-y-6 shadow-3xs"
        >
          {/* Header */}
          <div className="flex items-center justify-between font-semibold text-slate-800 pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-800" />
              <span className="text-sm font-extrabold text-slate-900">Filters</span>
            </div>
            {(selectedCategories.length > 0 || searchTerm || locationTerm || ratingFourPlus || maxPrice < 300) && (
              <button 
                onClick={handleResetFilters} 
                className="text-[12px] text-red-500 hover:text-red-700 flex items-center gap-1 font-bold transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="space-y-6">
            
            {/* Filter Group: Categories Pills layout / Scroll area */}
            <div className="space-y-2.5">
              <h4 className="text-[12px] font-bold text-slate-850 tracking-wider uppercase">Categories</h4>
              <div className="max-h-56 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-205 scrollbar-track-transparent">
                {CATEGORIES_LIST.map((cat) => {
                  const isChecked = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isChecked 
                          ? 'bg-neutral-900 text-white shadow-3xs' 
                          : 'bg-slate-50 text-slate-650 hover:bg-slate-100 hover:text-black'
                      }`}
                    >
                      <span>{cat}</span>
                      {isChecked ? (
                        <X className="w-3.0 h-3.0 text-white/90 stroke-[3]" />
                      ) : (
                        <span className="text-[10px] text-slate-400 group-hover:text-slate-600">
                          +
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Group: Location input box */}
            <div className="space-y-2.5">
              <h4 className="text-[12px] font-bold text-slate-850 tracking-wider uppercase">Location</h4>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={locationTerm}
                  onChange={(e) => setLocationTerm(e.target.value)}
                  placeholder="e.g. Hyderabad"
                  className="w-full pl-8.5 pr-3 py-2 text-xs border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-slate-800 font-medium placeholder-slate-400"
                />
              </div>
            </div>

            {/* Filter Group: Budget Price Slider */}
            <div className="space-y-2.5 pt-1">
              <div className="flex justify-between items-center">
                <h4 className="text-[12px] font-bold text-slate-850 tracking-wider uppercase">Max Hourly Rate</h4>
                <span className="text-xs font-extrabold text-black bg-slate-100 px-2 py-0.5 rounded-md">${maxPrice}/hr</span>
              </div>
              <input
                type="range"
                min="10"
                max="300"
                step="5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-black focus:outline-none"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>$10/hr</span>
                <span>$300/hr</span>
              </div>
            </div>

            {/* Filter Group: Minimum Rating 4 Stars */}
            <div className="space-y-2.5 pt-1">
              <h4 className="text-[12px] font-bold text-slate-850 tracking-wider uppercase">Average Rating</h4>
              <label className="flex items-center gap-2.5 text-xs text-slate-650 cursor-pointer hover:text-black select-none">
                <input
                  type="checkbox"
                  checked={ratingFourPlus}
                  onChange={(e) => setRatingFourPlus(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-350 text-black focus:ring-black accent-black focus:outline-none"
                />
                <span className={`flex items-center gap-1 ${ratingFourPlus ? 'font-bold text-slate-900' : 'font-normal'}`}>
                  <Star className="w-3.5 h-3.5 fill-amber-405 text-amber-500" />
                  4.0+ Stars Rating
                </span>
              </label>
            </div>

          </div>
        </aside>

        {/* Right Side: Search Results Column */}
        <section id="search-matches-panel" className="lg:col-span-3 space-y-6">
          
          {/* Main Search Bar */}
          <div className="relative flex items-center w-full bg-white border border-slate-200/90 rounded-2xl overflow-hidden focus-within:ring-1 focus-within:ring-black focus-within:border-black shadow-3xs transition-shadow">
            <Search className="absolute left-4 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by artist name, custom talent, keywords, experience..."
              className="flex-1 pl-11 pr-4 py-3 text-slate-800 text-xs md:text-sm placeholder-slate-400 bg-white focus:outline-none font-medium border-none"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="p-1.5 mr-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-black transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Render Active Filter Chips Row for high visibility */}
          {(selectedCategories.length > 0 || ratingFourPlus || locationTerm || maxPrice < 300) && (
            <div className="flex flex-wrap gap-2 items-center text-xs text-slate-500 pt-1">
              <span className="font-semibold text-slate-700">Active Criteria:</span>
              
              {selectedCategories.map(cat => (
                <span key={cat} className="flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-800 px-2 py-0.5 rounded-full font-medium">
                  {cat}
                  <button onClick={() => toggleCategory(cat)}><X className="w-2.5 h-2.5 text-slate-500 hover:text-black" /></button>
                </span>
              ))}

              {locationTerm && (
                <span className="flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-800 px-2 py-0.5 rounded-full font-medium">
                  In: {locationTerm}
                  <button onClick={() => setLocationTerm('')}><X className="w-2.5 h-2.5 text-slate-500 hover:text-black" /></button>
                </span>
              )}

              {maxPrice < 300 && (
                <span className="flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-800 px-2 py-0.5 rounded-full font-medium">
                  Under ${maxPrice}/hr
                  <button onClick={() => setMaxPrice(300)}><X className="w-2.5 h-2.5 text-slate-500 hover:text-black" /></button>
                </span>
              )}

              {ratingFourPlus && (
                <span className="flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-800 px-2 py-0.5 rounded-full font-medium">
                  ★ 4.0+
                  <button onClick={() => setRatingFourPlus(false)}><X className="w-2.5 h-2.5 text-slate-500 hover:text-black" /></button>
                </span>
              )}
            </div>
          )}

          {/* Main Listings Render */}
          {filteredWorkers.length > 0 ? (
            viewMode === 'grid' ? (
              /* --- COMPACT GRID VIEW --- */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredWorkers.map((worker, index) => {
                  return (
                    <div
                      key={worker.id}
                      onClick={() => onSelectWorker(worker)}
                      className="bg-white rounded-2xl border border-slate-150 overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all duration-205 cursor-pointer relative group"
                    >
                      {/* Compact decorative mini banner on top (no giant square gray placeholder!) */}
                      <div className={`h-24 bg-gradient-to-r relative w-full ${getBannerBackground(worker.id, index)} flex items-center justify-end px-3`}>
                        <span className="bg-white/80 backdrop-blur-xs text-black text-[10px] font-bold px-2 py-0.5 rounded-md border border-white/20">
                          ${worker.pricePerHour}/hr
                        </span>
                      </div>

                      {/* Overlapping rounded elegant circle avatar */}
                      <div className="absolute left-4 top-11">
                        <div className="relative w-15 h-15 rounded-full border-4 border-white shadow-sm overflow-hidden bg-white">
                          {worker.avatar && !worker.avatar.includes('photo-1544005313-94ddf0286df2') ? (
                            <img
                              src={worker.avatar}
                              alt={worker.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 font-bold text-sm">
                              {worker.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="pt-8 px-4 pb-4 flex flex-col justify-between flex-1">
                        <div>
                          
                          {/* Name, Star Rating */}
                          <div className="flex items-start justify-between gap-1.5 mt-1">
                            <h3 className="font-extrabold text-slate-900 text-sm tracking-tight truncate group-hover:text-amber-605 group-hover:underline decoration-amber-400">
                              {worker.name}
                            </h3>
                            <div className="flex items-center gap-0.5 text-[11px] font-bold text-slate-700 shrink-0 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                              <span>{worker.rating}</span>
                              <span className="text-slate-400 font-medium ml-0.5 text-[10px]">({worker.reviews ? worker.reviews.length : 0})</span>
                            </div>
                          </div>

                          {/* Profession Subtitle */}
                          <p className="text-[12px] text-slate-600 font-semibold mt-0.5 truncate capitalize">
                            {worker.profession}
                          </p>

                          {/* Profile Bio Description Snip */}
                          <p className="text-[11px] text-slate-400 font-medium mt-2 line-clamp-2 leading-relaxed">
                            {worker.bio || "Creative professional ready to deliver top tier artistic sessions and freelance works."}
                          </p>

                          {/* Region and Badge Pills container */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-3.5">
                            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-150">
                              {worker.category || 'Artist'}
                            </span>
                            <div className="flex items-center gap-0.5 text-[10px] text-slate-500 font-bold bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 max-w-[125px]">
                              <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                              <span className="truncate">{worker.location}</span>
                            </div>
                          </div>

                        </div>

                        {/* Actions button */}
                        <div className="mt-4 pt-3.5 border-t border-slate-100/75 flex items-center justify-between">
                          <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">
                            Available Now
                          </span>
                          <button className="text-[11px] font-bold text-black border border-slate-300 hover:bg-neutral-50 px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                            View Profile
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* --- COMPACT HORIZONTAL LIST VIEW --- */
              <div className="space-y-3.5">
                {filteredWorkers.map((worker, index) => (
                  <div
                    key={worker.id}
                    onClick={() => onSelectWorker(worker)}
                    className="bg-white rounded-xl border border-slate-150 p-4.5 hover:shadow-sm hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-5 cursor-pointer group"
                  >
                    
                    {/* Left Column: Avatar & Basic Metadata */}
                    <div className="flex items-center gap-4.5 flex-1 min-w-0">
                      
                      {/* Concise Circular Avatar */}
                      <div className="relative w-14 h-14 rounded-full border-2 border-slate-100 shadow-3xs overflow-hidden shrink-0 bg-white">
                        {worker.avatar && !worker.avatar.includes('photo-1544005313-94ddf0286df2') ? (
                          <img
                            src={worker.avatar}
                            alt={worker.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-400 font-extrabold text-sm">
                            {worker.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-slate-900 text-sm tracking-tight truncate group-hover:text-black group-hover:underline">
                            {worker.name}
                          </h3>
                          <span className="text-[10px] bg-slate-100 text-slate-600 font-extrabold px-2 py-0.5 rounded border border-slate-200 uppercase truncate">
                            {worker.category}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 font-semibold capitalize truncate mt-0.5">
                          {worker.profession}
                        </p>

                        <div className="flex items-center gap-3.5 text-[11px] text-slate-400 font-medium mt-2">
                          <div className="flex items-center gap-0.5 text-slate-500 font-bold">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{worker.location}</span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />
                            <span className="font-bold text-slate-700">{worker.rating}</span>
                            <span className="text-slate-400">({worker.reviews ? worker.reviews.length : 0})</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Middle Column: Short excerpt */}
                    <div className="hidden md:block flex-1 max-w-sm">
                      <p className="text-[11px] text-slate-400 font-medium line-clamp-2 leading-relaxed">
                        {worker.bio || "Experienced specialist focusing on unique and creative services matching client guidelines."}
                      </p>
                    </div>

                    {/* Right Column: Rate & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-none pt-3 sm:pt-0 shrink-0">
                      
                      <div className="text-right sm:mr-3">
                        <p className="text-xs text-slate-400 font-medium">Hourly Rate</p>
                        <p className="text-sm font-black text-slate-900">${worker.pricePerHour}/hr</p>
                      </div>

                      <button className="bg-neutral-900 hover:bg-black text-white font-bold text-[11px] px-4.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-3xs">
                        View Profile
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                    </div>

                  </div>
                ))}
              </div>
            )
          ) : (
            /* --- EMPTY SEARCH MATCH STATE --- */
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center max-w-md mx-auto my-6 space-y-4 shadow-3xs">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">No match found</h3>
                <p className="text-xs text-slate-400 mt-1 pb-1">
                  Adjust active criteria chips, clear keywords search, or increase maximum price budget.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-neutral-900 hover:bg-black text-white font-extrabold text-[11px] rounded-xl cursor-pointer transition-colors"
              >
                Reset Exploration Criteria
              </button>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
