"use client";

import { useState } from "react";
import { FileText, Plus, Edit, Trash2, Copy } from "lucide-react";

const templates = [
  { id: "1", name: "Welcome Email", subject: "Welcome to {{app_name}}!", variables: ["app_name", "user_name"], createdAt: "Jan 1, 2025" },
  { id: "2", name: "Password Reset", subject: "Reset your password", variables: ["reset_link", "expires_in"], createdAt: "Jan 5, 2025" },
  { id: "3", name: "Invoice", subject: "Your invoice for {{month}}", variables: ["month", "amount", "invoice_url"], createdAt: "Jan 10, 2025" },
];

export default function TemplatesPage() {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Templates</h1>
          <p className="text-zinc-400 text-sm mt-1">Create reusable email templates</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200 transition-all"
        >
          <Plus className="h-4 w-4" />
          Create Template
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-violet-400" />
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                  <Edit className="h-3.5 w-3.5" />
                </button>
                <button className="rounded-lg p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <h3 className="font-medium mb-1">{template.name}</h3>
            <p className="text-sm text-zinc-500 mb-3">{template.subject}</p>
            <div className="flex flex-wrap gap-1.5">
              {template.variables.map((v) => (
                <span
                  key={v}
                  className="inline-flex items-center rounded-md bg-violet-500/10 px-2 py-0.5 text-xs font-medium text-violet-400"
                >
                  {`{{${v}}}`}
                </span>
              ))}
            </div>
            <p className="text-xs text-zinc-600 mt-3">Created {template.createdAt}</p>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-white/10 bg-zinc-900 p-6">
            <h2 className="text-lg font-bold mb-4">Create Template</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Name</label>
                <input
                  type="text"
                  placeholder="e.g., Welcome Email"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Subject</label>
                <input
                  type="text"
                  placeholder="Use {{variable}} for dynamic content"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">HTML Content</label>
                <textarea
                  rows={6}
                  placeholder="HTML email template"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 font-mono text-sm"
                />
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
                onClick={() => setShowAddModal(false)}
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
