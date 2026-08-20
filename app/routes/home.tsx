import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, ShoppingBag, Truck, Shield, RotateCcw, Zap, Flame } from "lucide-react";
import { getProducts, getCategories, getOffers } from "../lib/api";
import { useCart } from "../contexts/CartContext";
import { ProductCard, PageLoader } from "../components/ui";
import type { Product, Category, Offer } from "../lib/types";

export function meta() {
  return [{ title: "Shoppie – Shop Smart" }, { name: "description", content: "Your one-stop shop for quality products." }];
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    Promise.all([
      getProducts({ limit: 8 }),
      getCategories(),
      getOffers(),
    ]).then(([pRes, cRes, oRes]) => {
      setProducts(pRes.data.data.products ?? []);
      setCategories((cRes.data.data.categories ?? []).slice(0, 8));
      setOffers(oRes.data.data.offers ?? []);
    }).finally(() => setLoading(false));
  }, []);

  const handleAddToCart = async (id: string) => {
    try { await addToCart(id, 1); } catch { window.location.href = "/login"; }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-slate-950 text-white overflow-hidden min-h-[400px] flex items-center">
        {/* Dynamic Abstract Tech SVG Background Pattern */}
        <div className="absolute inset-0 z-0">
          <svg className="w-full h-full object-cover opacity-40" viewBox="0 0 1440 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grid-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7928CA" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#0072FF" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#00F2FE" stopOpacity="0.4" />
              </linearGradient>
              <radialGradient id="glow-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#7928CA" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#090D1A" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* Ambient base radial glow */}
            <circle cx="720" cy="300" r="600" fill="url(#glow-grad)" className="animate-pulse" />
            {/* Dynamic abstract lines and grids */}
            <path d="M 0,150 L 1440,150 M 0,300 L 1440,300 M 0,450 L 1440,450" stroke="url(#grid-grad)" strokeWidth="0.5" strokeDasharray="5 5" />
            <path d="M 360,0 L 360,600 M 720,0 L 720,600 M 1080,0 L 1080,600" stroke="url(#grid-grad)" strokeWidth="0.5" strokeDasharray="5 5" />
            {/* Glowing neon paths */}
            <path d="M-100,200 Q 300,100 720,350 T 1540,200" stroke="url(#grid-grad)" strokeWidth="3" fill="none" className="opacity-60" />
            <path d="M-100,400 Q 400,500 720,250 T 1540,400" stroke="url(#grid-grad)" strokeWidth="2" fill="none" className="opacity-40" />
            {/* Futuristic floating dust points */}
            <circle cx="200" cy="100" r="3" fill="#00F2FE" className="animate-ping" />
            <circle cx="1200" cy="400" r="4" fill="#7928CA" className="animate-ping" style={{ animationDelay: "1.5s" }} />
            <circle cx="900" cy="150" r="2" fill="#0072FF" className="animate-ping" style={{ animationDelay: "0.8s" }} />
          </svg>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Zap className="h-4 w-4 text-yellow-400" /> New arrivals every week
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Shop Smart,<br />
              <span className="text-indigo-300">Live Better</span>
            </h1>
            <p className="text-lg text-indigo-200 mb-8 max-w-lg">
              Discover thousands of products at unbeatable prices. Quality guaranteed, delivered to your door.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="inline-flex items-center gap-2 bg-white text-indigo-700 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors shadow-lg">
                <ShoppingBag className="h-5 w-5" /> Shop Now
              </Link>
              <Link to="/products" className="inline-flex items-center gap-2 border border-white/30 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/10 transition-colors">
                Browse Categories <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: <Truck className="h-5 w-5 text-indigo-600" />, title: "Free Delivery", sub: "On orders above ₹499" },
              { icon: <Shield className="h-5 w-5 text-emerald-600" />, title: "Secure Payment", sub: "100% safe & secure" },
              { icon: <RotateCcw className="h-5 w-5 text-amber-600" />, title: "Easy Returns", sub: "7-day return policy" },
              { icon: <Zap className="h-5 w-5 text-purple-600" />, title: "Fast Shipping", sub: "2-3 business days" },
            ].map(({ icon, title, sub }) => (
              <div key={title} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50">{icon}</div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{title}</p>
                  <p className="text-xs text-slate-500">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Offers Banner */}
      {offers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Flame className="h-5 w-5 text-orange-500" /> Hot Offers</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {offers.slice(0, 3).map((offer) => (
              <div key={offer._id} className="relative rounded-2xl overflow-hidden bg-linear-to-br from-indigo-600 to-purple-700 text-white p-6 shadow-md">
                {offer.image?.url && (
                  <img src={offer.image.url} alt={offer.title} className="absolute inset-0 h-full w-full object-cover opacity-20" />
                )}
                <div className="relative">
                  <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                    {offer.discountPercentage}% OFF
                  </span>
                  <h3 className="text-lg font-bold mb-1">{offer.title}</h3>
                  <p className="text-sm text-white/80 line-clamp-2">{offer.description}</p>
                  <p className="mt-3 text-xs text-white/60">Valid until {new Date(offer.validUntil).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-slate-900">Shop by Category</h2>
            <Link to="/products" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/products?category=${cat._id}`}
                className="group flex flex-col items-center gap-2 p-3 rounded-2xl bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all text-center"
              >
                <div className="h-14 w-14 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center">
                  {cat.image?.url ? (
                    <img src={cat.image.url} alt={cat.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform" />
                  ) : (
                    <ShoppingBag className="h-6 w-6 text-slate-400" />
                  )}
                </div>
                <span className="text-xs font-medium text-slate-700 line-clamp-2 leading-tight">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-900">Featured Products</h2>
          <Link to="/products" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {products.length === 0 ? (
          <div className="text-center py-16 text-slate-400">No products available yet.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
