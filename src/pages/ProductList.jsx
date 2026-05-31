import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../services/api';
import ProductCard  from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import { useDebounce } from '../hooks/useDebounce';

const CATEGORIES = ['', 'Apparel', 'Accessories', 'Footwear', 'Beauty', 'Electronics', 'Home'];
const SORT_OPTIONS = [
  { label: 'Newest',        value: '-createdAt' },
  { label: 'Price: Low',    value: 'price' },
  { label: 'Price: High',   value: '-price' },
  { label: 'Name A-Z',      value: 'name' },
];

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Controlled filter state (synced with URL) ────────────────
  const [search,   setSearch]   = useState(searchParams.get('search')   || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [inStock,  setInStock]  = useState(searchParams.get('inStock')  === 'true');
  const [sort,     setSort]     = useState(searchParams.get('sort')     || '-createdAt');
  const [page,     setPage]     = useState(Number(searchParams.get('page')) || 1);

  // ── Results ──────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [meta,     setMeta]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  // ── Fetch on any filter/page change ─────────────────────────
  const fetchRef = useRef(0);
  const load = useCallback(async () => {
    const id = ++fetchRef.current;
    setLoading(true);
    const params = {
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(category        && { category }),
      ...(minPrice        && { minPrice }),
      ...(maxPrice        && { maxPrice }),
      ...(inStock         && { inStock: 'true' }),
      sort,
      page,
      limit: 12,
    };

    // Sync URL with current filters
    setSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined)),
      { replace: true }
    );

    try {
      const { data } = await fetchProducts(params);
      if (id !== fetchRef.current) return; // stale response
      setProducts(data.products || []);
      setMeta(data.meta || null);
    } catch {
      setProducts([]);
    } finally {
      if (id === fetchRef.current) setLoading(false);
    }
  }, [debouncedSearch, category, minPrice, maxPrice, inStock, sort, page, setSearchParams]);

  useEffect(() => { load(); }, [load]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [debouncedSearch, category, minPrice, maxPrice, inStock, sort]);

  const clearFilters = () => {
    setSearch(''); setCategory(''); setMinPrice(''); setMaxPrice(''); setInStock(false);
    setSort('-createdAt'); setPage(1);
  };
  const activeFilterCount = [category, minPrice, maxPrice, inStock].filter(Boolean).length;

  return (
    <div className="bg-background text-on-surface font-body-md antialiased">

      {/* ── Sticky Search & Filter bar (matches product_listing_page_1) ── */}
      <div className="sticky top-[64px] z-40 py-6 bg-background/95 backdrop-blur-sm border-b border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-4 items-center justify-between">

          {/* Search input */}
          <div className="relative w-full md:max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input
              type="text"
              placeholder="Search curated collection..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-outline-variant rounded-lg focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition-all font-body-md"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters((p) => !p)}
              className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg font-button hover:opacity-90 transition-all whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[20px]">filter_list</span>
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-secondary text-on-secondary text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div className="h-8 w-px bg-outline-variant mx-2 hidden md:block" />

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-2 bg-surface-container-low rounded-lg text-label-sm border border-outline-variant/30 focus:ring-1 focus:ring-secondary outline-none"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* ── Expandable filter panel ──────────────────────────────── */}
        {showFilters && (
          <div className="max-w-7xl mx-auto px-6 mt-4 p-6 bg-white rounded-xl shadow-sm border border-outline-variant/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

              {/* Category */}
              <div>
                <h4 className="font-label-sm text-on-surface-variant uppercase tracking-widest mb-3">Category</h4>
                <div className="space-y-2">
                  {CATEGORIES.map((cat) => (
                    <label key={cat} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio" name="category"
                        checked={category === cat}
                        onChange={() => setCategory(cat)}
                        className="w-4 h-4 text-secondary border-outline-variant focus:ring-secondary"
                      />
                      <span className="font-body-md">{cat || 'All'}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <h4 className="font-label-sm text-on-surface-variant uppercase tracking-widest mb-3">Price Range</h4>
                <div className="space-y-3">
                  <input
                    type="number" placeholder="Min ₹" value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-md focus:ring-1 focus:ring-secondary outline-none"
                  />
                  <input
                    type="number" placeholder="Max ₹" value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-md focus:ring-1 focus:ring-secondary outline-none"
                  />
                </div>
              </div>

              {/* Stock */}
              <div>
                <h4 className="font-label-sm text-on-surface-variant uppercase tracking-widest mb-3">Availability</h4>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox" checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="w-4 h-4 rounded text-secondary border-outline-variant focus:ring-secondary"
                  />
                  <span className="font-body-md">In Stock Only</span>
                </label>
              </div>

              {/* Clear */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full py-3 border border-outline-variant rounded-lg font-button text-button hover:bg-surface-container-low transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Product Grid ─────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-gutter mt-8">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
            : products.length > 0
            ? products.map((p) => <ProductCard key={p._id} product={p} />)
            : (
              <div className="col-span-4 text-center py-24">
                <span className="material-symbols-outlined text-5xl text-outline mb-4 block">search_off</span>
                <p className="font-body-lg text-on-surface-variant">No products match your filters.</p>
                <button onClick={clearFilters} className="mt-4 text-secondary font-button underline">Clear filters</button>
              </div>
            )
          }
        </div>

        {/* ── Pagination ───────────────────────────────────────────── */}
        {meta && meta.totalPages > 1 && (
          <div className="mt-16 flex flex-col items-center gap-6">
            <div className="flex items-center gap-2">
              <button
                disabled={!meta.hasPrevPage}
                onClick={() => setPage((p) => p - 1)}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-outline-variant hover:bg-white transition-colors disabled:opacity-30"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                  .filter((n) => n === 1 || n === meta.totalPages || Math.abs(n - page) <= 1)
                  .reduce((acc, n, idx, arr) => {
                    if (idx > 0 && n - arr[idx - 1] > 1) acc.push('…');
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((n, i) =>
                    n === '…' ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-outline">…</span>
                    ) : (
                      <button
                        key={n}
                        onClick={() => setPage(n)}
                        className={`w-10 h-10 flex items-center justify-center rounded-full font-bold transition-colors ${n === page ? 'bg-primary text-on-primary' : 'hover:bg-white'}`}
                      >
                        {n}
                      </button>
                    )
                  )}
              </div>

              <button
                disabled={!meta.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-outline-variant hover:bg-white transition-colors disabled:opacity-30"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
            <p className="text-label-sm text-on-surface-variant uppercase tracking-widest">
              Showing {meta.filteredCount} of {meta.totalDocs} products
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
