import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router";
import { ShoppingCart, Check, Truck, Shield, Star, ChevronRight, Package, User } from "lucide-react";
import { getProduct, getReviews, getReviewEligibility, postReview } from "../../lib/api";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { Button, Badge, StarRating, PageLoader, Spinner } from "../../components/ui";
import type { Product, Review } from "../../lib/types";

export function meta() {
  return [{ title: "Product – Shoppie" }];
}

// ── Star Picker ───────────────────────────────────────────
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className="h-7 w-7 transition-colors"
            style={{
              fill: s <= (hovered || value) ? "#fbbf24" : "#e2e8f0",
              color: s <= (hovered || value) ? "#fbbf24" : "#e2e8f0",
            }}
          />
        </button>
      ))}
    </div>
  );
}

// ── Review Card ───────────────────────────────────────────
function ReviewCard({ review }: { review: Review }) {
  const userName = typeof review.user === "object" ? review.user.fullName : "User";
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-2">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
            <User className="h-4 w-4 text-indigo-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{userName}</p>
            <p className="text-xs text-slate-400">
              {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </p>
          </div>
        </div>
        <StarRating rating={review.rating} count={0} />
      </div>
      <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────
export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [cartError, setCartError] = useState("");
  const { addToCart } = useCart();

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsPages, setReviewsPages] = useState(1);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Eligibility
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [existingReview, setExistingReview] = useState<Review | null>(null);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // ── Fetch helpers ─────────────────────────────────────
  const fetchReviews = useCallback(async (page: number) => {
    if (!id) return;
    setReviewsLoading(true);
    try {
      const r = await getReviews(id, page);
      setReviews(r.data.data.reviews ?? []);
      setReviewsTotal(r.data.total ?? 0);
      setReviewsPages(Math.max(1, r.data.pages ?? 1));
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);

  const fetchEligibility = useCallback(async () => {
    if (!id || !isAuthenticated) return;
    try {
      const r = await getReviewEligibility(id);
      const { canReview: can, hasReviewed: has, existingReview: er } = r.data.data;
      setCanReview(can);
      setHasReviewed(has);
      setExistingReview(er ?? null);
      if (er) { setRating(er.rating); setComment(er.comment); }
    } catch {
      // silently ignore — user just won't see the review button
    }
  }, [id, isAuthenticated]);

  // ── Effects ───────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    getProduct(id)
      .then((r) => setProduct(r.data.data.product))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetchReviews(reviewsPage); }, [fetchReviews, reviewsPage]);

  useEffect(() => { fetchEligibility(); }, [fetchEligibility]);

  // ── Handlers ──────────────────────────────────────────
  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    setCartError("");
    try {
      await addToCart(product._id, qty);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      if (msg?.includes("log in")) window.location.href = "/login";
      else setCartError(msg ?? "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (rating === 0) { setSubmitError("Please select a star rating."); return; }
    if (!comment.trim()) { setSubmitError("Please write a comment."); return; }
    setSubmitting(true);
    setSubmitError("");
    try {
      await postReview(id, { rating, comment: comment.trim() });
      setShowForm(false);
      // Refresh everything in parallel
      await Promise.all([
        fetchReviews(1),
        fetchEligibility(),
        getProduct(id).then((r) => setProduct(r.data.data.product)),
      ]);
      setReviewsPage(1);
    } catch (err: unknown) {
      setSubmitError(
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? "Failed to submit review."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePageChange = (p: number) => setReviewsPage(p);

  // ── Render ────────────────────────────────────────────
  if (loading) return <PageLoader />;
  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <p className="text-slate-500 mb-4">Product not found.</p>
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

          {product.ratings.count > 0 && (
            <StarRating rating={product.ratings.average} count={product.ratings.count} />
          )}

          <div className="flex items-end gap-3">
            <span className="text-3xl font-extrabold text-slate-900">₹{product.price.toLocaleString()}</span>
            {product.mrp > product.price && (
              <>
                <span className="text-lg text-slate-400 line-through mb-0.5">₹{product.mrp.toLocaleString()}</span>
                <Badge label={`${product.discount}% OFF`} variant="danger" />
              </>
            )}
          </div>

          <div>
            {product.stock === 0 ? (
              <Badge label="Out of Stock" variant="danger" />
            ) : product.stock < 10 ? (
              <Badge label={`Only ${product.stock} left!`} variant="warning" />
            ) : (
              <Badge label="In Stock" variant="success" />
            )}
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>

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
              {cartError && <p className="text-sm text-red-600">{cartError}</p>}
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

      {/* Reviews */}
      <div className="mt-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Reviews {reviewsTotal > 0 && <span className="text-slate-400 font-normal text-base">({reviewsTotal})</span>}
            </h2>
            {product.ratings.count > 0 && (
              <div className="mt-1">
                <StarRating rating={product.ratings.average} count={product.ratings.count} />
              </div>
            )}
          </div>

          {isAuthenticated && canReview && (
            <Button
              variant={showForm ? "secondary" : "outline"}
              size="sm"
              onClick={() => { setShowForm((v) => !v); setSubmitError(""); }}
            >
              <Star className="h-4 w-4" />
              {hasReviewed ? "Edit Your Review" : "Write a Review"}
            </Button>
          )}
          {!isAuthenticated && (
            <Link to="/login" className="text-sm text-indigo-600 hover:underline">Sign in to review</Link>
          )}
        </div>

        {/* Review form */}
        {showForm && (
          <form onSubmit={handleSubmitReview} className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mb-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-800">
              {hasReviewed ? "Update Your Review" : "Write Your Review"}
            </h3>
            <div>
              <p className="text-xs text-slate-500 mb-2">Your Rating <span className="text-red-500">*</span></p>
              <StarPicker value={rating} onChange={(v) => { setRating(v); setSubmitError(""); }} />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-2">Comment <span className="text-red-500">*</span></p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="Share your experience with this product..."
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
              />
              <p className="text-xs text-slate-400 text-right mt-1">{comment.length}/1000</p>
            </div>
            {submitError && <p className="text-xs text-red-600">{submitError}</p>}
            <div className="flex gap-3">
              <Button type="submit" size="sm" loading={submitting}>
                {hasReviewed ? "Update Review" : "Submit Review"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => { setShowForm(false); setSubmitError(""); }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Reviews list */}
        {reviewsLoading ? (
          <div className="flex justify-center py-10"><Spinner size="md" /></div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
            <Star className="h-10 w-10 mx-auto mb-3" style={{ color: "#e2e8f0" }} />
            <p className="text-sm font-medium text-slate-500">No reviews yet</p>
            {isAuthenticated && canReview && !showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-2 text-xs text-indigo-600 hover:underline"
              >
                Be the first to review this product
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <ReviewCard key={review._id} review={review} />
            ))}
            {reviewsPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button variant="outline" size="sm" disabled={reviewsPage === 1} onClick={() => handlePageChange(reviewsPage - 1)}>Prev</Button>
                <span className="text-sm text-slate-500">{reviewsPage} / {reviewsPages}</span>
                <Button variant="outline" size="sm" disabled={reviewsPage === reviewsPages} onClick={() => handlePageChange(reviewsPage + 1)}>Next</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
