"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const weeklyData = [
  { date: "Mon", sent: 120, delivered: 118, failed: 2 },
  { date: "Tue", sent: 98, delivered: 95, failed: 3 },
  { date: "Wed", sent: 145, delivered: 142, failed: 3 },
  { date: "Thu", sent: 167, delivered: 164, failed: 3 },
  { date: "Fri", sent: 189, delivered: 185, failed: 4 },
  { date: "Sat", sent: 78, delivered: 76, failed: 2 },
  { date: "Sun", sent: 56, delivered: 55, failed: 1 },
];

const pieData = [
  { name: "Delivered", value: 835, color: "#22c55e" },
  { name: "Sent", value: 354, color: "#3b82f6" },
  { name: "Failed", value: 19, color: "#ef4444" },
  { name: "Bounced", value: 26, color: "#eab308" },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-zinc-400 text-sm mt-1">Monitor your email delivery performance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Sent", value: "1,234", color: "text-blue-400" },
          { label: "Delivered", value: "1,198", color: "text-green-400" },
          { label: "Failed", value: "19", color: "text-red-400" },
          { label: "Bounced", value: "26", color: "text-yellow-400" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-zinc-400 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-sm font-medium text-zinc-400 mb-4">Email Volume (Last 7 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
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
          <h3 className="text-sm font-medium text-zinc-400 mb-4">Status Breakdown</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-zinc-400">{item.name}</span>
                </div>
                <span className="font-medium">{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-medium text-zinc-400 mb-4">Success Rate Trend</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} domain={[90, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [`${value}%`, "Success Rate"]}
              />
              <Line
                type="monotone"
                dataKey={(data) => Math.round((data.delivered / data.sent) * 100)}
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: "#22c55e", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
