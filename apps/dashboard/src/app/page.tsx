import Link from "next/link";
import { ArrowRight, Mail, Shield, Zap, Code2, BarChart3, Globe } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Mail className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">REID</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="/docs" className="hover:text-white transition-colors">Docs</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-black to-black" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-zinc-400 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
            Now in early access
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
              Reliable Email
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Infrastructure
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-zinc-400 mb-10">
            Send transactional emails through one simple API. No SMTP complexity.
            Built for developers who ship fast.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-zinc-200 transition-all flex items-center gap-2"
            >
              Start Sending
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/docs"
              className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-all"
            >
              Read the Docs
            </Link>
          </div>

          <div className="mt-16 mx-auto max-w-3xl rounded-xl border border-white/10 bg-white/5 p-1 text-left">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
              </div>
              <span className="ml-2 text-xs text-zinc-500 font-mono">send-email.js</span>
            </div>
            <pre className="p-4 text-sm font-mono text-zinc-300 overflow-x-auto">
              <code>{`import REID from '@reid/sdk';

const reid = new REID('reid_live_xxxxx');

await reid.emails.send({
  from: 'hello@yourdomain.com',
  to: ['user@example.com'],
  subject: 'Welcome to REID!',
  html: '<h1>Hello World</h1>',
});`}</code>
            </pre>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for developers</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Everything you need to send emails at scale, without the complexity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Send emails in milliseconds. Optimized for speed with global delivery.",
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                description: "DKIM, SPF, DMARC authentication built-in. Your emails always land in inbox.",
              },
              {
                icon: Code2,
                title: "Developer First",
                description: "Simple SDK, clear docs, and beautiful API responses. Ship in minutes.",
              },
              {
                icon: BarChart3,
                title: "Real-time Analytics",
                description: "Track delivery, opens, bounces, and more with built-in analytics.",
              },
              {
                icon: Globe,
                title: "Domain Management",
                description: "Easy domain verification with automatic DNS record generation.",
              },
              {
                icon: Mail,
                title: "Template Engine",
                description: "Create reusable email templates with dynamic variables.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all"
              >
                <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-colors">
                  <feature.icon className="h-5 w-5 text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Simple. Powerful. Reliable.
              </h2>
              <p className="text-zinc-400 mb-8">
                REID handles the complexity of email delivery so you can focus on building.
                One API call is all it takes.
              </p>
              <div className="space-y-4">
                {[
                  "No SMTP configuration needed",
                  "Automatic DKIM/SPF/DMARC setup",
                  "Real-time delivery tracking",
                  "Built-in analytics dashboard",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <svg className="h-3 w-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-zinc-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-sm text-zinc-400 font-mono">API Response</span>
              </div>
              <pre className="text-sm font-mono text-zinc-300">
{`{
  "success": true,
  "data": {
    "id": "reid_abc123",
    "from": "hello@reid.dev",
    "to": ["user@example.com"],
    "subject": "Welcome!",
    "status": "sent",
    "provider": "brevo",
    "createdAt": "2025-01-15T10:30:00Z"
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-zinc-400 mb-12">Start free. Scale as you grow.</p>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-zinc-400">
            Pricing coming soon. Join the waitlist.
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Mail className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold">REID</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-zinc-500">
              <a href="/docs" className="hover:text-white transition-colors">Docs</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
            </div>
            <p className="text-sm text-zinc-500">© 2025 REID. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
