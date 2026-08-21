import { Link } from "react-router";
import { Store, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="Shoppie Logo" className="h-9 w-9 rounded-xl object-cover border border-slate-100" />
              <span className="text-lg font-bold text-white">Shoppie</span>
            </div>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
              Your one-stop destination for quality products at the best prices. Shop with confidence.
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Mail className="h-4 w-4" /> support@shoppie.com
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Phone className="h-4 w-4" /> +91 98765 43210
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Quick Links</h3>
            <ul className="space-y-2">
              {[{ href: "/", label: "Home" }, { href: "/products", label: "Products" }, { href: "/cart", label: "Cart" }, { href: "/orders", label: "My Orders" }].map(({ href, label }) => (
                <li key={href}>
                  <Link to={href} className="text-sm text-slate-400 hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Account</h3>
            <ul className="space-y-2">
              {[{ href: "/login", label: "Sign In" }, { href: "/signup", label: "Sign Up" }, { href: "/profile", label: "My Profile" }].map(({ href, label }) => (
                <li key={href}>
                  <Link to={href} className="text-sm text-slate-400 hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Shoppie. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
