import { useState, useRef, useEffect, useCallback, useId } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Clock, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { formatPrice } from "@/lib/data";

const ORANGE = "#F85606";
const NAVY = "#0F2D5E";
const RECENT_KEY = "manju_recent_searches";
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return;
  const prev = getRecentSearches().filter(s => s !== trimmed);
  localStorage.setItem(
    RECENT_KEY,
    JSON.stringify([trimmed, ...prev].slice(0, MAX_RECENT))
  );
}

function removeRecentSearch(query: string) {
  localStorage.setItem(
    RECENT_KEY,
    JSON.stringify(getRecentSearches().filter(s => s !== query))
  );
}

function clearRecentSearches() {
  localStorage.removeItem(RECENT_KEY);
}

interface SearchResult {
  id: number;
  slug: string;
  name: string;
  brandName?: string | null;
  imageUrl?: string | null;
  basePrice: string | number;
  salePrice?: string | number | null;
}

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showCategorySelect?: boolean;
  autoFocus?: boolean;
}

const sizeMap = {
  sm: { height: "h-9", text: "text-xs", px: "px-3" },
  md: { height: "h-11", text: "text-sm", px: "px-4" },
  lg: { height: "h-12", text: "text-base", px: "px-4" },
};

export default function SearchBar({
  onSearch,
  placeholder = "Search for products, brands...",
  className = "",
  size = "md",
  showCategorySelect = false,
  autoFocus = false,
}: SearchBarProps) {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listboxId = useId();

  const { data: searchResults, isFetching } = trpc.products.search.useQuery(
    { query: debouncedQuery, limit: 6 },
    { enabled: debouncedQuery.length > 1 }
  );

  // Debounce query updates
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    setHighlightedIndex(-1);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(value);
    }, 300);
  }, []);

  // Load recent searches on focus
  const handleFocus = useCallback(() => {
    setRecentSearches(getRecentSearches());
    setIsOpen(true);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const showRecent = isOpen && query.length === 0 && recentSearches.length > 0;
  const showResults =
    isOpen &&
    debouncedQuery.length > 1 &&
    searchResults &&
    searchResults.length > 0;
  const dropdownOpen = showRecent || showResults;

  // Build flat list of items for keyboard nav
  const items: Array<
    { type: "recent"; value: string } | { type: "result"; index: number }
  > = showRecent
    ? recentSearches.map(r => ({ type: "recent" as const, value: r }))
    : showResults
      ? ((searchResults as SearchResult[]) ?? []).map(
          (_: SearchResult, i: number) => ({
            type: "result" as const,
            index: i,
          })
        )
      : [];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!dropdownOpen) {
      if (e.key === "Enter") submitSearch(query);
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(i => (i < items.length - 1 ? i + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(i => (i > 0 ? i - 1 : items.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < items.length) {
          const item = items[highlightedIndex];
          if (item.type === "recent") {
            submitSearch(item.value);
          } else {
            const product = searchResults?.[item.index];
            if (product) {
              navigate(`/products/${product.slug}`);
              closeDropdown();
            }
          }
        } else {
          submitSearch(query);
        }
        break;
      case "Escape":
        setQuery("");
        setDebouncedQuery("");
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  };

  const submitSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    saveRecentSearch(trimmed);
    setIsOpen(false);
    setHighlightedIndex(-1);
    if (onSearch) {
      onSearch(trimmed);
    } else {
      navigate(`/products?search=${encodeURIComponent(trimmed)}`);
    }
    setQuery("");
    setDebouncedQuery("");
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setHighlightedIndex(-1);
    setQuery("");
    setDebouncedQuery("");
  };

  const handleRemoveRecent = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    removeRecentSearch(term);
    setRecentSearches(getRecentSearches());
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearRecentSearches();
    setRecentSearches([]);
  };

  const { height, text, px } = sizeMap[size];

  const inputId = `${listboxId}-input`;
  const getItemId = (i: number) => `${listboxId}-item-${i}`;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className={`flex items-stretch ${height} rounded-xl overflow-hidden border-2 shadow-sm w-full`}
        style={{ borderColor: ORANGE }}
      >
        {showCategorySelect && (
          <select
            className={`${px} ${text} font-medium text-gray-600 bg-gray-50 border-r border-gray-200 outline-none cursor-pointer shrink-0`}
            aria-label="Category"
          >
            <option>All Categories</option>
            <option>Electric Bikes</option>
            <option>Smart TVs</option>
            <option>Air Conditioners</option>
            <option>Water Filters</option>
            <option>Books</option>
          </select>
        )}

        <input
          id={inputId}
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={dropdownOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls={dropdownOpen ? listboxId : undefined}
          aria-activedescendant={
            highlightedIndex >= 0 ? getItemId(highlightedIndex) : undefined
          }
          value={query}
          onChange={e => handleQueryChange(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`flex-1 ${px} ${text} outline-none bg-white text-gray-800 placeholder:text-gray-400`}
          autoComplete="off"
          spellCheck={false}
        />

        {/* Right-side icons */}
        <div className="flex items-center bg-white pr-1">
          {isFetching && debouncedQuery.length > 1 && (
            <Loader2
              size={14}
              className="animate-spin text-gray-400 mr-1"
              aria-label="Loading results"
            />
          )}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setDebouncedQuery("");
                setHighlightedIndex(-1);
                inputRef.current?.focus();
              }}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
              tabIndex={-1}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => submitSearch(query)}
          className={`${px} text-white font-semibold ${text} flex items-center gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2`}
          style={{ background: ORANGE }}
          onMouseEnter={e =>
            ((e.currentTarget as HTMLButtonElement).style.background =
              "#e04d00")
          }
          onMouseLeave={e =>
            ((e.currentTarget as HTMLButtonElement).style.background = ORANGE)
          }
          aria-label="Submit search"
        >
          <Search size={size === "sm" ? 14 : 16} />
          {size !== "sm" && <span>Search</span>}
        </button>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            id={listboxId}
            role="listbox"
            aria-label="Search suggestions"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50"
          >
            {/* Recent Searches */}
            {showRecent && (
              <>
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-50">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Recent Searches
                  </span>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-[11px] font-medium text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Clear all
                  </button>
                </div>
                {recentSearches.map((term, i) => (
                  <div
                    key={term}
                    id={getItemId(i)}
                    role="option"
                    aria-selected={highlightedIndex === i}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                      highlightedIndex === i
                        ? "bg-orange-50"
                        : "hover:bg-gray-50"
                    }`}
                    onMouseEnter={() => setHighlightedIndex(i)}
                    onClick={() => submitSearch(term)}
                  >
                    <Clock size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="flex-1 text-sm text-gray-700 truncate">
                      {term}
                    </span>
                    <button
                      type="button"
                      onClick={e => handleRemoveRecent(e, term)}
                      className="p-0.5 rounded text-gray-300 hover:text-gray-500 transition-colors"
                      aria-label={`Remove "${term}" from recent searches`}
                      tabIndex={-1}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </>
            )}

            {/* Live Results */}
            {showResults && (
              <>
                {((searchResults as SearchResult[]) ?? []).map((result, i) => (
                  <Link
                    key={result.id}
                    href={`/products/${result.slug}`}
                    id={getItemId(i)}
                    role="option"
                    aria-selected={highlightedIndex === i}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors border-b border-gray-50 last:border-0 ${
                      highlightedIndex === i
                        ? "bg-orange-50"
                        : "hover:bg-gray-50"
                    }`}
                    onMouseEnter={() => setHighlightedIndex(i)}
                    onClick={() => {
                      saveRecentSearch(query);
                      closeDropdown();
                    }}
                  >
                    {result.imageUrl ? (
                      <img
                        src={result.imageUrl}
                        alt={result.name}
                        className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs flex-shrink-0">
                        IMG
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">
                        {result.name}
                      </div>
                      {result.brandName && (
                        <div className="text-xs text-gray-400 truncate">
                          {result.brandName}
                        </div>
                      )}
                    </div>
                    <div
                      className="text-sm font-bold flex-shrink-0"
                      style={{ color: NAVY }}
                    >
                      {formatPrice(result.salePrice ?? result.basePrice)}
                    </div>
                  </Link>
                ))}

                {/* View all footer */}
                <Link
                  href={`/products?search=${encodeURIComponent(debouncedQuery)}`}
                  className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold hover:bg-orange-50 transition-colors"
                  style={{ color: ORANGE }}
                  onClick={() => {
                    saveRecentSearch(debouncedQuery);
                    closeDropdown();
                  }}
                >
                  View all results for "{debouncedQuery}" →
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
