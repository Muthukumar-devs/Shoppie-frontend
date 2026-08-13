import { type ReactNode, useEffect } from "react";
import { X, AlertTriangle, Star } from "lucide-react";

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
      <div className="mb-4 text-5xl">{icon ?? "📭"}</div>
      <h3 className="text-lg font-semibold text-slate-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 mb-6 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}

// ── StarRating ────────────────────────────────────────────
export function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} className={`h-4 w-4 ${s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
        ))}
      </div>
      <span className="text-xs text-slate-500">({count})</span>
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

// ── ProductCard ───────────────────────────────────────────
import { ShoppingCart } from "lucide-react";
import type { Product } from "../../lib/types";

export function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart?: (id: string) => void }) {
  const img = product.images[0]?.url;
  return (
    <a href={`/products/${product._id}`} className="group block rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
      <div className="relative aspect-square bg-slate-50 overflow-hidden">
        {img ? (
          <img src={img} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">📦</div>
        )}
        {product.discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{product.discount}% OFF</span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-slate-800 text-xs font-bold px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
        <button
          onClick={(e) => { e.preventDefault(); onAddToCart?.(product._id); }}
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600 text-white p-2 rounded-xl shadow-lg hover:bg-indigo-700"
        >
          <ShoppingCart className="h-4 w-4" />
        </button>
      </div>
      <div className="p-3">
        {product.brand && <p className="text-xs text-slate-400 mb-0.5">{product.brand}</p>}
        <p className="text-sm font-medium text-slate-800 line-clamp-2 leading-snug">{product.name}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-base font-bold text-slate-900">₹{product.price.toLocaleString()}</span>
          {product.mrp > product.price && (
            <span className="text-xs text-slate-400 line-through">₹{product.mrp.toLocaleString()}</span>
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
