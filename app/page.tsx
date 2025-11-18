"use server";

import Link from "next/link";
import { ShieldCheck, MessageSquare, Sparkles, Lock, Users, BarChart3 } from "lucide-react";

const highlights = [
  {
    title: "AI Guardrails Built-In",
    description:
      "Real-time moderation, toxicity detection, and nudges keep conversations healthy without slowing teams down.",
    icon: <ShieldCheck className="w-6 h-6 text-white" />,
  },
  {
    title: "Enterprise-Grade Privacy",
    description: "End-to-end encryption, data residency controls, and zero training on your messages by default.",
    icon: <Lock className="w-6 h-6 text-white" />,
  },
  {
    title: "Human-Ready Insights",
    description: "Conversation analytics help leaders spot trends, celebrate wins, and intervene before problems grow.",
    icon: <BarChart3 className="w-6 h-6 text-white" />,
  },
];

const testimonials = [
  {
    quote:
      "SafeChat AI lets us move fast without worrying about brand risk. The moderation is invisible to our users but powerful for our compliance team.",
    name: "Noah Williams",
    role: "VP Support, Streamline",
  },
  {
    quote:
      "We replaced three tools with one. The AI coaching keeps our coaches on-message, and the audit trail keeps legal happy.",
    name: "Priya Patel",
    role: "Director of CX, Lumen",
  },
];

const stats = [
  { value: "12k+", label: "Teams protected" },
  { value: "98%", label: "Flag accuracy" },
  { value: "2.4M", label: "Safe messages/day" },
];

const features = [
  {
    title: "Contextual AI moderation",
    description: "Understands intent, not just keywords, to reduce false positives and keep good conversations flowing.",
    icon: Sparkles,
  },
  {
    title: "Frictionless chat",
    description: "Fast, modern UI with instant search, pinned channels, and smart mentions users love to adopt.",
    icon: MessageSquare,
  },
  {
    title: "Role-based safety",
    description: "Fine-grained permissions, audit trails, and on-call alerts so admins stay in control.",
    icon: Users,
  },
];

export default async function Home() {
  return (
    <div className="min-h-screen w-screen bg-gradient-to-b from-white via-[#F8FBFF] to-[#ECF4FF] text-slate-900">
      <div className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,122,255,0.08),transparent_45%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(4,201,155,0.08),transparent_40%)]" />

        <header className="max-w-6xl mx-auto px-6 pt-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#007AFF] to-[#04C99B] flex items-center justify-center text-white shadow-lg shadow-[#007AFF]/30">
              S
            </div>
            <span>
              SafeChat<span className="text-[#0F172A]">.AI</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-semibold text-slate-700 hover:text-[#007AFF] transition">
              Log in
            </Link>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 pb-24 space-y-16">
          {/* Hero */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center pt-14">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 bg-white shadow-sm">
                Trusted by support, ops, and safety teams
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-slate-900">
                The AI-first chat platform that keeps every conversation safe.
              </h1>
              <p className="text-slate-600 text-lg leading-relaxed">
                SafeChat AI blends modern messaging with invisible guardrails. Ship faster, scale service, and keep
                compliance smiling—without slowing your teams or your community.
              </p>
              <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-4">
                {stats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="text-2xl font-bold text-slate-900">{item.value}</div>
                    <div className="text-xs text-slate-500">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute -inset-6 bg-gradient-to-br from-[#007AFF]/15 via-[#04C99B]/10 to-transparent blur-3xl animate-pulse" />
              <div className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Today</p>
                    <p className="font-semibold text-lg text-slate-900">Team Safety Pulse</p>
                  </div>
                  <span className="rounded-full bg-[#04C99B]/15 text-[#089F7F] px-3 py-1 text-xs font-semibold">
                    Live
                  </span>
                </div>
                <div className="space-y-3">
                  {["Onboarding", "Support", "Community"].map((channel, idx) => (
                    <div
                      key={channel}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-transform duration-300 hover:-translate-y-1 hover:shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#007AFF] to-[#04C99B] flex items-center justify-center text-sm font-semibold text-white">
                          {channel.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{channel}</p>
                          <p className="text-xs text-slate-500">
                            {idx === 0
                              ? "98.7% safe messages · Coaching active"
                              : idx === 1
                                ? "12 flags resolved · 0 escalations"
                                : "7.1k members · sentiment +18%"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500">Health</p>
                        <p className="font-semibold text-[#089F7F]">Excellent</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-[#E8F2FF] via-white to-[#E6FBF5] p-4">
                  <p className="text-xs text-slate-500 mb-1">AI coach</p>
                  <p className="text-sm text-slate-800">
                    “Tone detected: frustrated. Suggested reply drafted to de-escalate and offer next steps.”
                  </p>
                </div>
              </div>
              <div className="absolute -left-10 top-1/2 hidden lg:block">
                <div className="rounded-full bg-white shadow-lg border border-slate-200 px-4 py-3 flex items-center gap-3 animate-bounce">
                  <ShieldCheck className="w-5 h-5 text-[#007AFF]" />
                  <p className="text-xs font-semibold text-slate-700">99.2% harmful content auto-blocked</p>
                </div>
              </div>
            </div>
          </section>

          {/* Logo strip */}
          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide text-center mb-3">
              Teams that already trust SafeChat AI
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-center text-slate-500">
              {["NovaDesk", "Lumen", "DataForge", "Brightline", "ClearOps", "Relay"].map((name) => (
                <div
                  key={name}
                  className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600 transition duration-200 hover:-translate-y-1 hover:shadow-md"
                >
                  {name}
                </div>
              ))}
            </div>
          </section>

          {/* Highlights */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 flex gap-3 items-start shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#007AFF] to-[#04C99B] flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="text-sm text-slate-600">{item.description}</p>
                </div>
              </div>
            ))}
          </section>

          {/* How it works */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 uppercase tracking-wide">Workflow</p>
                <h2 className="text-2xl font-bold text-slate-900">Launch in days, not months</h2>
              </div>
              <Link
                href="/auth/signup"
                className="hidden sm:inline-flex text-sm font-semibold text-[#007AFF] hover:text-[#0063CC]"
              >
                Start your setup →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: "Connect your workspace",
                  copy: "Plug into auth, import users, and mirror channels in minutes.",
                },
                {
                  title: "Tune policies with AI",
                  copy: "Pick your risk level, set escalation paths, and preview impacts before go-live.",
                },
                {
                  title: "Coach & measure",
                  copy: "Nudge tone, protect PII, and watch sentiment climb with live dashboards.",
                },
              ].map((step, idx) => (
                <div
                  key={step.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#007AFF]">
                    <span className="h-7 w-7 rounded-full bg-[#E8F2FF] text-[#007AFF] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    Step {idx + 1}
                  </div>
                  <p className="font-semibold text-slate-900">{step.title}</p>
                  <p className="text-sm text-slate-600">{step.copy}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Features */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 uppercase tracking-wide">Why teams switch</p>
                <h2 className="text-2xl font-bold text-slate-900">Built for safety, loved for speed</h2>
              </div>
              <Link
                href="/auth/login"
                className="hidden sm:inline-flex text-sm font-semibold text-[#007AFF] hover:text-[#0063CC]"
              >
                See your dashboard →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <feature.icon className="w-6 h-6 text-[#007AFF]" />
                  <p className="font-semibold text-slate-900">{feature.title}</p>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Live snapshot */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase text-slate-500 tracking-wide">Live health</p>
                  <p className="text-xl font-semibold text-slate-900">Moderation overview</p>
                </div>
                <span className="text-xs font-semibold text-[#089F7F] bg-[#E6FBF5] px-3 py-1 rounded-full">
                  +18% sentiment
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Resolved flags", value: "126", trend: "+12" },
                  { label: "Avg. response", value: "41s", trend: "-9s" },
                  { label: "False positives", value: "1.8%", trend: "-0.6%" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">{item.label}</p>
                    <p className="text-xl font-semibold text-slate-900">{item.value}</p>
                    <p className="text-xs font-semibold text-[#089F7F]">{item.trend} vs. last week</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {["Toxicity", "Harassment", "PII"].map((label, idx) => (
                  <div key={label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>{label}</span>
                      <span>{idx === 0 ? "92%" : idx === 1 ? "87%" : "94%"} caught</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          idx === 0 ? "bg-[#007AFF]" : idx === 1 ? "bg-[#04C99B]" : "bg-[#0EA5E9]"
                        }`}
                        style={{ width: idx === 0 ? "92%" : idx === 1 ? "87%" : "94%" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-[#E8F2FF] via-white to-[#E6FBF5] p-6 shadow-lg space-y-5">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-[#007AFF]" />
                <div>
                  <p className="text-xs uppercase text-slate-600 tracking-wide">Coach moments</p>
                  <p className="text-xl font-semibold text-slate-900">AI suggestions your team loves</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  "Detected tense tone · Suggested collaborative reply",
                  "PII risk · Masked phone number automatically",
                  "Escalation prevented · Offered discount template",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
                  >
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {["SOC2-ready", "GDPR", "HIPAA-align", "Role-based access", "Audit trails"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/80 border border-slate-200 text-xs font-semibold text-slate-700 px-3 py-1 shadow-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 uppercase tracking-wide">Stories</p>
                <h2 className="text-2xl font-bold text-slate-900">What teams see after switching</h2>
              </div>
              <Link
                href="/auth/signup"
                className="hidden sm:inline-flex text-sm font-semibold text-[#007AFF] hover:text-[#0063CC]"
              >
                Join them →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testimonials.map((item) => (
                <div
                  key={item.name}
                  className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <p className="text-slate-700">“{item.quote}”</p>
                  <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                  <div className="text-xs text-slate-500">{item.role}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Quickstart cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: "Book a 20-min demo",
                copy: "See your own data in SafeChat AI with a guided tour from a safety specialist.",
                link: "/auth/signup",
              },
              {
                title: "Play in the sandbox",
                copy: "Try SafeChat with sample teams, prebuilt policies, and audit logs turned on.",
                link: "/auth/login",
              },
              {
                title: "Review our trust center",
                copy: "Security docs, DPA templates, and compliance mapping ready for legal review.",
                link: "/auth/login",
              },
            ].map((card) => (
              <Link
                key={card.title}
                href={card.link}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <p className="font-semibold text-slate-900 mb-1">{card.title}</p>
                <p className="text-sm text-slate-600 mb-3">{card.copy}</p>
                <span className="text-sm font-semibold text-[#007AFF]">Open →</span>
              </Link>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}
