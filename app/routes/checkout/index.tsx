import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { MapPin, CreditCard, Truck, ArrowLeft, Check } from "lucide-react";
import { placeOrderCOD, createRazorpayOrder, verifyPayment } from "../../lib/api";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { Button, FormField, Input, Select } from "../../components/ui";
import type { ShippingAddress } from "../../lib/types";

export function meta() {
  return [{ title: "Checkout – Shoppie" }];
}

const INDIAN_STATES = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh","Puducherry"];

declare global { interface Window { Razorpay: new (opts: object) => { open: () => void }; } }

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, cartTotal, refreshCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  const [address, setAddress] = useState<ShippingAddress>({
    fullName: user?.fullName ?? "",
    phone: user?.phoneNumber ?? "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "razorpay">("cod");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Partial<ShippingAddress>>({});

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-600 mb-4">Please sign in to checkout.</p>
        <Link to="/login" className="text-indigo-600 hover:underline">Sign In</Link>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-600 mb-4">Your cart is empty.</p>
        <Link to="/products" className="text-indigo-600 hover:underline">Continue Shopping</Link>
      </div>
    );
  }

  const validate = () => {
    const e: Partial<ShippingAddress> = {};
    if (!address.fullName.trim()) e.fullName = "Full name is required";
    if (!/^[6-9]\d{9}$/.test(address.phone)) e.phone = "Enter a valid 10-digit mobile number";
    if (!address.addressLine.trim()) e.addressLine = "Address is required";
    if (!address.city.trim()) e.city = "City is required";
    if (!address.state) e.state = "State is required";
    if (!/^\d{6}$/.test(address.pincode)) e.pincode = "Enter a valid 6-digit pincode";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCOD = async () => {
    if (!validate()) return;
    setLoading(true);
    setError("");
    try {
      const res = await placeOrderCOD(address);
      await refreshCart();
      navigate(`/orders?success=${res.data.data.order._id}`);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? "Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpay = async () => {
    if (!validate()) return;
    setLoading(true);
    setError("");
    try {
      const res = await createRazorpayOrder(address);
      const { razorpayOrder, key } = res.data.data;

      const options = {
        key,
        amount: razorpayOrder.amount,
        currency: "INR",
        name: "Shoppie",
        description: "Order Payment",
        order_id: razorpayOrder.id,
        prefill: { name: user?.fullName, email: user?.email, contact: address.phone },
        theme: { color: "#4f46e5" },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const verifyRes = await verifyPayment({ ...response, shippingAddress: address });
            await refreshCart();
            navigate(`/orders?success=${verifyRes.data.data.order._id}`);
          } catch {
            setError("Payment verification failed. Contact support.");
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      };

      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => { new window.Razorpay(options).open(); };
        document.body.appendChild(script);
      } else {
        new window.Razorpay(options).open();
      }
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? "Failed to initiate payment.");
      setLoading(false);
    }
  };

  const total = cartTotal + (cartTotal >= 499 ? 0 : 49);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Cart
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Address + Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-5 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-indigo-600" /> Shipping Address
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Full Name" required error={errors.fullName}>
                <Input value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} placeholder="John Doe" />
              </FormField>
              <FormField label="Phone Number" required error={errors.phone}>
                <Input value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} placeholder="9876543210" maxLength={10} />
              </FormField>
              <FormField label="Address Line" required error={errors.addressLine} className="sm:col-span-2">
                <Input value={address.addressLine} onChange={(e) => setAddress({ ...address, addressLine: e.target.value })} placeholder="House no., Street, Area" />
              </FormField>
              <FormField label="City" required error={errors.city}>
                <Input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} placeholder="Mumbai" />
              </FormField>
              <FormField label="State" required error={errors.state}>
                <Select value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })}>
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </FormField>
              <FormField label="Pincode" required error={errors.pincode}>
                <Input value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} placeholder="400001" maxLength={6} />
              </FormField>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-5 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-indigo-600" /> Payment Method
            </h2>
            <div className="space-y-3">
              {[
                { value: "cod", label: "Cash on Delivery", sub: "Pay when your order arrives", icon: <Truck className="h-5 w-5 text-amber-600" /> },
                { value: "razorpay", label: "Pay Online", sub: "UPI, Cards, Net Banking via Razorpay", icon: <CreditCard className="h-5 w-5 text-indigo-600" /> },
              ].map(({ value, label, sub, icon }) => (
                <label
                  key={value}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === value ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300"}`}
                >
                  <input type="radio" name="payment" value={value} checked={paymentMethod === value} onChange={() => setPaymentMethod(value as "cod" | "razorpay")} className="sr-only" />
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${paymentMethod === value ? "bg-white shadow-sm" : "bg-slate-50"}`}>{icon}</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">{label}</p>
                    <p className="text-xs text-slate-500">{sub}</p>
                  </div>
                  {paymentMethod === value && <Check className="h-5 w-5 text-indigo-600" />}
                </label>
              ))}
            </div>
          </div>

          {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

          <Button
            onClick={paymentMethod === "cod" ? handleCOD : handleRazorpay}
            loading={loading}
            size="lg"
            fullWidth
          >
            {paymentMethod === "cod" ? "Place Order (COD)" : "Pay Now"}
          </Button>
        </div>

        {/* Right: Order Summary */}
        <div>
          <div className="sticky top-24 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-800">Order Summary</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {cart.items.map((item) => {
                const p = item.product;
                if (!p) return null;
                return (
                  <div key={p._id} className="flex gap-3">
                    <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-slate-50 border border-slate-100">
                      {p.images[0]?.url ? <img src={p.images[0].url} alt={p.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-lg">📦</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800 line-clamp-1">{p.name}</p>
                      <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-800 shrink-0">₹{(p.price * item.quantity).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-slate-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>₹{cartTotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-slate-600"><span>Delivery</span><span className={cartTotal >= 499 ? "text-emerald-600" : ""}>{cartTotal >= 499 ? "FREE" : "₹49"}</span></div>
              <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
