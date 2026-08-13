import { useState } from "react";
import { Link } from "react-router";
import { User, Mail, Phone, Edit2, Check, X, LogOut, Package } from "lucide-react";
import { updateMyProfile } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { Button, FormField, Input } from "../../components/ui";

export function meta() {
  return [{ title: "My Profile – Shoppie" }];
}

export default function ProfilePage() {
  const { user, setAuth, token, logout, isAuthenticated } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: user?.fullName ?? "", phoneNumber: user?.phoneNumber ?? "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-600 mb-4">Please sign in to view your profile.</p>
        <Link to="/login" className="text-indigo-600 hover:underline">Sign In</Link>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await updateMyProfile(form);
      const updatedUser = res.data.data.user;
      setAuth(token!, updatedUser);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Profile</h1>

      {success && (
        <div className="mb-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700">
          <Check className="h-4 w-4" /> Profile updated successfully!
        </div>
      )}

      {/* Avatar + name */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-4">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-2xl font-bold text-indigo-700">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user.fullName}</h2>
            <p className="text-sm text-slate-500">{user.email}</p>
            <span className={`inline-flex items-center mt-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${user.isEmailVerified ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" : "bg-amber-50 text-amber-700 ring-amber-600/20"}`}>
              {user.isEmailVerified ? "✓ Verified" : "Unverified"}
            </span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-4">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-slate-800">Personal Information</h3>
          {!editing && (
            <Button variant="outline" size="sm" onClick={() => { setEditing(true); setForm({ fullName: user.fullName, phoneNumber: user.phoneNumber ?? "" }); }}>
              <Edit2 className="h-4 w-4" /> Edit
            </Button>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
            <FormField label="Full Name" required>
              <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </FormField>
            <FormField label="Phone Number">
              <Input value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} placeholder="9876543210" maxLength={10} />
            </FormField>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setEditing(false); setError(""); }} className="flex-1">
                <X className="h-4 w-4" /> Cancel
              </Button>
              <Button onClick={handleSave} loading={saving} className="flex-1">
                <Check className="h-4 w-4" /> Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {[
              { icon: <User className="h-4 w-4 text-slate-400" />, label: "Full Name", value: user.fullName },
              { icon: <Mail className="h-4 w-4 text-slate-400" />, label: "Email", value: user.email },
              { icon: <Phone className="h-4 w-4 text-slate-400" />, label: "Phone", value: user.phoneNumber || "Not set" },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                {icon}
                <div>
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="text-sm font-medium text-slate-800">{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-4">
        <Link to="/orders" className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-slate-50 transition-colors">
          <Package className="h-5 w-5 text-indigo-600" />
          <span className="text-sm font-medium text-slate-700">My Orders</span>
        </Link>
      </div>

      <Button variant="danger" onClick={logout} fullWidth>
        <LogOut className="h-4 w-4" /> Sign Out
      </Button>
    </div>
  );
}
