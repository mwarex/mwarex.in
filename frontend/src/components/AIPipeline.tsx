"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Search, TrendingUp, Target, Hash, Activity, PlayCircle, Copy, Check, Zap, Flame, Link, PenTool, Swords, DollarSign, Briefcase, Mic
} from "lucide-react";
import { toast } from "sonner";

interface Trend {
  title: string;
  hook: string;
  score: number;
  tags: string[];
}

export default function AIPipeline() {
  const [activeTab, setActiveTab] = useState<"trends" | "competitor" | "hashtags" | "sponsors" | "voiceover">("trends");

  // Trends State
  const [niche, setNiche] = useState("");
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [trends, setTrends] = useState<Trend[] | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  // Script State
  const [scripts, setScripts] = useState<Record<number, string>>({});
  const [generatingScriptIndex, setGeneratingScriptIndex] = useState<number | null>(null);

  // Competitor State
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [loadingCompetitor, setLoadingCompetitor] = useState(false);
  const [competitorData, setCompetitorData] = useState<any | null>(null);

  // Hashtags State
  const [hashtagTopic, setHashtagTopic] = useState("");
  const [loadingHashtags, setLoadingHashtags] = useState(false);
  const [hashtags, setHashtags] = useState<string[] | null>(null);

  // Sponsor State
  const [sponsorNiche, setSponsorNiche] = useState("");
  const [loadingSponsors, setLoadingSponsors] = useState(false);
  const [sponsors, setSponsors] = useState<any[] | null>(null);

  // Voiceover State
  const [voiceoverText, setVoiceoverText] = useState("");
  const [loadingVoiceover, setLoadingVoiceover] = useState(false);
  const [voiceoverAudio, setVoiceoverAudio] = useState<string | null>(null);

  const fetchTrends = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche.trim()) { toast.error("Please enter a niche"); return; }
    setLoadingTrends(true); setTrends(null); setScripts({});
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/v1/ai/trends", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token && { "token": token }) },
        body: JSON.stringify({ niche }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch trends");
      if (data.trends) {
        setTrends(data.trends);
        toast.success("Viral trends fetched successfully!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch AI Trends");
    } finally { setLoadingTrends(false); }
  };

  const generateScript = async (idx: number, title: string, hook: string) => {
    setGeneratingScriptIndex(idx);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/v1/ai/script", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token && { "token": token }) },
        body: JSON.stringify({ title, hook }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to generate script");
      setScripts(prev => ({ ...prev, [idx]: data.script }));
      toast.success("Script generated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate script");
    } finally { setGeneratingScriptIndex(null); }
  };

  const fetchCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!competitorUrl.trim()) { toast.error("Please enter a URL"); return; }
    setLoadingCompetitor(true); setCompetitorData(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/v1/ai/competitor", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token && { "token": token }) },
        body: JSON.stringify({ youtubeUrl: competitorUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to analyze competitor");
      if (data.analysis) {
        setCompetitorData(data.analysis);
        toast.success("Competitor destroyed!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to analyze competitor");
    } finally { setLoadingCompetitor(false); }
  };

  const fetchHashtags = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hashtagTopic.trim()) { toast.error("Please enter a topic"); return; }
    setLoadingHashtags(true); setHashtags(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/v1/ai/hashtags", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token && { "token": token }) },
        body: JSON.stringify({ topic: hashtagTopic }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch hashtags");
      if (data.hashtags) {
        setHashtags(data.hashtags);
        toast.success("Hashtags generated!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch hashtags");
    } finally { setLoadingHashtags(false); }
  };

  const fetchSponsors = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorNiche.trim()) { toast.error("Please enter a niche"); return; }
    setLoadingSponsors(true); setSponsors(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/v1/ai/sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token && { "token": token }) },
        body: JSON.stringify({ niche: sponsorNiche }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to find sponsors");
      if (data.sponsors) {
        setSponsors(data.sponsors);
        toast.success("Found highly targeted sponsors!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to find sponsors");
    } finally { setLoadingSponsors(false); }
  };

  const fetchVoiceover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voiceoverText.trim()) { toast.error("Please enter some text"); return; }
    setLoadingVoiceover(true); setVoiceoverAudio(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/v1/ai/voiceover", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token && { "token": token }) },
        body: JSON.stringify({ text: voiceoverText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to generate voiceover");
      if (data.audioData) {
        setVoiceoverAudio(data.audioData);
        toast.success("Voiceover generated!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to generate voiceover");
    } finally { setLoadingVoiceover(false); }
  };

  const handleCopy = (text: string, idx: number | null = null) => {
    navigator.clipboard.writeText(text);
    if (idx !== null) {
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-24 pb-32">
      {/* Header */}
      <div className="mb-12 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400 mb-8 backdrop-blur-md"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="tracking-widest uppercase font-mono">Real-Time Web Intelligence</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl font-medium text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 tracking-tight mb-6"
        >
          AI Content Strategist Pro
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base md:text-lg text-zinc-400 max-w-2xl font-light leading-relaxed mb-10"
        >
          Stop guessing. Outsmart your competitors with real-time viral data, instant scripts, and aggressive competitor takedowns.
        </motion.p>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center items-center gap-2 p-1.5 bg-zinc-900 border border-white/5 rounded-2xl mx-auto max-w-full">
          <button onClick={() => setActiveTab("trends")} className={`px-4 sm:px-6 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'trends' ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white'}`}>
            <TrendingUp className="w-4 h-4" /> Viral Trends
          </button>
          <button onClick={() => setActiveTab("competitor")} className={`px-4 sm:px-6 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'competitor' ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white'}`}>
            <Swords className="w-4 h-4" /> Competitor Takedown
          </button>
          <button onClick={() => setActiveTab("sponsors")} className={`px-4 sm:px-6 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'sponsors' ? 'bg-[#10b981] text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-zinc-400 hover:text-white'}`}>
            <DollarSign className="w-4 h-4" /> Brand Deals
          </button>
          <button onClick={() => setActiveTab("hashtags")} className={`px-4 sm:px-6 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'hashtags' ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white'}`}>
            <Hash className="w-4 h-4" /> Smart Hashtags
          </button>
          <button onClick={() => setActiveTab("voiceover")} className={`px-4 sm:px-6 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'voiceover' ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]' : 'text-zinc-400 hover:text-white'}`}>
            <Mic className="w-4 h-4" /> AI Voiceover
          </button>
        </div>
      </div>

      {/* TABS CONTENT */}
      <AnimatePresence mode="wait">
        
        {/* 1. VIRAL TRENDS TAB */}
        {activeTab === "trends" && (
          <motion.div key="trends" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="max-w-2xl mx-auto mb-16">
              <form onSubmit={fetchTrends} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition duration-500" />
                <div className="relative flex items-center bg-zinc-950 border border-white/10 rounded-2xl p-2 shadow-2xl">
                  <Search className="w-6 h-6 text-zinc-400 ml-4 shrink-0" />
                  <input type="text" value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g., Fitness, Crypto..." className="flex-1 bg-transparent border-none outline-none text-white px-4 py-4 text-lg placeholder:text-zinc-600" disabled={loadingTrends} />
                  <button type="submit" disabled={loadingTrends || !niche.trim()} className="bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-white transition-colors rounded-xl px-8 py-4 font-medium flex items-center gap-2">
                    {loadingTrends ? <><Activity className="w-5 h-5 animate-pulse" /> Scanning Web...</> : <><Zap className="w-5 h-5" /> Analyze</>}
                  </button>
                </div>
              </form>
            </div>

            {trends && trends.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {trends.map((trend, idx) => (
                  <div key={idx} className="relative group bg-zinc-950/40 backdrop-blur-xl border border-white/5 hover:border-white/20 rounded-2xl p-6 md:p-8 overflow-hidden transition-all duration-300 flex flex-col">
                    <div className="absolute right-0 top-0 w-64 h-64 opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none blur-3xl" style={{ background: `radial-gradient(circle, ${trend.score > 90 ? '#ef4444' : trend.score > 85 ? '#3b82f6' : '#10b981'} 0%, transparent 70%)` }} />
                    <div className="flex flex-col sm:flex-row gap-6 items-start mb-6">
                      <div className="flex flex-col items-center shrink-0">
                        <div className="relative w-20 h-20 rounded-2xl bg-zinc-900 border border-white/10 flex flex-col items-center justify-center shadow-xl">
                          <span className="text-2xl font-bold text-white">{trend.score}</span>
                          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">Score</span>
                          {trend.score >= 90 && <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-500 animate-pulse"><Flame className="w-4 h-4" /></div>}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <h3 className="text-xl font-medium text-white leading-tight">{trend.title}</h3>
                          <button onClick={() => handleCopy(`${trend.title}\n\nHook: ${trend.hook}`, idx)} className="shrink-0 p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors" title="Copy Idea">
                            {copiedIndex === idx ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                        <div className="flex items-start gap-3 bg-primary/5 border border-primary/10 rounded-xl p-4 mb-4">
                          <PlayCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                          <div>
                            <span className="text-xs font-mono text-primary/70 uppercase tracking-wider block mb-1">First 5 Seconds Hook</span>
                            <p className="text-sm text-zinc-300 font-light italic">"{trend.hook}"</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {trend.tags.map((tag, i) => (
                            <span key={i} className="flex items-center gap-1 text-[11px] font-mono font-medium px-3 py-1.5 rounded-full bg-zinc-900 border border-white/5 text-zinc-400"><Hash className="w-3 h-3 text-zinc-600" /> {tag.replace('#', '')}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Script Writer Section */}
                    <div className="mt-auto border-t border-white/5 pt-6 relative z-10">
                      {!scripts[idx] ? (
                        <button onClick={() => generateScript(idx, trend.title, trend.hook)} disabled={generatingScriptIndex === idx} className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/5 hover:border-white/20 text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 cursor-pointer">
                          {generatingScriptIndex === idx ? <><Activity className="w-4 h-4 animate-spin" /> Writing Script...</> : <><PenTool className="w-4 h-4 text-[#8B5CF6]" /> 1-Click Script Writer</>}
                        </button>
                      ) : (
                        <div className="bg-zinc-900 border border-white/10 rounded-xl p-5 relative group/script">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2"><Check className="w-3.5 h-3.5" /> Script Generated</span>
                            <button onClick={() => handleCopy(scripts[idx])} className="text-zinc-500 hover:text-white transition-colors text-xs font-semibold flex items-center gap-1"><Copy className="w-3 h-3" /> Copy</button>
                          </div>
                          <div className="text-sm text-zinc-300 font-light whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar pr-2 leading-relaxed">
                            {scripts[idx]}
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* 2. COMPETITOR TAKEDOWN TAB */}
        {activeTab === "competitor" && (
          <motion.div key="competitor" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="max-w-2xl mx-auto mb-16">
              <form onSubmit={fetchCompetitor} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition duration-500" />
                <div className="relative flex items-center bg-zinc-950 border border-white/10 rounded-2xl p-2 shadow-2xl">
                  <Link className="w-6 h-6 text-zinc-400 ml-4 shrink-0" />
                  <input type="text" value={competitorUrl} onChange={(e) => setCompetitorUrl(e.target.value)} placeholder="Paste competitor YouTube link..." className="flex-1 bg-transparent border-none outline-none text-white px-4 py-4 text-lg placeholder:text-zinc-600" disabled={loadingCompetitor} />
                  <button type="submit" disabled={loadingCompetitor || !competitorUrl.trim()} className="bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-white transition-colors rounded-xl px-8 py-4 font-medium flex items-center gap-2">
                    {loadingCompetitor ? <><Activity className="w-5 h-5 animate-pulse" /> Analyzing...</> : <><Target className="w-5 h-5 text-red-500" /> Destroy</>}
                  </button>
                </div>
              </form>
            </div>

            {competitorData && (
              <div className="max-w-3xl mx-auto bg-zinc-950/40 backdrop-blur-xl border border-red-500/20 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-3xl pointer-events-none rounded-full" />
                <h2 className="text-2xl font-bold text-white mb-2">Competitor Analysis</h2>
                <p className="text-zinc-400 text-sm mb-8 flex items-center gap-2"><Target className="w-4 h-4 text-red-400" /> Target: {competitorData.title}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Check className="w-4 h-4" /> 3 Fatal Flaws</h3>
                    <ul className="space-y-3">
                      {competitorData.weaknesses.map((w: string, i: number) => (
                        <li key={i} className="text-zinc-300 text-sm flex items-start gap-3"><span className="text-red-500 font-bold opacity-50">0{i+1}</span> {w}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Zap className="w-4 h-4" /> How To Beat Them</h3>
                    <p className="text-zinc-300 text-sm leading-relaxed">{competitorData.strategy}</p>
                  </div>
                </div>

                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 relative z-10">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Alternative Viral Titles</h3>
                  <div className="space-y-2">
                    {competitorData.betterTitles.map((t: string, i: number) => (
                      <div key={i} className="p-3 bg-black/40 border border-white/5 rounded-xl text-zinc-300 text-sm flex justify-between items-center group">
                        {t}
                        <button onClick={() => handleCopy(t)} className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-white transition-all cursor-pointer"><Copy className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* 3. SPONSOR FINDER TAB */}
        {activeTab === "sponsors" && (
          <motion.div key="sponsors" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="max-w-2xl mx-auto mb-16">
              <form onSubmit={fetchSponsors} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition duration-500" />
                <div className="relative flex items-center bg-zinc-950 border border-white/10 rounded-2xl p-2 shadow-2xl">
                  <Briefcase className="w-6 h-6 text-zinc-400 ml-4 shrink-0" />
                  <input type="text" value={sponsorNiche} onChange={(e) => setSponsorNiche(e.target.value)} placeholder="Your Niche (e.g. AI, Crypto, Fitness)..." className="flex-1 bg-transparent border-none outline-none text-white px-4 py-4 text-lg placeholder:text-zinc-600" disabled={loadingSponsors} />
                  <button type="submit" disabled={loadingSponsors || !sponsorNiche.trim()} className="bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-colors rounded-xl px-8 py-4 font-medium flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    {loadingSponsors ? <><Activity className="w-5 h-5 animate-pulse" /> Scanning News...</> : <><DollarSign className="w-5 h-5" /> Find Sponsors</>}
                  </button>
                </div>
              </form>
            </div>

            {sponsors && sponsors.length > 0 && (
              <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
                {sponsors.map((sponsor, idx) => (
                  <div key={idx} className="bg-zinc-950/40 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row gap-6">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />
                    
                    <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-white/5 pb-6 md:pb-0 md:pr-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                          <Briefcase className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">{sponsor.companyName}</h3>
                      </div>
                      <div className="bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/10">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-2">Why target them?</span>
                        <p className="text-sm text-zinc-300 leading-relaxed">{sponsor.reason}</p>
                      </div>
                    </div>

                    <div className="w-full md:w-2/3 flex flex-col">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-white uppercase tracking-widest">AI Cold Email Pitch</span>
                        <button onClick={() => handleCopy(sponsor.coldEmail)} className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"><Copy className="w-3 h-3" /> Copy Pitch</button>
                      </div>
                      <div className="bg-zinc-900 border border-white/5 rounded-xl p-4 text-sm text-zinc-300 font-light whitespace-pre-wrap flex-1 custom-scrollbar overflow-y-auto max-h-48 leading-relaxed">
                        {sponsor.coldEmail}
                      </div>
                      <button onClick={() => handleCopy(sponsor.coldEmail)} className="w-full mt-4 py-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold transition-all">
                        Click to Copy Email
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* 4. SMART HASHTAGS TAB */}
        {activeTab === "hashtags" && (
          <motion.div key="hashtags" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="max-w-2xl mx-auto mb-16">
              <form onSubmit={fetchHashtags} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition duration-500" />
                <div className="relative flex items-center bg-zinc-950 border border-white/10 rounded-2xl p-2 shadow-2xl">
                  <Hash className="w-6 h-6 text-zinc-400 ml-4 shrink-0" />
                  <input type="text" value={hashtagTopic} onChange={(e) => setHashtagTopic(e.target.value)} placeholder="e.g., Tech review..." className="flex-1 bg-transparent border-none outline-none text-white px-4 py-4 text-lg placeholder:text-zinc-600" disabled={loadingHashtags} />
                  <button type="submit" disabled={loadingHashtags || !hashtagTopic.trim()} className="bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-white transition-colors rounded-xl px-8 py-4 font-medium flex items-center gap-2">
                    {loadingHashtags ? <><Activity className="w-5 h-5 animate-pulse" /> Generating...</> : <><Sparkles className="w-5 h-5" /> Generate Tags</>}
                  </button>
                </div>
              </form>
            </div>

            {hashtags && hashtags.length > 0 && (
              <div className="max-w-3xl mx-auto bg-zinc-950/40 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-8 relative overflow-hidden text-center">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />
                <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Viral Hashtags</h2>
                <p className="text-zinc-400 text-sm mb-10 relative z-10">Optimized for maximum reach on YouTube Shorts and Instagram Reels.</p>
                
                <div className="flex flex-wrap justify-center gap-3 mb-10 relative z-10">
                  {hashtags.map((tag, i) => (
                    <span key={i} className="px-4 py-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 font-medium text-sm hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-colors cursor-pointer" onClick={() => handleCopy(tag)}>
                      {tag.startsWith('#') ? tag : `#${tag}`}
                    </span>
                  ))}
                </div>

                <button onClick={() => handleCopy(hashtags.join(' '))} className="mx-auto px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] relative z-10 cursor-pointer">
                  <Copy className="w-4 h-4" /> Copy All Hashtags
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* 5. AI VOICEOVER TAB */}
        {activeTab === "voiceover" && (
          <motion.div key="voiceover" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="max-w-3xl mx-auto mb-16">
              <form onSubmit={fetchVoiceover} className="relative group flex flex-col gap-4">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition duration-500" />
                <div className="relative bg-zinc-950 border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col">
                  <div className="flex items-center gap-2 mb-3 px-2 text-zinc-400">
                    <Mic className="w-5 h-5" />
                    <span className="text-sm font-medium">Script to Audio</span>
                  </div>
                  <textarea 
                    value={voiceoverText} 
                    onChange={(e) => setVoiceoverText(e.target.value)} 
                    placeholder="Paste your video script here to generate a realistic AI voiceover..." 
                    className="w-full h-40 bg-transparent border-none outline-none text-white px-2 py-2 text-base placeholder:text-zinc-600 resize-none custom-scrollbar" 
                    disabled={loadingVoiceover} 
                  />
                  <div className="flex justify-between items-center mt-4 border-t border-white/5 pt-4">
                    <p className="text-xs text-zinc-500 px-2 flex items-center gap-2"><Check className="w-3 h-3" /> Powered by ElevenLabs</p>
                    <button type="submit" disabled={loadingVoiceover || !voiceoverText.trim()} className="bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:hover:bg-purple-600 transition-colors rounded-xl px-8 py-3 font-medium flex items-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                      {loadingVoiceover ? <><Activity className="w-4 h-4 animate-pulse" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Audio</>}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {voiceoverAudio && (
              <div className="max-w-2xl mx-auto bg-zinc-950/40 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-8 relative overflow-hidden text-center flex flex-col items-center">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-500/10 blur-3xl pointer-events-none rounded-full" />
                <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-6 border border-purple-500/30 relative z-10">
                  <Mic className="w-8 h-8 text-purple-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2 relative z-10">Voiceover Ready</h2>
                <p className="text-zinc-400 text-sm mb-8 relative z-10">Your realistic AI voiceover has been generated.</p>
                
                <div className="w-full relative z-10">
                  <audio controls src={voiceoverAudio} className="w-full rounded-xl" autoPlay />
                </div>
                <p className="text-xs text-zinc-500 mt-4">Click the 3 dots on the player to download the MP3.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
