import { useState } from "react";
import { Link } from "react-router";
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, ShoppingCart, Package } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { Button, EmptyState, Spinner, ConfirmDialog, PageLoader } from "../../components/ui";

export function meta() {
  return [{ title: "Cart – Shoppie" }];
}

export default function CartPage() {
  const { cart, cartTotal, loading, updateItem, removeItem, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [clearOpen, setClearOpen] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <EmptyState
          icon={<ShoppingCart className="h-8 w-8" />}
          title="Your cart is empty"
          description="Sign in to view your cart and start shopping."
          action={
            <Link to="/login" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors">
              Sign In to Continue
            </Link>
          }
        />
      </div>
    );
  }

  if (loading) return <PageLoader />;

  if (cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <EmptyState
          icon={<ShoppingCart className="h-8 w-8" />}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet."
          action={
            <Link to="/products" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors">
              <ShoppingBag className="h-5 w-5" /> Start Shopping
            </Link>
          }
        />
      </div>
    );
  }

  const handleQtyChange = async (productId: string, qty: number) => {
    setUpdatingId(productId);
    try { await updateItem(productId, qty); } finally { setUpdatingId(null); }
  };

  const handleRemove = async (productId: string) => {
    setRemovingId(productId);
    try { await removeItem(productId); } finally { setRemovingId(null); }
  };

  const handleClear = async () => {
    setClearLoading(true);
    try { await clearCart(); setClearOpen(false); } finally { setClearLoading(false); }
  };

  const savings = cart.items.reduce((s, i) => s + i.quantity * ((i.product?.mrp ?? 0) - (i.product?.price ?? 0)), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Shopping Cart <span className="text-slate-400 font-normal text-lg">({cart.items.length} items)</span></h1>
        <Button variant="ghost" size="sm" onClick={() => setClearOpen(true)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
          <Trash2 className="h-4 w-4" /> Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {cart.items.map((item) => {
            const p = item.product;
            if (!p) return null;
            const isUpdating = updatingId === p._id;
            const isRemoving = removingId === p._id;
            return (
              <div key={p._id} className={`cart-item flex gap-4 bg-white rounded-2xl border border-slate-100 p-4 shadow-sm transition-opacity ${isRemoving ? "opacity-50" : ""}`}>
                <Link to={`/products/${p._id}`} className="shrink-0">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                    {p.images[0]?.url ? (
                      <img src={p.images[0].url} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-8 w-8 text-slate-300" />
                      </div>
                    )}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${p._id}`} className="text-sm font-semibold text-slate-800 hover:text-indigo-600 transition-colors line-clamp-2">{p.name}</Link>
                  {p.brand && <p className="text-xs text-slate-400 mt-0.5">{p.brand}</p>}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900">₹{p.price.toLocaleString()}</span>
                    {p.mrp > p.price && <span className="text-xs text-slate-400 line-through">₹{p.mrp.toLocaleString()}</span>}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
                    {/* Qty */}
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => handleQtyChange(p._id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || isUpdating}
                        className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-3 py-1.5 text-sm font-semibold text-slate-800 border-x border-slate-200 min-w-10 text-center">
                        {isUpdating ? <Spinner size="sm" /> : item.quantity}
                      </span>
                      <button
                        onClick={() => handleQtyChange(p._id, item.quantity + 1)}
                        disabled={item.quantity >= p.stock || isUpdating}
                        className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900">₹{(p.price * item.quantity).toLocaleString()}</span>
                      <button onClick={() => handleRemove(p._id)} disabled={isRemoving} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl bg-white border border-slate-100 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-800">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({cart.items.length} items)</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>You save</span>
                  <span>−₹{savings.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Delivery</span>
                <span className={cartTotal >= 499 ? "text-emerald-600" : ""}>{cartTotal >= 499 ? "FREE" : "₹49"}</span>
              </div>
              {cartTotal < 499 && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                  Add ₹{(499 - cartTotal).toLocaleString()} more for free delivery!
                </p>
              )}
            </div>
            <div className="border-t border-slate-100 pt-3 flex justify-between font-bold text-slate-900">
              <span>Total</span>
              <span>₹{(cartTotal + (cartTotal >= 499 ? 0 : 49)).toLocaleString()}</span>
            </div>
            <Link to="/checkout" className="flex items-center justify-center gap-2 w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/products" className="flex items-center justify-center gap-2 w-full border border-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        onConfirm={handleClear}
        loading={clearLoading}
        title="Clear Cart"
        message="Are you sure you want to remove all items from your cart?"
        confirmLabel="Clear Cart"
      />
    </div>
  );
}
