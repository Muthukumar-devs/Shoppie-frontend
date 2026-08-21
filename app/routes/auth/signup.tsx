import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Store, User, Phone, Mail, ArrowRight } from "lucide-react";
import { initiateSignup } from "../../lib/api";
import { Button, FormField, Input } from "../../components/ui";

export function meta() {
  return [{ title: "Sign Up – Shoppie" }];
}

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", phoneNumber: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await initiateSignup(form);
      navigate(`/verify?email=${encodeURIComponent(form.email)}&type=signup`);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-indigo-600 to-indigo-700 px-8 py-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl overflow-hidden bg-white/20 backdrop-blur-sm">
              <img src="/logo.png" alt="Shoppie Logo" className="h-full w-full object-cover" />
            </div>
            <h1 className="text-2xl font-bold text-white">Create Account</h1>
            <p className="mt-1 text-sm text-indigo-200">Join Shoppie and start shopping</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <FormField label="Full Name" required>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="John Doe"
                  className="pl-10"
                  required
                  autoFocus
                />
              </div>
            </FormField>

            <FormField label="Phone Number" required>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  placeholder="9876543210"
                  className="pl-10"
                  maxLength={10}
                  required
                />
              </div>
            </FormField>

            <FormField label="Email Address" required>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="pl-10"
                  required
                />
              </div>
            </FormField>

            <Button type="submit" loading={loading} fullWidth size="lg" className="mt-2">
              Send OTP <ArrowRight className="h-4 w-4" />
            </Button>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-700">Sign In</Link>
            </p>
          </form>
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">© {new Date().getFullYear()} Shoppie. All rights reserved.</p>
      </div>
    </div>
  );
}
