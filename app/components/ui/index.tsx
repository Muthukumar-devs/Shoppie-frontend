import { type ReactNode, useEffect, useState, useCallback } from "react";
import { ShoppingCart, Package, Inbox, AlertTriangle, Star, X, Minus, Plus, CheckCircle2 } from "lucide-react";

// ── Button ────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({ variant = "primary", size = "md", loading, fullWidth, children, ...props }: ButtonProps) {
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    outline: "border border-slate-300 text-slate-700 hover:bg-slate-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "text-slate-600 hover:bg-slate-100",
  };
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${props.className ?? ""}`}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}

// ── Input ─────────────────────────────────────────────────
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all ${props.className ?? ""}`}
    />
  );
}

// ── Select ────────────────────────────────────────────────
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all ${props.className ?? ""}`}
    />
  );
}

// ── Textarea ──────────────────────────────────────────────
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={props.rows ?? 3}
      className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none ${props.className ?? ""}`}
    />
  );
}

// ── Spinner ───────────────────────────────────────────────
export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const s = { sm: "h-4 w-4 border-2", md: "h-8 w-8 border-2", lg: "h-12 w-12 border-[3px]" }[size];
  return <div className={`animate-spin rounded-full border-slate-200 border-t-indigo-600 ${s}`} />;
}

export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────
const badgeVariants: Record<string, string> = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
  danger: "bg-red-50 text-red-700 ring-red-600/20",
  info: "bg-blue-50 text-blue-700 ring-blue-600/20",
  default: "bg-slate-100 text-slate-700 ring-slate-500/20",
};

export function Badge({ label, variant = "default" }: { label: string; variant?: string }) {
  const cls = badgeVariants[variant] ?? badgeVariants["default"];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}>
      {label}
    </span>
  );
}

// ── Modal ─────────────────────────────────────────────────
interface ModalProps { open: boolean; onClose: () => void; title: string; children: ReactNode; size?: "sm" | "md" | "lg"; }

export function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  if (!open) return null;
  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${widths[size]} rounded-2xl bg-white shadow-2xl`}>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-800">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ── ConfirmDialog ─────────────────────────────────────────
interface ConfirmProps { open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; loading?: boolean; confirmLabel?: string; }

export function ConfirmDialog({ open, onClose, onConfirm, title, message, loading, confirmLabel = "Confirm" }: ConfirmProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>
        <p className="text-sm text-slate-600">{message}</p>
        <div className="flex w-full gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button variant="danger" onClick={onConfirm} loading={loading} className="flex-1">{confirmLabel}</Button>
        </div>
      </div>
    </Modal>
  );
}

// ── EmptyState ────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        {icon ?? <Inbox className="h-8 w-8" />}
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 mb-6 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}

// ── StarRating ────────────────────────────────────────────────────────────────
export function StarRating({ rating, count }: { rating: number; count: number }) {
  const pct = Math.min(100, Math.max(0, (rating / 5) * 100));
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative inline-flex">
        {/* Grey base layer */}
        <div className="flex">
          {stars.map((s) => (
            <Star key={s} className="h-3.5 w-3.5" style={{ fill: "#e2e8f0", color: "#e2e8f0", flexShrink: 0 }} />
          ))}
        </div>
        {/* Amber overlay — clipped by width only, no right anchor */}
        <div
          className="absolute top-0 left-0 h-full overflow-hidden"
          style={{ width: `${pct}%` }}
        >
          <div className="flex">
            {stars.map((s) => (
              <Star key={s} className="h-3.5 w-3.5" style={{ fill: "#fbbf24", color: "#fbbf24", flexShrink: 0 }} />
            ))}
          </div>
        </div>
      </div>
      <span className="text-xs font-medium text-slate-600">{rating.toFixed(1)}</span>
      {count > 0 && <span className="text-xs text-slate-400">({count})</span>}
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────
export function Pagination({ page, pages, onPageChange }: { page: number; pages: number; onPageChange: (p: number) => void }) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button variant="outline" size="sm" disabled={page === 1} onClick={() => onPageChange(page - 1)}>Prev</Button>
      {nums.map((n) => (
        <button
          key={n}
          onClick={() => onPageChange(n)}
          className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${n === page ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
        >
          {n}
        </button>
      ))}
      <Button variant="outline" size="sm" disabled={page === pages} onClick={() => onPageChange(page + 1)}>Next</Button>
    </div>
  );
}

// ── FormField ─────────────────────────────────────────────
export function FormField({ label, error, children, required, className }: { label: string; error?: string; children: ReactNode; required?: boolean; className?: string }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <label className="text-sm font-medium text-slate-700">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── OTP Input ─────────────────────────────────────────────
export function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);
  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "");
            const arr = value.split("").concat(Array(6).fill("")).slice(0, 6);
            arr[i] = v;
            onChange(arr.join("").replace(/\s/g, "").slice(0, 6));
            if (v && i < 5) {
              const next = document.getElementById(`otp-${i + 1}`);
              (next as HTMLInputElement)?.focus();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !d && i > 0) {
              const prev = document.getElementById(`otp-${i - 1}`);
              (prev as HTMLInputElement)?.focus();
            }
          }}
          id={`otp-${i}`}
          className="h-12 w-12 rounded-xl border border-slate-200 text-center text-lg font-bold text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
      ))}
    </div>
  );
}

// ── Toast ────────────────────────────────────────────────
interface ToastItem { id: number; message: string; image?: string; }

export function useToast() {
  const show = useCallback((message: string, image?: string) => {
    window.dispatchEvent(new CustomEvent("shoppie:toast", { detail: { message, image } }));
  }, []);
  return { show };
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [exiting, setExiting] = useState<Set<number>>(new Set());

  const dismiss = useCallback((id: number) => {
    setExiting((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      setExiting((prev) => { const s = new Set(prev); s.delete(id); return s; });
    }, 350);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const { message, image } = (e as CustomEvent).detail;
      const id = Date.now();
      setToasts((prev) => [...prev.slice(-2), { id, message, image }]);
      setTimeout(() => dismiss(id), 3000);
    };
    window.addEventListener("shoppie:toast", handler);
    return () => window.removeEventListener("shoppie:toast", handler);
  }, [dismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-100 flex flex-col gap-2 items-end">
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            animation: exiting.has(t.id)
              ? "toastOut 0.35s cubic-bezier(0.4,0,1,1) both"
              : "toastIn 0.4s cubic-bezier(0.16,1,0.3,1) both",
            background: "linear-gradient(135deg, #1a1040 0%, #0d1b3e 100%)",
            border: "1px solid rgba(121,40,202,0.4)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(121,40,202,0.15)",
          }}
          className="flex items-center gap-3 text-sm font-medium px-4 py-3 rounded-2xl min-w-56 max-w-72"
        >
          {t.image ? (
            <img src={t.image} alt="" className="h-9 w-9 rounded-lg object-cover shrink-0" style={{ border: "1px solid rgba(121,40,202,0.3)" }} />
          ) : (
            <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#7928ca" }}>
              <ShoppingCart className="h-4 w-4" style={{ color: "#ffffff" }} />
            </div>
          )}
          <span className="flex-1 leading-snug" style={{ color: "#ffffff" }}>{t.message}</span>
          <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "#10b981" }} />
          <button
            onClick={() => dismiss(t.id)}
            className="ml-1 transition-opacity hover:opacity-70"
            style={{ color: "#94a3b8" }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ── ProductCard ───────────────────────────────────────────
import type { Product } from "../../lib/types";

export function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart?: (id: string) => void }) {
  const img = product.images[0]?.url;
  const [qty, setQty] = useState(0);
  const { show: showToast } = useToast();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    setQty(1);
    onAddToCart?.(product._id);
    showToast(`${product.name} added to cart`, img);
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    const next = Math.min(product.stock, qty + 1);
    setQty(next);
    onAddToCart?.(product._id);
    showToast(`${product.name} quantity updated`, img);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    const next = qty - 1;
    if (next <= 0) { setQty(0); return; }
    setQty(next);
  };

  return (
    <a href={`/products/${product._id}`} className="group block rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Image */}
      <div className="relative aspect-4/3 bg-slate-50 overflow-hidden">
        {img ? (
          <img src={img} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-100">
            <Package className="h-12 w-12 text-slate-300" />
          </div>
        )}

        {/* Discount badge */}
        {product.discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide shadow">
            {product.discount}% OFF
          </span>
        )}

        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-white/90 text-slate-800 text-xs font-bold px-3 py-1 rounded-full shadow">Out of Stock</span>
          </div>
        )}

        {/* Cart button / qty stepper — shown on hover */}
        {product.stock > 0 && (
          <div className="absolute bottom-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
            {qty === 0 ? (
              <button
                onClick={handleAdd}
                className="flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg shadow-md transition-colors"
              >
                <ShoppingCart className="h-3 w-3" /> Add to Cart
              </button>
            ) : (
              <div
                onClick={(e) => e.preventDefault()}
                className="flex items-center justify-between bg-indigo-700 rounded-lg shadow-md overflow-hidden"
              >
                <button
                  onClick={handleDecrease}
                  className="flex items-center justify-center w-7 h-7 text-white hover:bg-indigo-800 transition-colors"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="text-white text-[11px] font-bold min-w-5 text-center">{qty}</span>
                <button
                  onClick={handleIncrease}
                  disabled={qty >= product.stock}
                  className="flex items-center justify-center w-7 h-7 text-white hover:bg-indigo-800 disabled:opacity-40 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2">
        {product.brand && (
          <p className="text-[9px] font-semibold uppercase tracking-widest text-indigo-400 mb-0.5">{product.brand}</p>
        )}
        <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug">{product.name}</p>

        <div className="mt-1 flex items-center gap-1.5">
          <span className="text-sm font-extrabold text-slate-900">₹{product.price.toLocaleString()}</span>
          {product.mrp > product.price && (
            <span className="text-[10px] text-slate-400 line-through">₹{product.mrp.toLocaleString()}</span>
          )}
        </div>

        {product.ratings.count > 0 && (
          <div className="mt-1">
            <StarRating rating={product.ratings.average} count={product.ratings.count} />
          </div>
        )}
      </div>
    </a>
  );
}
