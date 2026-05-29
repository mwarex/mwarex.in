"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/site-header";
import { HeroSection } from "@/components/hero-section";
import { FeatureGrid } from "@/components/feature-grid";
import { HowItWorks } from "@/components/how-it-works";
import { PricingSection } from "@/components/pricing-section";
import { ProductPreview } from "@/components/product-preview";
import { Layers, ArrowRight, Github, Twitter, Linkedin, Sparkles, Youtube, Play } from "lucide-react";
import { MWareXLogo } from '@/components/mwarex-logo';
import { LandingPageOnboarding } from "@/components/onboarding";
import { ComparisonSection } from "@/components/comparison-section";
import { CrackedButton } from "@/components/cracked-button";
import { FounderSection } from "@/components/founder-section";

export default function LandingPage() {
  return (
    <div className="min-h-screen text-[#fafafa] font-sans bg-[#111111] relative overflow-hidden w-full selection:bg-[#C8A97E]/30 selection:text-[#ffffff]">
      <div className="relative z-10 w-full">
        <SiteHeader />

        <main className="w-full">
          <HeroSection />

          {/* Trust / Partners Section - Seamless Marquee */}
          <section className="py-24 bg-[#111111] overflow-hidden">
            <div className="max-w-[100vw] text-center">
              <div className="flex items-center justify-center text-[#C8A97E] text-[10px] font-bold tracking-[0.25em] mb-12 uppercase">
                Trusted by the best
              </div>
              <div className="relative flex overflow-x-hidden group">
                <motion.div
                  className="flex space-x-12 md:space-x-24 items-center whitespace-nowrap opacity-60"
                  animate={{
                    x: [0, -1035],
                  }}
                  transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: 20,
                  }}
                >
                  {[...Array(3)].map((_, idx) => (
                    <React.Fragment key={idx}>
                      <span className="text-xl font-bold font-serif text-white/80">Acme.Corp</span>
                      <span className="text-xl font-bold font-mono text-white/80">Vortex</span>
                      <span className="text-xl font-black tracking-[0.1em] text-white/80">YOUTUBE API</span>
                      <span className="text-xl font-serif italic text-white/80">EditorInc</span>
                      <span className="text-xl font-light tracking-[0.2em] text-white/80">STUDIO</span>
                    </React.Fragment>
                  ))}
                </motion.div>
              </div>
            </div>
          </section>

          <HowItWorks />

          <ComparisonSection />

          <FeatureGrid />

          <ProductPreview />

          <PricingSection />

          <FounderSection />

          {/* Enhanced Final CTA Section - Craftsman Style */}
          <section className="py-36 md:py-44 relative overflow-hidden bg-[#111111]">
            {/* Cinematic Background - Pushed to the side */}
            <div className="absolute inset-0 pointer-events-none z-0">
              <div 
                className="absolute inset-0 w-full h-full lg:left-auto lg:right-0 lg:w-[65%]"
                style={{
                  maskImage: 'linear-gradient(to right, transparent 0%, black 60%)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 60%)'
                }}
              >
                <img
                  src="/bg-images/10055.jpg"
                  alt="Feature Background"
                  className="w-full h-full object-cover object-right md:object-center opacity-30 md:opacity-50 mix-blend-screen"
                />
              </div>
              {/* Overlays for smooth integration */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-[#111111] opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-l from-[#111111]/30 via-transparent to-[#111111]" />
              
              {/* Subtle accent glow */}
              <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-[#C8A97E]/[0.03] blur-[150px] rounded-[100%] pointer-events-none -z-10" />
            </div>


            <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-10"
              >
                <Sparkles className="w-4 h-4 text-[#C8A97E] animate-pulse" />
                <span className="text-[#C8A97E] font-semibold text-xs tracking-widest uppercase">Join 10,000+ Creators</span>
              </motion.div>

              {/* Cinematic Text Reveal Header */}
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-light font-serif mb-8 text-[#fafafa] leading-[1.1] tracking-tight">
                <motion.span
                  initial={{ y: 20, opacity: 0, filter: "blur(10px)" }}
                  whileInView={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="block"
                >
                  Ready to scale your
                </motion.span>

                <div className="mt-2">
                  <motion.span
                    initial={{ scale: 0.9, opacity: 0, filter: "blur(10px)" }}
                    whileInView={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="relative inline-block text-[#C8A97E] italic pr-3"
                  >
                    YouTube Empire
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="text-[#fafafa]"
                  >
                    ?
                  </motion.span>
                </div>
              </h2>

              {/* Subtitle - Fade In */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                className="text-white/50 text-base md:text-lg max-w-2xl mx-auto mb-16 font-light"
              >
                The professional operating system for creators and editing teams. Start your free trial today.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5, ease: "backOut" }}
                className="flex flex-col sm:flex-row items-center justify-center gap-6"
              >
                <Link href="/auth/signup">
                  <div className="px-10 md:px-12 py-4 bg-[#C8A97E] text-[#111111] hover:bg-[#D4AF37] rounded-full font-bold text-xs tracking-widest uppercase transition-all shadow-[0_0_30px_rgba(200,169,126,0.3)]">
                    <span className="relative flex items-center gap-3">
                      Get Started Now
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>

                <Link href="/auth/signin">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group px-10 md:px-12 py-4 bg-transparent border border-white/20 hover:border-[#C8A97E]/50 text-white/80 hover:text-white rounded-full font-bold text-xs tracking-widest uppercase transition-all flex items-center gap-3"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Sign in with Google
                  </motion.button>
                </Link>
              </motion.div>

              {/* Trust Indicators - Subtle stagger */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.8 } }
                }}
                className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-10 text-[10px] tracking-[0.1em] uppercase text-white/40 font-medium"
              >
                {[
                  { color: "bg-emerald-500/50", text: "Free forever for individuals" },
                  { color: "bg-blue-500/50", text: "No credit card required" },
                  { color: "bg-violet-500/50", text: "Setup in under 2 minutes" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                    }}
                    className="flex items-center gap-2"
                  >
                    <div className={`w-1.5 h-1.5 ${item.color} rounded-full`} />
                    <span>{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        </main>

        {/* Footer - Craftsman elegant style */}
        <footer className="py-10 border-t border-white/5 bg-[#0a0a0a] relative z-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
              {/* Brand */}
              <div className="col-span-2 md:col-span-2">
                <div className="mb-4">
                  <MWareXLogo showText={true} size="md" />
                </div>
                <p className="text-white/40 text-xs tracking-wider max-w-xs mb-6 leading-relaxed">
                  The secure operating system for modern YouTube creators and editing teams.
                </p>
                <div className="flex gap-4">
                  <SocialLink icon={<Github className="w-4 h-4" />} href="https://github.com/samay-hash" />
                  <SocialLink icon={<Twitter className="w-4 h-4" />} href="https://x.com/ChemistGamer1" />
                  <SocialLink icon={<Youtube className="w-4 h-4" />} href="https://www.youtube.com/@futxsamay" />
                </div>
              </div>

              {/* Product Links */}
              <div>
                <h4 className="font-semibold text-white/90 mb-4 text-xs tracking-[0.2em] uppercase">Product</h4>
                <ul className="space-y-3 text-white/50 text-xs tracking-wide">
                  <FooterLink href="#features">Features</FooterLink>
                  <FooterLink href="#pricing">Pricing</FooterLink>
                  <FooterLink href="#workflow">How It Works</FooterLink>
                </ul>
              </div>

              {/* Resources Links */}
              <div>
                <h4 className="font-semibold text-white/90 mb-4 text-xs tracking-[0.2em] uppercase">Resources</h4>
                <ul className="space-y-3 text-white/50 text-xs tracking-wide">
                  <FooterLink href="#">API Reference</FooterLink>
                  <FooterLink href="/support">Support</FooterLink>
                </ul>
              </div>

              {/* Legal Links */}
              <div>
                <h4 className="font-semibold text-white/90 mb-4 text-xs tracking-[0.2em] uppercase">Legal</h4>
                <ul className="space-y-3 text-white/50 text-xs tracking-wide">
                  <FooterLink href="/privacy-policy">Privacy Policy</FooterLink>
                  <FooterLink href="/terms">Terms of Service</FooterLink>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-10 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                © 2026 MWareX Inc. All rights reserved.
              </p>
              <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-white/30">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C8A97E] animate-pulse shadow-[0_0_8px_#C8A97E]"></span>
                  All systems operational
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function SocialLink({ icon, href }: { icon: React.ReactNode, href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-[#C8A97E] hover:border-[#C8A97E]/30 transition-all">
      {icon}
    </a>
  );
}

function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="hover:text-[#C8A97E] transition-colors">
        {children}
      </Link>
    </li>
  );
}
