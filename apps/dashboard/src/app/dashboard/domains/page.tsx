"use client";

import { useEffect, useState } from "react";
import { Globe, Plus, CheckCircle2, XCircle, Copy, Trash2 } from "lucide-react";
import { api } from "../../../lib/api";

interface DomainRecord {
  type: string;
  name: string;
  value: string;
}

interface Domain {
  id: string;
  name: string;
  status: string;
  records: DomainRecord[];
}

export default function DomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDomains = () => {
    api.getDomains()
      .then((r) => setDomains(r.data))
      .catch(() => setDomains([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDomains(); }, []);

  const handleAddDomain = async () => {
    if (!newDomain.trim()) return;
    try {
      await api.createDomain(newDomain.trim());
      setNewDomain("");
      setShowAddModal(false);
      fetchDomains();
    } catch {
      alert("Failed to add domain");
    }
  };

  const handleVerify = async (id: string) => {
    try {
      await api.verifyDomain(id);
      fetchDomains();
    } catch {
      alert("Verification failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this domain?")) return;
    try {
      await api.deleteDomain(id);
      fetchDomains();
    } catch {
      alert("Failed to delete domain");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Domains</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage verified sending domains</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Domain
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-zinc-500">Loading...</p>
        ) : domains.length === 0 ? (
          <p className="text-sm text-zinc-500">No domains configured</p>
        ) : (
          domains.map((domain) => (
            <div key={domain.id} className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setExpandedDomain(expandedDomain === domain.id ? null : domain.id)}
              >
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-zinc-400" />
                  <span className="font-medium">{domain.name}</span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    domain.status === "VERIFIED"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {domain.status === "VERIFIED" ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    {domain.status.toLowerCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {domain.status !== "VERIFIED" && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleVerify(domain.id); }}
                      className="rounded-lg bg-violet-500/20 px-3 py-1 text-xs font-medium text-violet-400 hover:bg-violet-500/30 transition-colors"
                    >
                      Verify
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(domain.id); }}
                    className="rounded-lg bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {expandedDomain === domain.id && (
                <div className="border-t border-white/10 p-4 space-y-3">
                  <h4 className="text-sm font-medium text-zinc-400">DNS Records</h4>
                  {domain.records?.map((record, i) => (
                    <div key={i} className="flex items-center gap-4 rounded-lg bg-black/50 p-3">
                      <span className="text-xs font-mono text-violet-400 w-12">{record.type}</span>
                      <span className="text-sm font-mono text-zinc-300 flex-1">{record.name}</span>
                      <span className="text-sm font-mono text-zinc-500 truncate max-w-xs">{record.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-zinc-900 p-6">
            <h2 className="text-lg font-bold mb-4">Add Domain</h2>
            <input
              type="text"
              placeholder="yourdomain.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setShowAddModal(false); setNewDomain(""); }}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDomain}
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200 transition-all"
              >
                Add Domain
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
