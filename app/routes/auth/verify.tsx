import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Store, ShieldCheck, RefreshCw } from "lucide-react";
import { verifySignup, verifyLogin, resendOtp } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { Button, OtpInput } from "../../components/ui";

export function meta() {
  return [{ title: "Verify OTP – Shoppie" }];
}

export default function VerifyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuth();

  const email = searchParams.get("email") ?? "";
  const type = (searchParams.get("type") ?? "login") as "signup" | "login";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(30);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Invalid verification link.</p>
          <Link to="/login" className="text-indigo-600 hover:underline">Go to Login</Link>
        </div>
      </div>
    );
  }

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) { setError("Please enter the complete 6-digit OTP."); return; }
    setError("");
    setLoading(true);
    try {
      const fn = type === "signup" ? verifySignup : verifyLogin;
      const res = await fn({ email, otp });
      const { token, data } = res.data;
      setAuth(token, data.user);
      navigate("/");
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    try {
      await resendOtp({ email, type });
      setCooldown(30);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-indigo-600 to-indigo-700 px-8 py-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <ShieldCheck className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Verify OTP</h1>
            <p className="mt-1 text-sm text-indigo-200">
              We sent a 6-digit code to
            </p>
            <p className="text-sm font-semibold text-white mt-0.5">{email}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleVerify} className="px-8 py-8 space-y-6">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 text-center">{error}</div>
            )}

            <div className="space-y-2">
              <p className="text-center text-sm text-slate-500">Enter the OTP below</p>
              <OtpInput value={otp} onChange={setOtp} />
              <p className="text-center text-xs text-slate-400">OTP is valid for 10 minutes</p>
            </div>

            <Button type="submit" loading={loading} fullWidth size="lg" disabled={otp.length < 6}>
              <Store className="h-4 w-4" /> Verify & {type === "signup" ? "Create Account" : "Sign In"}
            </Button>

            <div className="text-center">
              <p className="text-sm text-slate-500 mb-2">Didn't receive the code?</p>
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || cooldown > 0}
                className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${resending ? "animate-spin" : ""}`} />
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
              </button>
            </div>

            <p className="text-center text-sm text-slate-500">
              <Link to={type === "signup" ? "/signup" : "/login"} className="font-medium text-indigo-600 hover:text-indigo-700">
                ← Change email
              </Link>
            </p>
          </form>
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">© {new Date().getFullYear()} Shoppie. All rights reserved.</p>
      </div>
    </div>
  );
}
