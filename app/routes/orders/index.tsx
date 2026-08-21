import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Package, ChevronDown, ChevronUp, CheckCircle, X, FileText, Printer, Star, MessageSquare } from "lucide-react";
import { getMyOrders, cancelOrder, getOrderInvoice, getReviewEligibility, postReview } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { Badge, Button, PageLoader, EmptyState, ConfirmDialog, Modal, Spinner, StarRating } from "../../components/ui";
import type { Order, Review } from "../../lib/types";

interface ReviewState {
  rating: number;
  comment: string;
  hasReviewed: boolean;
  existingReview: Review | null;
  submitting: boolean;
  submitted: boolean;
  error: string;
  showForm: boolean;
}

// ── Star Picker ───────────────────────────────────────────
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="transition-all duration-150 hover:scale-125 active:scale-95"
        >
          <Star
            className="h-7 w-7 drop-shadow-sm transition-all duration-150"
            style={{
              fill: s <= (hovered || value) ? "#f59e0b" : "#e2e8f0",
              color: s <= (hovered || value) ? "#f59e0b" : "#cbd5e1",
              filter: s <= (hovered || value) ? "drop-shadow(0 0 4px #fbbf2466)" : "none",
            }}
          />
        </button>
      ))}
    </div>
  );
}

// ── Product Review Form ───────────────────────────────────
function ProductReviewForm({
  productId, productName, state, onChange, onSubmit,
}: {
  productId: string; productName: string;
  state: ReviewState;
  onChange: (patch: Partial<ReviewState>) => void;
  onSubmit: (productId: string) => void;
}) {
  if (state.submitted || state.hasReviewed) {
    return (
      <div className="mt-2.5 flex items-center gap-2.5 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 shrink-0">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
        </div>
        <StarRating rating={state.existingReview?.rating ?? state.rating} count={0} />
        <span className="text-xs text-emerald-700 font-medium">Review submitted</span>
      </div>
    );
  }

  if (!state.showForm) {
    return (
      <button
        onClick={() => onChange({ showForm: true })}
        className="mt-2.5 flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-all duration-200 group"
      >
        <MessageSquare className="h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110" />
        Rate this product
      </button>
    );
  }

  return (
    <div
      className="mt-3 rounded-2xl border border-indigo-100 bg-linear-to-br from-indigo-50/80 to-slate-50 p-4 space-y-3"
      style={{ animation: "fadeSlideDown 0.2s ease both" }}
    >
      <p className="text-xs font-semibold text-slate-600 truncate">{productName}</p>
      <StarPicker value={state.rating} onChange={(v) => onChange({ rating: v, error: "" })} />
      <textarea
        value={state.comment}
        onChange={(e) => onChange({ comment: e.target.value })}
        rows={2}
        maxLength={1000}
        placeholder="Share your experience..."
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all resize-none shadow-sm"
      />
      {state.error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <span className="inline-block h-1 w-1 rounded-full bg-red-500" />{state.error}
        </p>
      )}
      <div className="flex gap-2">
        <Button size="sm" loading={state.submitting} onClick={() => onSubmit(productId)}>Submit Review</Button>
        <Button size="sm" variant="ghost" onClick={() => onChange({ showForm: false, error: "" })}>Cancel</Button>
      </div>
    </div>
  );
}

export function meta() {
  return [{ title: "My Orders – Shoppie" }];
}

const statusVariant: Record<string, string> = {
  pending: "warning", confirmed: "info", shipped: "info", delivered: "success", cancelled: "danger",
};

// ── Invoice Modal ─────────────────────────────────────────
function InvoiceModal({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getOrderInvoice(orderId)
      .then((r) => setOrder(r.data.data.order))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open("", "_blank", "width=800,height=900");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html><head>
      <title>Invoice – #${order?._id.slice(-8).toUpperCase()}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1e293b; background: #fff; padding: 32px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0; }
        .brand { font-size: 22px; font-weight: 800; color: #4f46e5; letter-spacing: -0.5px; }
        .brand span { color: #1e293b; }
        .invoice-meta { text-align: right; }
        .invoice-meta h2 { font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
        .invoice-meta p { color: #64748b; font-size: 12px; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
        .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; margin-bottom: 8px; }
        .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; }
        .info-box p { margin-bottom: 3px; color: #334155; line-height: 1.5; }
        .info-box .name { font-weight: 600; color: #1e293b; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        thead th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; }
        tbody td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #334155; }
        tbody tr:last-child td { border-bottom: none; }
        .text-right { text-align: right; }
        .totals { margin-left: auto; width: 260px; }
        .totals-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; color: #475569; }
        .totals-row.total { border-top: 2px solid #e2e8f0; margin-top: 6px; padding-top: 10px; font-size: 15px; font-weight: 700; color: #1e293b; }
        .badges { display: flex; gap: 8px; margin-top: 6px; }
        .badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; }
        .badge-success { background: #dcfce7; color: #166534; }
        .badge-warning { background: #fef9c3; color: #854d0e; }
        .badge-info { background: #dbeafe; color: #1e40af; }
        .badge-danger { background: #fee2e2; color: #991b1b; }
        .badge-default { background: #f1f5f9; color: #475569; }
        .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 11px; }
      </style>
      </head><body>${content.innerHTML}</body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  const user = order && typeof order.user === "object" ? order.user : null;
  const subtotal = order?.orderItems.reduce((s, i) => s + i.quantity * i.price, 0) ?? 0;
  const logoUrl = typeof window !== "undefined" ? `${window.location.origin}/logo.png` : "/logo.png";

  return (
    <Modal open onClose={onClose} title="Order Invoice" size="lg">
      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : !order ? (
        <p className="text-center text-slate-500 py-8">Failed to load invoice.</p>
      ) : (
        <>
          {/* Print button */}
          <div className="flex justify-end mb-4">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4" /> Print / Save PDF
            </Button>
          </div>

          {/* Invoice content */}
          <div ref={printRef} className="text-sm text-slate-700">
            {/* Header */}
            <div className="header flex justify-between items-start pb-5 mb-6 border-b-2 border-slate-200">
              <div>
                <img src={logoUrl} alt="Shoppie" className="h-16 w-auto object-contain" />
                <p className="text-xs text-slate-400 mt-1">Your one-stop shop</p>
              </div>
              <div className="invoice-meta text-right">
                <h2 className="text-lg font-bold text-slate-800">INVOICE</h2>
                <p className="text-xs text-slate-500 mt-1">#{order._id.slice(-8).toUpperCase()}</p>
                <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                <div className="badges flex gap-2 justify-end mt-2">
                  <span className={`badge badge-${statusVariant[order.status] ?? "default"} inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <span className={`badge badge-${order.paymentStatus === "paid" ? "success" : "warning"} inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium`}>
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Billed to + Shipping */}
            <div className="grid2 grid grid-cols-2 gap-5 mb-6">
              <div>
                <p className="section-title text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Billed To</p>
                <div className="info-box bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-0.5">
                  <p className="name font-semibold text-slate-800">{user?.fullName ?? order.shippingAddress.fullName}</p>
                  {user?.email && <p className="text-slate-500 text-xs">{user.email}</p>}
                  {user?.phoneNumber && <p className="text-slate-500 text-xs">{user.phoneNumber}</p>}
                </div>
              </div>
              <div>
                <p className="section-title text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Ship To</p>
                <div className="info-box bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-0.5">
                  <p className="name font-semibold text-slate-800">{order.shippingAddress.fullName}</p>
                  <p className="text-slate-500 text-xs">{order.shippingAddress.phone}</p>
                  <p className="text-slate-500 text-xs">{order.shippingAddress.addressLine}</p>
                  <p className="text-slate-500 text-xs">{order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}</p>
                </div>
              </div>
            </div>

            {/* Payment info */}
            <div className="mb-6">
              <p className="section-title text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Payment</p>
              <div className="info-box bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-600">
                <span><span className="font-medium text-slate-700">Method:</span> {order.paymentMethod === "razorpay" ? "Razorpay (Online)" : "Cash on Delivery"}</span>
                <span><span className="font-medium text-slate-700">Status:</span> {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}</span>
                {order.razorpayPaymentId && <span><span className="font-medium text-slate-700">Txn ID:</span> {order.razorpayPaymentId}</span>}
              </div>
            </div>

            {/* Items table */}
            <p className="section-title text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Order Items</p>
            <table className="w-full border-collapse mb-5">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-400 rounded-tl-lg">#</th>
                  <th className="text-left px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">Product</th>
                  <th className="text-right px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">Unit Price</th>
                  <th className="text-right px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">Qty</th>
                  <th className="text-right px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-400 rounded-tr-lg">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.orderItems.map((item, i) => {
                  const p = typeof item.product === "object" ? item.product : null;
                  return (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="px-3 py-2.5 text-slate-400 text-xs">{i + 1}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                            {p?.images[0]?.url
                              ? <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />
                              : <div className="flex h-full items-center justify-center"><Package className="h-4 w-4 text-slate-300" /></div>}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 text-xs leading-snug">{p?.name ?? "Product"}</p>
                            {p?.brand && <p className="text-[10px] text-slate-400">{p.brand}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right text-xs text-slate-600">₹{item.price.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-right text-xs text-slate-600">{item.quantity}</td>
                      <td className="px-3 py-2.5 text-right text-sm font-semibold text-slate-800">₹{(item.quantity * item.price).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Totals */}
            <div className="totals ml-auto w-64">
              <div className="totals-row flex justify-between py-1 text-xs text-slate-500">
                <span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="totals-row flex justify-between py-1 text-xs text-slate-500">
                <span>Shipping</span><span className="text-emerald-600">Free</span>
              </div>
              <div className="totals-row total flex justify-between pt-2.5 mt-1.5 border-t-2 border-slate-200 font-bold text-slate-900">
                <span>Total</span><span>₹{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="footer mt-8 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
              Thank you for shopping with Shoppie! For support, contact us at support@shoppie.com
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}

// ── Orders Page ───────────────────────────────────────────
export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const successOrderId = searchParams.get("success");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(successOrderId);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(!!successOrderId);
  const [invoiceOrderId, setInvoiceOrderId] = useState<string | null>(null);
  // productId -> ReviewState
  const [reviewStates, setReviewStates] = useState<Record<string, ReviewState>>({});

  useEffect(() => {
    if (!isAuthenticated) return;
    getMyOrders()
      .then((r) => setOrders(r.data.data.orders ?? []))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleExpand = async (order: Order) => {
    const next = expandedId === order._id ? null : order._id;
    setExpandedId(next);
    // Only fetch eligibility for delivered orders when expanding
    if (next && order.status === "delivered") {
      const productIds = order.orderItems
        .map((item) => (typeof item.product === "object" ? item.product._id : item.product))
        .filter(Boolean);
      await Promise.all(
        productIds.map(async (pid) => {
          if (reviewStates[pid]) return; // already fetched
          try {
            const r = await getReviewEligibility(pid);
            const { hasReviewed, existingReview } = r.data.data;
            setReviewStates((prev) => ({
              ...prev,
              [pid]: {
                rating: existingReview?.rating ?? 0,
                comment: existingReview?.comment ?? "",
                hasReviewed,
                existingReview: existingReview ?? null,
                submitting: false,
                submitted: false,
                error: "",
                showForm: false,
              },
            }));
          } catch {
            // ignore — review section just won't show
          }
        })
      );
    }
  };

  const patchReview = (pid: string, patch: Partial<ReviewState>) =>
    setReviewStates((prev) => ({ ...prev, [pid]: { ...prev[pid], ...patch } }));

  const handleSubmitReview = async (productId: string) => {
    const s = reviewStates[productId];
    if (!s) return;
    if (s.rating === 0) { patchReview(productId, { error: "Please select a star rating." }); return; }
    if (!s.comment.trim()) { patchReview(productId, { error: "Please write a comment." }); return; }
    patchReview(productId, { submitting: true, error: "" });
    try {
      await postReview(productId, { rating: s.rating, comment: s.comment.trim() });
      patchReview(productId, {
        submitting: false,
        submitted: true,
        hasReviewed: true,
        showForm: false,
        existingReview: { _id: "", user: "", product: productId, order: "", rating: s.rating, comment: s.comment.trim(), createdAt: new Date().toISOString() },
      });
    } catch (err: unknown) {
      patchReview(productId, {
        submitting: false,
        error: (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? "Failed to submit review.",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-600 mb-4">Please sign in to view your orders.</p>
        <Link to="/login" className="text-indigo-600 hover:underline">Sign In</Link>
      </div>
    );
  }

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      await cancelOrder(cancelTarget._id);
      setOrders((prev) => prev.map((o) => o._id === cancelTarget._id ? { ...o, status: "cancelled" } : o));
      setCancelTarget(null);
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? "Cannot cancel order.");
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
      <style>{`
        @keyframes fadeSlideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeSlideUp   { from { opacity:0; transform:translateY(8px);  } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn        { from { opacity:0; } to { opacity:1; } }
        .order-expand { animation: fadeSlideDown 0.22s cubic-bezier(0.16,1,0.3,1) both; }
        .order-card   { animation: fadeSlideUp 0.3s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

        {/* Success banner */}
        {showSuccess && (
          <div
            className="mb-8 flex items-center gap-4 rounded-2xl border border-emerald-200 bg-linear-to-r from-emerald-50 to-teal-50 px-5 py-4 shadow-sm"
            style={{ animation: "fadeSlideDown 0.3s ease both" }}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-800">Order placed successfully!</p>
              <p className="text-xs text-emerald-600 mt-0.5">We'll notify you when it's shipped.</p>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="rounded-lg p-1.5 text-emerald-500 hover:bg-emerald-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Orders</h1>
          <p className="text-sm text-slate-500 mt-1">{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p>
        </div>

        {orders.length === 0 ? (
          <EmptyState
            icon={<Package className="h-12 w-12 text-slate-300" />}
            title="No orders yet"
            description="You haven't placed any orders. Start shopping!"
            action={
              <Link to="/products" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                Shop Now
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order, idx) => {
              const isExpanded = expandedId === order._id;
              const canCancel = ["pending", "confirmed"].includes(order.status) && !(order.paymentMethod === "razorpay" && order.paymentStatus === "paid");
              const isSuccess = successOrderId === order._id;
              return (
                <div
                  key={order._id}
                  className={`order-card rounded-2xl border bg-white shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden ${
                    isSuccess ? "border-emerald-300 ring-1 ring-emerald-200" : "border-slate-200"
                  }`}
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  {/* Card header */}
                  <div
                    className={`flex items-center justify-between px-5 py-4 cursor-pointer select-none transition-colors duration-150 ${
                      isExpanded ? "bg-slate-50" : "hover:bg-slate-50/70"
                    }`}
                    onClick={() => handleExpand(order)}
                  >
                    <div className="flex items-center gap-5 flex-wrap">
                      {/* Order ID */}
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Order</p>
                        <p className="font-mono text-sm font-bold text-slate-800">#{order._id.slice(-8).toUpperCase()}</p>
                      </div>
                      {/* Date */}
                      <div className="hidden sm:block">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Date</p>
                        <p className="text-sm text-slate-700">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                      </div>
                      {/* Total */}
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Total</p>
                        <p className="text-sm font-bold text-slate-900">₹{order.totalAmount.toLocaleString()}</p>
                      </div>
                      {/* Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge label={order.status.charAt(0).toUpperCase() + order.status.slice(1)} variant={statusVariant[order.status] ?? "default"} />
                        <Badge label={order.paymentMethod === "razorpay" ? "Online" : "COD"} variant="default" />
                      </div>
                    </div>
                    <div className={`ml-3 shrink-0 rounded-full p-1.5 transition-all duration-200 ${
                      isExpanded ? "bg-indigo-100 text-indigo-600 rotate-0" : "bg-slate-100 text-slate-400"
                    }`}>
                      {isExpanded
                        ? <ChevronUp className="h-4 w-4" />
                        : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>

                  {/* Expanded body */}
                  {isExpanded && (
                    <div className="order-expand border-t border-slate-100 divide-y divide-slate-100">

                      {/* Items */}
                      <div className="px-5 py-5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Items</p>
                        <div className="space-y-4">
                          {order.orderItems.map((item, i) => {
                            const p = typeof item.product === "object" ? item.product : null;
                            const pid = p?._id ?? (typeof item.product === "string" ? item.product : "");
                            const rs = reviewStates[pid];
                            return (
                              <div key={i}>
                                <div className="flex items-center gap-3.5">
                                  <div className="h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm">
                                    {p?.images[0]?.url
                                      ? <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />
                                      : <div className="flex h-full items-center justify-center"><Package className="h-6 w-6 text-slate-300" /></div>}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 line-clamp-1">{p?.name ?? "Product"}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">Qty {item.quantity} &times; ₹{item.price.toLocaleString()}</p>
                                  </div>
                                  <span className="text-sm font-bold text-slate-900 shrink-0">₹{(item.quantity * item.price).toLocaleString()}</span>
                                </div>
                                {order.status === "delivered" && pid && rs && (
                                  <ProductReviewForm
                                    productId={pid}
                                    productName={p?.name ?? "Product"}
                                    state={rs}
                                    onChange={(patch) => patchReview(pid, patch)}
                                    onSubmit={handleSubmitReview}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Shipping */}
                      <div className="px-5 py-5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Shipping Address</p>
                        <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 text-sm text-slate-600 space-y-0.5">
                          <p className="font-semibold text-slate-800">{order.shippingAddress.fullName}</p>
                          <p className="text-xs">{order.shippingAddress.phone}</p>
                          <p className="text-xs">{order.shippingAddress.addressLine}</p>
                          <p className="text-xs">{order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="px-5 py-4 flex items-center gap-3 flex-wrap bg-slate-50/60">
                        <Button variant="outline" size="sm" onClick={() => setInvoiceOrderId(order._id)}>
                          <FileText className="h-3.5 w-3.5" /> Invoice
                        </Button>
                        {canCancel && (
                          <Button variant="danger" size="sm" onClick={() => setCancelTarget(order)}>
                            Cancel Order
                          </Button>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      <ConfirmDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        loading={cancelLoading}
        title="Cancel Order"
        message={`Are you sure you want to cancel order #${cancelTarget?._id.slice(-8).toUpperCase()}?`}
        confirmLabel="Cancel Order"
      />

      {invoiceOrderId && (
        <InvoiceModal orderId={invoiceOrderId} onClose={() => setInvoiceOrderId(null)} />
      )}

      </div>
    </div>
  );
}
