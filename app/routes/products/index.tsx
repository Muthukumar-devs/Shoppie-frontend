import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router";
import { SlidersHorizontal, X, ChevronDown, Search, Package } from "lucide-react";
import { getProducts, getCategories, getSubCategories } from "../../lib/api";
import { useCart } from "../../contexts/CartContext";
import { ProductCard, PageLoader, Pagination, EmptyState, Button } from "../../components/ui";
import type { Product, Category, SubCategory } from "../../lib/types";

export function meta() {
  return [{ title: "Products – Shoppie" }];
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { addToCart } = useCart();

  const search = searchParams.get("search") ?? "";
  const categoryId = searchParams.get("category") ?? "";
  const subCategoryId = searchParams.get("subCategory") ?? "";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";

  const fetchProducts = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: p, limit: 12 };
      if (search) params.search = search;
      if (categoryId) params.category = categoryId;
      if (subCategoryId) params.subCategory = subCategoryId;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      const res = await getProducts(params);
      setProducts(res.data.data.products ?? []);
      setPages(res.data.pages ?? 1);
      setTotal(res.data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [search, categoryId, subCategoryId, minPrice, maxPrice]);

  useEffect(() => { fetchProducts(page); }, [fetchProducts, page]);

  useEffect(() => {
    getCategories().then((r) => setCategories(r.data.data.categories ?? []));
  }, []);

  useEffect(() => {
    if (categoryId) {
      getSubCategories(categoryId).then((r) => setSubCategories(r.data.data.subCategories ?? []));
    } else {
      setSubCategories([]);
    }
  }, [categoryId]);

  const setParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    if (key !== "page") p.delete("page");
    setSearchParams(p);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchParams({});
    setPage(1);
  };

  const hasFilters = !!(search || categoryId || subCategoryId || minPrice || maxPrice);

  const handleAddToCart = async (id: string) => {
    try { await addToCart(id, 1); } catch { window.location.href = "/login"; }
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <ChevronDown className="h-4 w-4" /> Categories
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => setParam("category", "")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!categoryId ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-600 hover:bg-slate-50"}`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => setParam("category", c._id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${categoryId === c._id ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-600 hover:bg-slate-50"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategories */}
      {subCategories.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Sub Categories</h3>
          <div className="space-y-1">
            <button
              onClick={() => setParam("subCategory", "")}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!subCategoryId ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-600 hover:bg-slate-50"}`}
            >
              All
            </button>
            {subCategories.map((s) => (
              <button
                key={s._id}
                onClick={() => setParam("subCategory", s._id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${subCategoryId === s._id ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-600 hover:bg-slate-50"}`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Price Range</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min ₹"
            value={minPrice}
            onChange={(e) => setParam("minPrice", e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 transition-all"
          />
          <input
            type="number"
            placeholder="Max ₹"
            value={maxPrice}
            onChange={(e) => setParam("maxPrice", e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 transition-all"
          />
        </div>
      </div>

      {hasFilters && (
        <Button variant="outline" size="sm" onClick={clearFilters} fullWidth>
          <X className="h-4 w-4" /> Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {search ? `Results for "${search}"` : categoryId ? (categories.find(c => c._id === categoryId)?.name ?? "Products") : "All Products"}
          </h1>
          {!loading && <p className="text-sm text-slate-500 mt-0.5">{total} products found</p>}
        </div>
        <Button variant="outline" size="sm" onClick={() => setFiltersOpen(!filtersOpen)} className="lg:hidden">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar – desktop */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24 rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
            <FilterPanel />
          </div>
        </aside>

        {/* Mobile filter drawer */}
        {filtersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-slate-800">Filters</h2>
                <button onClick={() => setFiltersOpen(false)} className="p-1 rounded-lg hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <FilterPanel />
            </div>
          </div>
        )}

        {/* Products grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <PageLoader />
          ) : products.length === 0 ? (
            <EmptyState
              icon={<Search className="h-8 w-8" />}
              title="No products found"
              description="Try adjusting your filters or search query."
              action={hasFilters ? <Button variant="outline" onClick={clearFilters}><X className="h-4 w-4" /> Clear Filters</Button> : undefined}
            />
          ) : (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-5 gap-3">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} onAddToCart={handleAddToCart} />
                ))}
              </div>
              <Pagination page={page} pages={pages} onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
