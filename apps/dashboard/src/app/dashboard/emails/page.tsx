"use client";

import { useState } from "react";
import { Mail, Search, Filter, ChevronDown, ExternalLink } from "lucide-react";

const emails = [
  { id: "1", from: "hello@reid.dev", to: ["user@example.com"], subject: "Welcome to REID!", status: "delivered", provider: "brevo", time: "2 min ago", latency: "142ms" },
  { id: "2", from: "hello@reid.dev", to: ["team@company.io"], subject: "Weekly Report", status: "sent", provider: "brevo", time: "15 min ago", latency: "98ms" },
  { id: "3", from: "noreply@reid.dev", to: ["admin@test.com"], subject: "Password Reset Request", status: "delivered", provider: "brevo", time: "1 hour ago", latency: "201ms" },
  { id: "4", from: "hello@reid.dev", to: ["dev@startup.co"], subject: "API Key Generated", status: "sent", provider: "brevo", time: "3 hours ago", latency: "87ms" },
  { id: "5", from: "hello@reid.dev", to: ["user@test.com"], subject: "Email Verification", status: "failed", provider: "brevo", time: "5 hours ago", latency: "1.2s" },
  { id: "6", from: "hello@reid.dev", to: ["contact@example.com"], subject: "Monthly Newsletter", status: "bounced", provider: "brevo", time: "1 day ago", latency: "340ms" },
];

const statusColors: Record<string, string> = {
  delivered: "bg-green-500/20 text-green-400",
  sent: "bg-blue-500/20 text-blue-400",
  failed: "bg-red-500/20 text-red-400",
  bounced: "bg-yellow-500/20 text-yellow-400",
  queued: "bg-zinc-500/20 text-zinc-400",
};

export default function EmailsPage() {
  const [search, setSearch] = useState("");

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
        <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
          <Filter className="h-4 w-4" />
          Filter
          <ChevronDown className="h-3 w-3" />
        </button>
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
                <th className="text-left text-xs font-medium text-zinc-400 uppercase tracking-wider px-4 py-3">Latency</th>
                <th className="text-left text-xs font-medium text-zinc-400 uppercase tracking-wider px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {emails.map((email) => (
                <tr key={email.id} className="hover:bg-white/5 transition-colors cursor-pointer">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-zinc-500" />
                      <span className="text-sm font-medium">{email.subject}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-400">{email.to[0]}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[email.status]}`}>
                      {email.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-400">{email.provider}</td>
                  <td className="px-4 py-3 text-sm text-zinc-400 font-mono">{email.latency}</td>
                  <td className="px-4 py-3 text-sm text-zinc-500">{email.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
