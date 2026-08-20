import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { ShoppingCart, ArrowLeft, Check, Truck, Shield, Star, ChevronRight, Package } from "lucide-react";
import { getProduct } from "../../lib/api";
import { useCart } from "../../contexts/CartContext";
import { Button, Badge, StarRating, PageLoader, Spinner } from "../../components/ui";
import type { Product } from "../../lib/types";

export function meta() {
  return [{ title: "Product – Shoppie" }];
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    if (!id) return;
    getProduct(id)
      .then((r) => { setProduct(r.data.data.product); })
      .catch(() => setError("Product not found."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    setError("");
    try {
      await addToCart(product._id, qty);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      if (msg?.includes("log in")) window.location.href = "/login";
      else setError(msg ?? "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <p className="text-slate-500 mb-4">{error || "Product not found."}</p>
      <Link to="/products" className="text-indigo-600 hover:underline">← Back to products</Link>
    </div>
  );

  const category = typeof product.category === "object" ? product.category : null;
  const subCategory = typeof product.subCategory === "object" ? product.subCategory : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6 flex-wrap">
        <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/products" className="hover:text-indigo-600 transition-colors">Products</Link>
        {category && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to={`/products?category=${category._id}`} className="hover:text-indigo-600 transition-colors">{category.name}</Link>
          </>
        )}
        {subCategory && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-slate-700">{subCategory.name}</span>
          </>
        )}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
            {product.images[selectedImg]?.url ? (
              <img src={product.images[selectedImg].url} alt={product.name} className="h-full w-full object-contain p-4" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Package className="h-20 w-20 text-slate-200" />
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImg(i)}
                  className={`shrink-0 h-16 w-16 rounded-xl overflow-hidden border-2 transition-all ${i === selectedImg ? "border-indigo-500" : "border-slate-200 hover:border-slate-300"}`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          {product.brand && <p className="text-sm font-medium text-indigo-600 uppercase tracking-wide">{product.brand}</p>}
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">{product.name}</h1>

          {product.ratings.count > 0 && <StarRating rating={product.ratings.average} count={product.ratings.count} />}

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className="text-3xl font-extrabold text-slate-900">₹{product.price.toLocaleString()}</span>
            {product.mrp > product.price && (
              <>
                <span className="text-lg text-slate-400 line-through mb-0.5">₹{product.mrp.toLocaleString()}</span>
                <Badge label={`${product.discount}% OFF`} variant="danger" />
              </>
            )}
          </div>

          {/* Stock */}
          <div>
            {product.stock === 0 ? (
              <Badge label="Out of Stock" variant="danger" />
            ) : product.stock < 10 ? (
              <Badge label={`Only ${product.stock} left!`} variant="warning" />
            ) : (
              <Badge label="In Stock" variant="success" />
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>

          {/* Highlights */}
          {product.highlights.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Highlights</h3>
              <ul className="space-y-1.5">
                {product.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" /> {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Qty + Add to cart */}
          {product.stock > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-700">Quantity:</span>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-slate-600 hover:bg-slate-50 transition-colors font-bold">−</button>
                  <span className="px-4 py-2 text-sm font-semibold text-slate-800 border-x border-slate-200">{qty}</span>
                  <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-3 py-2 text-slate-600 hover:bg-slate-50 transition-colors font-bold">+</button>
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-3">
                <Button onClick={handleAddToCart} loading={adding} size="lg" className="flex-1">
                  {added ? <><Check className="h-5 w-5" /> Added!</> : <><ShoppingCart className="h-5 w-5" /> Add to Cart</>}
                </Button>
                <Link to="/cart" className="inline-flex items-center justify-center gap-2 border border-indigo-600 text-indigo-600 px-6 py-3 rounded-xl text-base font-medium hover:bg-indigo-50 transition-colors">
                  View Cart
                </Link>
              </div>
            </div>
          )}

          {/* Trust */}
          <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Truck className="h-4 w-4 text-indigo-500" /> Free delivery above ₹499
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="h-4 w-4 text-emerald-500" /> Secure checkout
            </div>
          </div>
        </div>
      </div>

      {/* Specifications */}
      {product.specifications.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Specifications</h2>
          <div className="rounded-2xl border border-slate-100 overflow-hidden bg-white">
            {product.specifications.map((spec, i) => (
              <div key={i} className={`flex gap-4 px-6 py-3 text-sm ${i % 2 === 0 ? "bg-slate-50" : "bg-white"}`}>
                <span className="w-40 shrink-0 font-medium text-slate-700">{spec.key}</span>
                <span className="text-slate-600">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
