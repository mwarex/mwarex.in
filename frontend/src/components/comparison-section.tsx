"use client";

import { motion } from "framer-motion";
import { Check, X, Minus } from "lucide-react";

const competitors = [
  { name: "MWareX", highlight: true },
  { name: "OpusClip" },
  { name: "Descript" },
  { name: "vidIQ" },
  { name: "TubeBuddy" },
  { name: "CapCut" },
];

type FeatureValue = boolean | "partial";

const features: { name: string; values: FeatureValue[] }[] = [
  { name: "AI Auto Clip Extraction", values: [true, true, false, false, false, "partial"] },
  { name: "Whisper Transcription Engine", values: [true, false, true, false, false, false] },
  { name: "One-Pass Automated Edit Pipeline", values: [true, false, false, false, false, false] },
  { name: "Real-Time Viral Trend Analysis", values: [true, false, false, "partial", "partial", false] },
  { name: "AI Script & Hook Generation", values: [true, false, false, false, false, false] },
  { name: "Competitor Intelligence & Takedowns", values: [true, false, false, "partial", "partial", false] },
  { name: "Smart Hashtag & Sponsor Discovery", values: [true, false, false, true, true, false] },
  { name: "Direct YouTube OAuth Publishing", values: [true, false, false, false, "partial", false] },
  { name: "Secure Editor–Creator Workflow", values: [true, false, false, false, false, false] },
  { name: "Open Source & Self-Hostable", values: [true, false, false, false, false, false] },
];

const pricing = [
  { text: "Freemium", highlight: true },
  { text: "From $19/mo" },
  { text: "From $24/mo" },
  { text: "From $7.50/mo" },
  { text: "From $3.99/mo" },
  { text: "Free / $7.99" },
];

function StatusIcon({ value }: { value: FeatureValue }) {
  if (value === true) return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/15">
      <Check className="w-3 h-3 text-emerald-400" />
    </span>
  );
  if (value === "partial") return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/15">
      <Minus className="w-3 h-3 text-amber-400" />
    </span>
  );
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500/10">
      <X className="w-3 h-3 text-red-400/60" />
    </span>
  );
}

export function ComparisonSection() {
  return (
    <section className="py-20 md:py-28 relative bg-[#111111] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src="/bg-images/10087.jpg"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover opacity-[0.06] md:opacity-[0.08]"
        />
        <div className="absolute inset-0 bg-[#111111]/60 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#111111] via-[#111111]/30 to-[#111111] opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#111111] via-transparent to-[#111111] opacity-70" />
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#C8A97E]/[0.02] rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 text-[#C8A97E] text-[10px] font-bold tracking-[0.25em] mb-6 uppercase"
          >
            <span className="w-8 h-[1px] bg-[#C8A97E] opacity-50" />
            Why MWareX
            <span className="w-8 h-[1px] bg-[#C8A97E] opacity-50" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-white tracking-tight mb-4"
          >
            One Platform. <span className="italic text-[#C8A97E]">Zero Compromises.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/40 max-w-xl mx-auto text-sm font-light leading-relaxed"
          >
            Others give you a piece of the puzzle. MWareX is the entire picture.
          </motion.p>
        </div>

        {/* ─── DESKTOP TABLE ─── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="hidden md:block rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden"
        >
          {/* Header Row */}
          <div className="grid grid-cols-7 border-b border-white/[0.06]">
            <div className="px-5 py-4 flex items-center">
              <span className="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">Feature</span>
            </div>
            {competitors.map((c, i) => (
              <div
                key={i}
                className={`px-3 py-4 text-center ${c.highlight ? "bg-gradient-to-b from-[#C8A97E]/10 to-transparent border-b-2 border-[#C8A97E]/40" : ""}`}
              >
                <span className={`text-xs lg:text-sm font-semibold ${c.highlight ? "text-[#C8A97E]" : "text-white/50"}`}>
                  {c.name}
                </span>
                {c.highlight && (
                  <div className="mt-1">
                    <span className="text-[8px] font-bold tracking-[0.12em] uppercase px-1.5 py-0.5 rounded-full bg-[#C8A97E]/15 text-[#C8A97E] border border-[#C8A97E]/20">
                      You Are Here
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Feature Rows */}
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="grid grid-cols-7 border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors group"
            >
              <div className="px-5 py-3 flex items-center">
                <span className="text-[12px] text-white/55 font-light leading-snug group-hover:text-white/75 transition-colors">
                  {feature.name}
                </span>
              </div>
              {feature.values.map((val, vi) => (
                <div key={vi} className={`px-3 py-3 flex items-center justify-center ${vi === 0 ? "bg-[#C8A97E]/[0.03]" : ""}`}>
                  <StatusIcon value={val} />
                </div>
              ))}
            </div>
          ))}

          {/* Pricing Row */}
          <div className="grid grid-cols-7 bg-white/[0.01]">
            <div className="px-5 py-4 flex items-center">
              <span className="text-[10px] font-bold tracking-[0.15em] text-white/30 uppercase">Pricing</span>
            </div>
            {pricing.map((p, i) => (
              <div key={i} className={`px-3 py-4 flex items-center justify-center ${p.highlight ? "bg-[#C8A97E]/[0.03]" : ""}`}>
                <span className={`text-[11px] font-semibold ${p.highlight ? "text-emerald-400" : "text-white/40"}`}>
                  {p.text}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ─── MOBILE CARDS ─── */}
        <div className="md:hidden space-y-3">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.04 }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm px-4 py-3"
            >
              <p className="text-[12px] text-white/60 font-light mb-2.5">{feature.name}</p>
              <div className="grid grid-cols-3 gap-x-3 gap-y-1.5">
                {competitors.map((comp, ci) => (
                  <div key={ci} className="flex items-center gap-1.5">
                    <StatusIcon value={feature.values[ci]} />
                    <span className={`text-[10px] ${comp.highlight ? "text-[#C8A97E] font-semibold" : "text-white/35"}`}>
                      {comp.name}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Mobile Pricing */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-xl border border-[#C8A97E]/20 bg-[#C8A97E]/[0.04] px-4 py-3"
          >
            <p className="text-[10px] font-bold tracking-[0.15em] text-[#C8A97E]/60 uppercase mb-3">💰 Pricing</p>
            <div className="space-y-2">
              {competitors.map((comp, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className={`text-xs ${comp.highlight ? "text-[#C8A97E] font-semibold" : "text-white/45"}`}>
                    {comp.name}
                  </span>
                  <span className={`text-[11px] font-semibold ${pricing[i].highlight ? "text-emerald-400" : "text-white/35"}`}>
                    {pricing[i].text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-5 mt-8 md:mt-10"
        >
          {[
            { icon: <Check className="w-2.5 h-2.5 text-emerald-400" />, bg: "bg-emerald-500/15", label: "Full Support" },
            { icon: <Minus className="w-2.5 h-2.5 text-amber-400" />, bg: "bg-amber-500/15", label: "Partial" },
            { icon: <X className="w-2.5 h-2.5 text-red-400/60" />, bg: "bg-red-500/10", label: "Not Available" },
          ].map((l, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full ${l.bg}`}>{l.icon}</span>
              <span className="text-[10px] text-white/25 font-medium tracking-wide">{l.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
