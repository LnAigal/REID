import Link from "next/link";
import { Mail, ArrowRight, Code2, Key, Globe, Send } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-black">
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Mail className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold">REID</span>
            <span className="text-sm text-zinc-500 ml-2">Docs</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Dashboard →
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-4xl font-bold mb-4">REID Documentation</h1>
        <p className="text-zinc-400 text-lg mb-12">
          Everything you need to integrate REID into your application.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {[
            {
              icon: Code2,
              title: "Quick Start",
              description: "Get up and running in 5 minutes",
              href: "#quick-start",
            },
            {
              icon: Key,
              title: "Authentication",
              description: "Learn about API key authentication",
              href: "#authentication",
            },
            {
              icon: Send,
              title: "Send Emails",
              description: "Send your first email via the API",
              href: "#send-email",
            },
            {
              icon: Globe,
              title: "Domain Setup",
              description: "Verify and configure your domains",
              href: "#domains",
            },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all"
            >
              <item.icon className="h-6 w-6 text-violet-400 mb-3" />
              <h3 className="font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-zinc-400">{item.description}</p>
            </Link>
          ))}
        </div>

        <section id="quick-start" className="mb-16">
          <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
          <p className="text-zinc-400 mb-6">
            Install the REID SDK and start sending emails in minutes.
          </p>

          <div className="rounded-xl border border-white/10 bg-white/5 p-1 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10">
              <span className="text-xs text-zinc-500 font-mono">npm</span>
            </div>
            <pre className="p-4 text-sm font-mono text-zinc-300">
              npm install @reid/sdk
            </pre>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-1">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10">
              <span className="text-xs text-zinc-500 font-mono">JavaScript</span>
            </div>
            <pre className="p-4 text-sm font-mono text-zinc-300 overflow-x-auto">
{`import REID from '@reid/sdk';

const reid = new REID('reid_live_your_api_key');

// Send an email
const email = await reid.emails.send({
  from: 'hello@yourdomain.com',
  to: ['user@example.com'],
  subject: 'Welcome to REID!',
  html: '<h1>Hello World</h1><p>Welcome to REID.</p>',
});

console.log(email.id); // "reid_abc123"`}
            </pre>
          </div>
        </section>

        <section id="authentication" className="mb-16">
          <h2 className="text-2xl font-bold mb-4">Authentication</h2>
          <p className="text-zinc-400 mb-6">
            All API requests require authentication via an API key passed in the Authorization header.
          </p>

          <div className="rounded-xl border border-white/10 bg-white/5 p-1">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10">
              <span className="text-xs text-zinc-500 font-mono">cURL</span>
            </div>
            <pre className="p-4 text-sm font-mono text-zinc-300">
{`curl -X POST https://api.reid.dev/v1/emails \\
  -H "Authorization: Bearer reid_live_xxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "hello@yourdomain.com",
    "to": ["user@example.com"],
    "subject": "Hello from REID",
    "html": "<p>Hello World!</p>"
  }'`}
            </pre>
          </div>
        </section>

        <section id="send-email" className="mb-16">
          <h2 className="text-2xl font-bold mb-4">Send Email</h2>
          <p className="text-zinc-400 mb-6">
            The <code className="text-violet-400">POST /v1/emails</code> endpoint sends an email.
          </p>

          <h3 className="text-lg font-semibold mb-3">Request Body</h3>
          <div className="rounded-xl border border-white/10 overflow-hidden mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-4 py-2 font-medium text-zinc-400">Field</th>
                  <th className="text-left px-4 py-2 font-medium text-zinc-400">Type</th>
                  <th className="text-left px-4 py-2 font-medium text-zinc-400">Required</th>
                  <th className="text-left px-4 py-2 font-medium text-zinc-400">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { field: "from", type: "string", required: "Yes", desc: "Sender email address" },
                  { field: "to", type: "string[]", required: "Yes", desc: "Recipient email addresses" },
                  { field: "cc", type: "string[]", required: "No", desc: "CC recipients" },
                  { field: "bcc", type: "string[]", required: "No", desc: "BCC recipients" },
                  { field: "replyTo", type: "string", required: "No", desc: "Reply-To address" },
                  { field: "subject", type: "string", required: "Yes", desc: "Email subject line" },
                  { field: "html", type: "string", required: "One of html/text", desc: "HTML content" },
                  { field: "text", type: "string", required: "One of html/text", desc: "Plain text content" },
                  { field: "headers", type: "object", required: "No", desc: "Custom headers" },
                ].map((row) => (
                  <tr key={row.field} className="hover:bg-white/5">
                    <td className="px-4 py-2 font-mono text-violet-400">{row.field}</td>
                    <td className="px-4 py-2 text-zinc-500 font-mono">{row.type}</td>
                    <td className="px-4 py-2 text-zinc-400">{row.required}</td>
                    <td className="px-4 py-2 text-zinc-400">{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="domains" className="mb-16">
          <h2 className="text-2xl font-bold mb-4">Domain Setup</h2>
          <p className="text-zinc-400 mb-6">
            Verify your domain to send emails from your own address.
          </p>

          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <h4 className="font-medium mb-2">1. Add your domain</h4>
              <code className="text-sm font-mono text-zinc-400">
                POST /v1/domains {`{ "name": "yourdomain.com" }`}
              </code>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <h4 className="font-medium mb-2">2. Add DNS records</h4>
              <p className="text-sm text-zinc-400">
                Add the SPF, DKIM, and DMARC records provided to your DNS provider.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <h4 className="font-medium mb-2">3. Verify</h4>
              <code className="text-sm font-mono text-zinc-400">
                POST /v1/domains/:id/verify
              </code>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/10 pt-8 text-center text-sm text-zinc-500">
          <p>© 2025 REID. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
