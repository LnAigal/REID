"use client";

import { useState } from "react";
import { User, Shield, Bell, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

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
                  U
                </div>
                <button className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
                  Change avatar
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Name</label>
                <input
                  type="text"
                  defaultValue="User"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
                <input
                  type="email"
                  defaultValue="user@example.com"
                  disabled
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white/50 cursor-not-allowed"
                />
              </div>
              <button className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200 transition-all">
                Save Changes
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
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">New Password</label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>
              <button className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200 transition-all">
                Update Password
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
            <h3 className="text-lg font-medium text-red-400 mb-2">Danger Zone</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Permanently delete your account and all associated data.
            </p>
            <button className="rounded-lg bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/30 transition-all flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Delete Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
