import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Store, Mail, ArrowRight } from "lucide-react";
import { initiateLogin } from "../../lib/api";
import { Button, FormField, Input } from "../../components/ui";

export function meta() {
  return [{ title: "Sign In – Shoppie" }];
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await initiateLogin({ email });
      navigate(`/verify?email=${encodeURIComponent(email)}&type=login`);
    } catch (err: unknown) {
      console.error("[Login Error]", err);
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
            <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
            <p className="mt-1 text-sm text-indigo-200">Sign in to your Shoppie account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <FormField label="Email Address" required>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10"
                  required
                  autoFocus
                />
              </div>
            </FormField>

            <Button type="submit" loading={loading} fullWidth size="lg">
              Send OTP <ArrowRight className="h-4 w-4" />
            </Button>

            <p className="text-center text-sm text-slate-500">
              Don't have an account?{" "}
              <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-700">Sign Up</Link>
            </p>
          </form>
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">© {new Date().getFullYear()} Shoppie. All rights reserved.</p>
      </div>
    </div>
  );
}
