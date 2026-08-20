import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Package, ChevronDown, ChevronUp, CheckCircle, X } from "lucide-react";
import { getMyOrders, cancelOrder } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { Badge, Button, PageLoader, EmptyState, ConfirmDialog } from "../../components/ui";
import type { Order } from "../../lib/types";

export function meta() {
  return [{ title: "My Orders – Shoppie" }];
}

const statusVariant: Record<string, string> = {
  pending: "warning", confirmed: "info", shipped: "info", delivered: "success", cancelled: "danger",
};

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

  useEffect(() => {
    if (!isAuthenticated) return;
    getMyOrders()
      .then((r) => setOrders(r.data.data.orders ?? []))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success toast */}
      {showSuccess && (
        <div className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-800">Order placed successfully!</p>
            <p className="text-xs text-emerald-600">We'll notify you when it's shipped.</p>
          </div>
          <button onClick={() => setShowSuccess(false)} className="p-1 rounded-lg hover:bg-emerald-100 transition-colors">
            <X className="h-4 w-4 text-emerald-600" />
          </button>
        </div>
      )}

      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <EmptyState
          icon={<Package className="h-12 w-12 text-slate-300" />}
          title="No orders yet"
          description="You haven't placed any orders. Start shopping!"
          action={
            <Link to="/products" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors">
              Shop Now
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedId === order._id;
            const canCancel = ["pending", "confirmed"].includes(order.status) && !(order.paymentMethod === "razorpay" && order.paymentStatus === "paid");
            return (
              <div key={order._id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${successOrderId === order._id ? "border-emerald-300" : "border-slate-100"}`}>
                {/* Header */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : order._id)}
                >
                  <div className="flex items-center gap-4 flex-wrap">
                    <div>
                      <p className="text-xs text-slate-500">Order ID</p>
                      <p className="font-mono text-sm font-semibold text-slate-800">#{order._id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-xs text-slate-500">Date</p>
                      <p className="text-sm text-slate-700">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Total</p>
                      <p className="text-sm font-bold text-slate-900">₹{order.totalAmount.toLocaleString()}</p>
                    </div>
                    <Badge label={order.status.charAt(0).toUpperCase() + order.status.slice(1)} variant={statusVariant[order.status] ?? "default"} />
                    <Badge label={order.paymentMethod.toUpperCase()} variant="default" />
                  </div>
                  {isExpanded ? <ChevronUp className="h-5 w-5 text-slate-400 shrink-0" /> : <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />}
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div className="border-t border-slate-100 px-5 py-5 space-y-5">
                    {/* Items */}
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Items</h3>
                      <div className="space-y-3">
                        {order.orderItems.map((item, i) => {
                          const p = typeof item.product === "object" ? item.product : null;
                          return (
                            <div key={i} className="flex items-center gap-3">
                              <div className="h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                                {p?.images[0]?.url ? <img src={p.images[0].url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><Package className="h-6 w-6 text-slate-300" /></div>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800 line-clamp-1">{p?.name ?? "Product"}</p>
                                <p className="text-xs text-slate-500">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                              </div>
                              <span className="text-sm font-semibold text-slate-800 shrink-0">₹{(item.quantity * item.price).toLocaleString()}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Shipping */}
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Shipping Address</h3>
                      <div className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 space-y-0.5">
                        <p className="font-medium text-slate-800">{order.shippingAddress.fullName}</p>
                        <p>{order.shippingAddress.phone}</p>
                        <p>{order.shippingAddress.addressLine}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    {canCancel && (
                      <Button variant="danger" size="sm" onClick={() => setCancelTarget(order)}>
                        Cancel Order
                      </Button>
                    )}
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
    </div>
  );
}
