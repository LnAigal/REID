"use client";

import { useEffect, useState } from "react";
import { Mail, Globe, Key, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "../../lib/api";

interface Stats {
  total: number;
  sent: number;
  delivered: number;
  failed: number;
  bounced: number;
  successRate: number;
}

interface RecentEmail {
  id: string;
  subject: string;
  to: string[];
  status: string;
  createdAt: string;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentEmails, setRecentEmails] = useState<RecentEmail[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);

  useEffect(() => {
    api.getEmailStats().then((r) => setStats(r.data)).catch(() => {});
    api.getChartData(7).then((r) => setChartData(r.data)).catch(() => {});
    api.getEmails(1, 5).then((r) => setRecentEmails(r.data)).catch(() => {});
    api.getDomains().then((r) => setDomains(r.data)).catch(() => {});
    api.getApiKeys().then((r) => setApiKeys(r.data)).catch(() => {});
  }, []);

  const overviewStats = [
    { name: "Emails Sent", value: stats?.total?.toLocaleString() ?? "—", change: "", up: true, icon: Mail },
    { name: "Success Rate", value: stats ? `${stats.successRate.toFixed(1)}%` : "—", change: "", up: true, icon: TrendingUp },
    { name: "Domains", value: String(domains.length), change: "", up: true, icon: Globe },
    { name: "API Keys", value: String(apiKeys.length), change: "", up: true, icon: Key },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-zinc-400 text-sm mt-1">Welcome back. Here&apos;s your email infrastructure at a glance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map((stat) => (
          <div
            key={stat.name}
            className="rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-zinc-400">{stat.name}</span>
              <stat.icon className="h-4 w-4 text-zinc-500" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-sm font-medium text-zinc-400 mb-4">Email Activity (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="sent" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="delivered" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="failed" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-sm font-medium text-zinc-400 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentEmails.map((email) => (
              <div key={email.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                <div className={`h-2 w-2 rounded-full ${
                  email.status === "DELIVERED" ? "bg-green-500" : email.status === "SENT" ? "bg-blue-500" : "bg-zinc-500"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{email.subject}</p>
                  <p className="text-xs text-zinc-500 truncate">{email.to?.[0]}</p>
                </div>
              </div>
            ))}
            {recentEmails.length === 0 && (
              <p className="text-sm text-zinc-500">No recent emails</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
