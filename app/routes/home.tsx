import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, ShoppingBag, Truck, Shield, RotateCcw, Zap, Flame } from "lucide-react";
import { motion } from "framer-motion";
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
      <section className="relative bg-slate-950 text-white overflow-hidden min-h-120 sm:min-h-130 flex items-center">
        {/* Background Video Banner */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-45"
          >
            <source src="/video/Cinematic_D_commercial_render.mp4" type="video/mp4" />
          </video>
          {/* Ambient Overlay for text contrast */}
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-transparent to-slate-950/40" />
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

      {/* Trust Badges displaying Framer Motion image cards */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { image: "/images/free_delivery.jpg", title: "Free Delivery", sub: "On orders above ₹499" },
              { image: "/images/secure_payment.jpg", title: "Secure Payment", sub: "100% safe & secure" },
              { image: "/images/easy_returns.jpg", title: "Easy Returns", sub: "7-day return policy" },
              { image: "/images/fast_shipping.jpg", title: "Fast Shipping", sub: "2-3 business days" },
            ].map(({ image, title, sub }) => (
              <motion.div
                key={title}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
                }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative h-48 rounded-2xl overflow-hidden shadow-lg border border-slate-800/80 cursor-pointer"
              >
                <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/60 to-transparent transition-opacity duration-300 group-hover:opacity-90" />
                <div className="absolute inset-0 p-5 flex flex-col justify-end">
                  <h3 className="text-lg font-bold text-white mb-1 drop-shadow-md">{title}</h3>
                  <p className="text-xs text-slate-300 font-medium">{sub}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Offers Banner */}
      {offers.length > 0 && (
        <section className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" /> Hot Offers
            </h2>
          </div>
          <div className="flex gap-4 overflow-x-auto px-4 sm:px-6 lg:px-8 pb-3 scrollbar-hide">
            {offers.map((offer, i) => (
              <motion.div
                key={offer._id}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 100, damping: 15, delay: i * 0.08 }}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative h-44 w-96 shrink-0 rounded-2xl overflow-hidden shadow-lg border border-slate-800/80 cursor-pointer"
              >
                {offer.image?.url ? (
                  <img src={offer.image.url} alt={offer.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <div className="absolute inset-0 bg-slate-800" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
                <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow">
                  {offer.discountPercentage}% OFF
                </span>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-sm font-bold text-white leading-snug mb-0.5">{offer.title}</h3>
                  <p className="text-xs text-white line-clamp-1">{offer.description}</p>
                  <p className="mt-1 text-[10px] text-white">Valid until {new Date(offer.validUntil).toLocaleDateString()}</p>
                </div>
              </motion.div>
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
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.04 }
              }
            }}
            className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3"
          >
            {categories.map((cat) => (
              <motion.div
                key={cat._id}
                variants={{
                  hidden: { opacity: 0, scale: 0.9, y: 15 },
                  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 15 } }
                }}
                whileHover={{ y: -6, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  to={`/products?category=${cat._id}`}
                  className="group flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-white border border-slate-100 hover:shadow-lg transition-all text-center h-full"
                >
                  <div className="h-16 w-16 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center shadow-inner">
                    {cat.image?.url ? (
                      <img src={cat.image.url} alt={cat.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <ShoppingBag className="h-7 w-7 text-slate-400" />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 line-clamp-2 leading-tight group-hover:text-indigo-400 transition-colors duration-300">
                    {cat.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
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
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
