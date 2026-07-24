"use client";

import { useEffect, useState } from "react";
import { Mail, Search, Filter, ChevronDown } from "lucide-react";
import { api } from "../../../lib/api";

const statusColors: Record<string, string> = {
  DELIVERED: "bg-green-500/20 text-green-400",
  SENT: "bg-blue-500/20 text-blue-400",
  FAILED: "bg-red-500/20 text-red-400",
  BOUNCED: "bg-yellow-500/20 text-yellow-400",
  QUEUED: "bg-zinc-500/20 text-zinc-400",
  PROCESSING: "bg-zinc-500/20 text-zinc-400",
};

interface Email {
  id: string;
  from: string;
  to: string[];
  subject: string;
  status: string;
  provider: string;
  latency: number | null;
  createdAt: string;
}

export default function EmailsPage() {
  const [search, setSearch] = useState("");
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getEmails(1, 50, search || undefined)
      .then((r) => setEmails(r.data))
      .catch(() => setEmails([]))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Emails</h1>
          <p className="text-zinc-400 text-sm mt-1">Track all emails sent through your API</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search emails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs font-medium text-zinc-400 uppercase tracking-wider px-4 py-3">Subject</th>
                <th className="text-left text-xs font-medium text-zinc-400 uppercase tracking-wider px-4 py-3">To</th>
                <th className="text-left text-xs font-medium text-zinc-400 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-zinc-400 uppercase tracking-wider px-4 py-3">Provider</th>
                <th className="text-left text-xs font-medium text-zinc-400 uppercase tracking-wider px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-zinc-500">Loading...</td>
                </tr>
              ) : emails.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-zinc-500">No emails found</td>
                </tr>
              ) : (
                emails.map((email) => (
                  <tr key={email.id} className="hover:bg-white/5 transition-colors cursor-pointer">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-zinc-500" />
                        <span className="text-sm font-medium">{email.subject}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">{email.to?.[0]}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[email.status] || "bg-zinc-500/20 text-zinc-400"}`}>
                        {email.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">{email.provider}</td>
                    <td className="px-4 py-3 text-sm text-zinc-500">{new Date(email.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
