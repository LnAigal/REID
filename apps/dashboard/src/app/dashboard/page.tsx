"use client";

import { useEffect, useState } from "react";
import { Mail, Globe, Key, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const stats = [
  { name: "Emails Sent", value: "1,234", change: "+12%", up: true, icon: Mail },
  { name: "Success Rate", value: "98.5%", change: "+2.1%", up: true, icon: TrendingUp },
  { name: "Domains", value: "3", change: "+1", up: true, icon: Globe },
  { name: "API Keys", value: "5", change: "0", up: true, icon: Key },
];

const chartData = [
  { date: "Mon", sent: 120, delivered: 118, failed: 2 },
  { date: "Tue", sent: 98, delivered: 95, failed: 3 },
  { date: "Wed", sent: 145, delivered: 142, failed: 3 },
  { date: "Thu", sent: 167, delivered: 164, failed: 3 },
  { date: "Fri", sent: 189, delivered: 185, failed: 4 },
  { date: "Sat", sent: 78, delivered: 76, failed: 2 },
  { date: "Sun", sent: 56, delivered: 55, failed: 1 },
];

const recentEmails = [
  { id: "1", to: "user@example.com", subject: "Welcome to REID", status: "delivered", time: "2 min ago" },
  { id: "2", to: "team@company.io", subject: "Weekly Report", status: "sent", time: "15 min ago" },
  { id: "3", to: "admin@test.com", subject: "Password Reset", status: "delivered", time: "1 hour ago" },
  { id: "4", to: "dev@startup.co", subject: "API Key Generated", status: "sent", time: "3 hours ago" },
];

export default function DashboardOverview() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-zinc-400 text-sm mt-1">Welcome back. Here&apos;s your email infrastructure at a glance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
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
              <span className={`text-xs flex items-center gap-0.5 mb-1 ${stat.up ? "text-green-400" : "text-red-400"}`}>
                {stat.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {stat.change}
              </span>
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
                  email.status === "delivered" ? "bg-green-500" : "bg-blue-500"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{email.subject}</p>
                  <p className="text-xs text-zinc-500 truncate">{email.to}</p>
                </div>
                <span className="text-xs text-zinc-500 whitespace-nowrap">{email.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
