"use client";

import React, { useState } from "react";
import Link from "next/link";
import { supportAPI } from "@/lib/api";
import { toast } from "sonner";
import { ArrowRight, Send, Sparkles, AlertCircle } from "lucide-react";

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill out all fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await supportAPI.submitTicket(formData);
      if (response.data?.success) {
        toast.success("Support ticket submitted successfully! We'll be in touch soon.");
        setFormData({ name: "", email: "", message: "" });
      } else {
        toast.error(response.data?.message || "Failed to submit support ticket.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#070707]">
        {/* Premium Background image matching the "Replacing the Fragmented Workflow" section */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <img 
            src="/bg-images/10037.jpg" 
            alt="Background" 
            className="absolute inset-0 w-full h-full object-cover opacity-15 md:opacity-20"
            style={{
              maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 80%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, black 0%, transparent 80%)'
            }}
          />
          <div className="absolute inset-0 bg-[#070707]/60 mix-blend-multiply" />
          {/* Subtle grid pattern matching the main tech-aesthetic */}
          <div className="absolute inset-0 opacity-[0.05]" style={{
            backgroundImage: 'linear-gradient(rgba(200,169,126,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(200,169,126,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070707] via-transparent to-[#070707]"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Back to Home
          </Link>

          {/* Main Content */}
          <article className="space-y-12">
            {/* Hero Section */}
            <header className="space-y-6">
              <div className="flex items-center gap-2 text-[#C8A97E] text-[10px] font-bold tracking-[0.25em] uppercase">
                <Sparkles className="w-4 h-4" />
                Support Center
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/70">
                Support & Contact
              </h1>

              <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed">
                Have a question or facing an issue? Send us a message and our support team will get right back to you.
              </p>
            </header>

            {/* Support Form Container */}
            <div className="relative p-8 sm:p-12 rounded-2xl border border-white/5 bg-[#111111]/40 backdrop-blur-sm overflow-hidden group">
              {/* Decorative Corner Accents */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-[#C8A97E]/0 group-hover:border-[#C8A97E]/30 transition-colors duration-700" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-[#C8A97E]/0 group-hover:border-[#C8A97E]/30 transition-colors duration-700" />

              <div className="relative z-10">
                <h2 className="text-2xl sm:text-3xl font-serif text-[#ffffff] mb-8 tracking-wide">
                  Send a Message
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-xs uppercase tracking-widest text-[#C8A97E] font-semibold">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Samay Samrat"
                        className="w-full bg-[#151515]/60 border border-white/10 rounded-lg px-4 py-3.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C8A97E] focus:ring-1 focus:ring-[#C8A97E]/30 transition-all duration-300"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-xs uppercase tracking-widest text-[#C8A97E] font-semibold">
                        Your Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@example.com"
                        className="w-full bg-[#151515]/60 border border-white/10 rounded-lg px-4 py-3.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C8A97E] focus:ring-1 focus:ring-[#C8A97E]/30 transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-xs uppercase tracking-widest text-[#C8A97E] font-semibold">
                      What can we help you with?
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Describe your inquiry, issue, or feedback in detail..."
                      className="w-full bg-[#151515]/60 border border-white/10 rounded-lg px-4 py-3.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C8A97E] focus:ring-1 focus:ring-[#C8A97E]/30 transition-all duration-300 resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#C8A97E] text-[#111111] font-bold text-xs tracking-widest uppercase hover:bg-[#D4AF37] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_25px_rgba(200,169,126,0.2)]"
                    >
                      {loading ? "Submitting..." : "Send Message"}
                      <Send className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Quick Contacts / Hours */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-xl border border-white/5 bg-[#111111]/20 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#C8A97E]/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#C8A97E]" />
                </div>
                <h3 className="text-lg font-semibold text-white">Guaranteed Response</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We review and respond to all support requests within 24 hours. Enterprise subscribers receive prioritised 2-hour SLAs.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-white/5 bg-[#111111]/20 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#C8A97E]/10 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-[#C8A97E]" />
                </div>
                <h3 className="text-lg font-semibold text-white">System Status</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  All systems are fully operational. Please check back here or contact us directly if you notice any service disruptions.
                </p>
              </div>
            </div>

            {/* Footer Links */}
            <footer className="pt-8 border-t border-white/5 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <Link href="/about" className="hover:text-foreground transition-colors">
                About Mwarex
              </Link>
              <Link href="/founder" className="hover:text-foreground transition-colors">
                Founder of Mwarex
              </Link>
              <Link href="/privacy-policy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </footer>
          </article>
        </div>
      </main>
    </>
  );
}
