"use client";

import { useEffect, useState } from "react";
import { User, Shield, Trash2 } from "lucide-react";
import { api } from "../../../lib/api";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState<{ name: string; email: string } | null>(null);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getProfile().then((r) => {
      setProfile(r.data);
      setName(r.data.name);
    }).catch(() => {});
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.updateProfile({ name });
      setProfile((prev) => prev ? { ...prev, name } : prev);
    } catch (e: any) {
      alert(e.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    setSaving(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      alert("Password updated successfully");
    } catch (e: any) {
      alert(e.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-zinc-400 text-sm mt-1">Manage your account settings</p>
      </div>

      <div className="flex gap-1 rounded-lg border border-white/10 bg-white/5 p-1 w-fit">
        {[
          { id: "profile", label: "Profile", icon: User },
          { id: "security", label: "Security", icon: Shield },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white/10 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "profile" && (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-medium mb-4">Profile Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xl font-bold">
                  {profile?.name?.[0]?.toUpperCase() || "U"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
                <input
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white/50 cursor-not-allowed"
                />
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200 transition-all disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "security" && (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-medium mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>
              <button
                onClick={handleChangePassword}
                disabled={saving}
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200 transition-all disabled:opacity-50"
              >
                {saving ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
