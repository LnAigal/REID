"use client";

import { useState } from "react";
import { Key, Plus, Copy, Trash2, RefreshCw, Eye, EyeOff } from "lucide-react";

const apiKeys = [
  { id: "1", name: "Production", prefix: "reid_live_a1b2...", type: "LIVE", lastUsed: "2 min ago", createdAt: "Jan 1, 2025" },
  { id: "2", name: "Development", prefix: "reid_test_x7y8...", type: "TEST", lastUsed: "1 hour ago", createdAt: "Jan 5, 2025" },
  { id: "3", name: "Staging", prefix: "reid_test_m3n4...", type: "TEST", lastUsed: "3 days ago", createdAt: "Jan 10, 2025" },
];

export default function ApiKeysPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKey, setNewKey] = useState({ name: "", type: "LIVE" as "LIVE" | "TEST" });
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Keys</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage your API keys for authentication</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200 transition-all"
        >
          <Plus className="h-4 w-4" />
          Create Key
        </button>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs font-medium text-zinc-400 uppercase tracking-wider px-4 py-3">Name</th>
                <th className="text-left text-xs font-medium text-zinc-400 uppercase tracking-wider px-4 py-3">Key</th>
                <th className="text-left text-xs font-medium text-zinc-400 uppercase tracking-wider px-4 py-3">Type</th>
                <th className="text-left text-xs font-medium text-zinc-400 uppercase tracking-wider px-4 py-3">Last Used</th>
                <th className="text-left text-xs font-medium text-zinc-400 uppercase tracking-wider px-4 py-3">Created</th>
                <th className="text-right text-xs font-medium text-zinc-400 uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {apiKeys.map((apiKey) => (
                <tr key={apiKey.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-zinc-500" />
                      <span className="text-sm font-medium">{apiKey.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-sm font-mono text-zinc-400">{apiKey.prefix}</code>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      apiKey.type === "LIVE"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {apiKey.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-400">{apiKey.lastUsed}</td>
                  <td className="px-4 py-3 text-sm text-zinc-500">{apiKey.createdAt}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => copyToClipboard(apiKey.prefix, apiKey.id)}
                        className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                        title="Copy"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                        title="Regenerate"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                      <button
                        className="rounded-lg p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-zinc-900 p-6">
            <h2 className="text-lg font-bold mb-4">Create API Key</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Name</label>
                <input
                  type="text"
                  placeholder="e.g., Production"
                  value={newKey.name}
                  onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Type</label>
                <div className="flex gap-3">
                  {(["LIVE", "TEST"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewKey({ ...newKey, type })}
                      className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                        newKey.type === type
                          ? "border-violet-500 bg-violet-500/10 text-violet-400"
                          : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewKey({ name: "", type: "LIVE" });
                }}
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200 transition-all"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
