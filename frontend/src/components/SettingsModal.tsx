import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings, Bot, Youtube, Box, CheckCircle2, Shield, User, Loader2, Zap, Brain, Sparkles, Clock, BarChart3, Cpu, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getGoogleAuthUrl } from "@/lib/api";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: 'general' | 'aiConfig' | 'models' | 'integrations';
    userData?: { name?: string; email?: string } | null;
}

export default function SettingsModal({ isOpen, onClose, initialTab = 'general', userData }: SettingsModalProps) {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            onClose();
        }, 1200);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                    className="w-full max-w-5xl h-[85vh] md:h-[600px] bg-background border border-border rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row relative"
                >
                    {/* Sidebar Nav */}
                    <div className="w-full md:w-64 bg-secondary/30 border-r border-border p-4 flex flex-col gap-1 shrink-0 overflow-y-auto">
                        <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground px-3 pt-2 pb-4">
                            Platform Settings
                        </div>
                        
                        <button
                            onClick={() => setActiveTab('general')}
                            className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer", activeTab === 'general' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}
                        >
                            <Settings className="w-4 h-4" />
                            General
                        </button>
                        
                        <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground px-3 pt-6 pb-2">
                            Advanced Intelligence
                        </div>

                        <button
                            onClick={() => setActiveTab('aiConfig')}
                            className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer", activeTab === 'aiConfig' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}
                        >
                            <Bot className="w-4 h-4" />
                            AI Brain Setup
                        </button>

                        <button
                            onClick={() => setActiveTab('models')}
                            className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer", activeTab === 'models' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}
                        >
                            <Box className="w-4 h-4" />
                            AI Models & Engines
                        </button>
                        
                        <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground px-3 pt-6 pb-2">
                            Connections
                        </div>

                        <button
                            onClick={() => setActiveTab('integrations')}
                            className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer", activeTab === 'integrations' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}
                        >
                            <Youtube className="w-4 h-4" />
                            Integrations
                        </button>
                    </div>

                    {/* Content Panel */}
                    <div className="flex-1 flex flex-col relative overflow-hidden bg-background">
                        <div className="flex items-center justify-between p-4 border-b border-border bg-card/50 px-6 shrink-0">
                            <h2 className="text-lg font-semibold capitalize tracking-wide text-foreground">
                                {activeTab === 'aiConfig' ? "AI Brain Settings" : activeTab === 'models' ? "AI Processing Pipeline" : activeTab === 'integrations' ? "Connected Services" : "General"}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-all cursor-pointer bg-secondary/80 border border-border/50"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                            {/* General Tab */}
                            {activeTab === 'general' && (
                                <div className="max-w-xl space-y-8 animate-in fade-in zoom-in-95 duration-300">
                                    <div className="space-y-4">
                                        <h3 className="text-base font-semibold text-foreground flex items-center gap-2"><User className="w-4 h-4 text-primary"/> Account Profile</h3>
                                        <div className="p-4 bg-secondary/30 rounded-xl border border-border">
                                            <p className="text-sm text-foreground">Name: <span className="text-muted-foreground">{userData?.name || 'Creator'}</span></p>
                                            <p className="text-sm text-foreground mt-2">Email: <span className="text-muted-foreground">{userData?.email || 'Not set'}</span></p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-base font-semibold text-foreground flex items-center gap-2"><Shield className="w-4 h-4 text-primary"/> Privacy Preferences</h3>
                                        <label className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg cursor-pointer border border-border/50 hover:bg-secondary/40 transition">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary bg-background" defaultChecked />
                                            <span className="text-sm font-medium">Email Activity Notifications</span>
                                        </label>
                                        <label className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg cursor-pointer border border-border/50 hover:bg-secondary/40 transition">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary bg-background" />
                                            <span className="text-sm font-medium">Anonymous Usage Telemetry</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* AI Brain Setup */}
                            {activeTab === 'aiConfig' && (
                                <div className="max-w-xl space-y-8 animate-in fade-in zoom-in-95 duration-300">
                                    <div>
                                        <h3 className="text-base font-semibold text-foreground mb-1">Pre-Analysis Engine Limits</h3>
                                        <p className="text-xs text-muted-foreground mb-4">Control how aggressively the AI crops silences and parses metadata.</p>
                                        
                                        <div className="space-y-4">
                                            <div className="p-4 border border-border bg-card rounded-xl">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-medium">Silence Marginal Threshold</span>
                                                    <span className="text-xs px-2 py-0.5 rounded-md bg-primary/20 text-primary">0.2s</span>
                                                </div>
                                                <input type="range" min="0" max="100" defaultValue="20" className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary" />
                                            </div>

                                            <label className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border cursor-pointer transition hover:border-primary/50">
                                                <input type="checkbox" defaultChecked className="w-4 h-4 rounded appearance-none checked:bg-primary border border-gray-600 bg-background flex shrink-0" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-foreground">Auto-generate Thumbnail Prompts</p>
                                                    <p className="text-xs text-muted-foreground">Uses LLM context to prepare optimal thumbnail generation.</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-base font-semibold text-foreground mb-1">Creative Memory Lock</h3>
                                        <p className="text-xs text-muted-foreground mb-4">Enable to persist chat instructions across video re-edits.</p>
                                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                            <p className="text-sm text-foreground">Memory Continuity is natively ON. The AI retains memory of all previous video adjustments automatically.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* AI Models & Pipeline */}
                            {activeTab === 'models' && (
                                <div className="max-w-2xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
                                    {/* Pipeline Info */}
                                    <div>
                                        <h3 className="text-base font-semibold text-foreground mb-1">AI Video Processing Pipeline</h3>
                                        <p className="text-sm text-muted-foreground">Your videos are processed through a multi-stage AI pipeline. Each stage uses specialized models for optimal results.</p>
                                    </div>

                                    {/* Pipeline Steps */}
                                    <div className="space-y-3">
                                        <div className="p-4 border border-indigo-500/30 bg-indigo-500/5 rounded-xl">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                                                    <Brain className="w-5 h-5 text-indigo-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-semibold text-foreground text-sm">Stage 1 — Content Analysis</h4>
                                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-md">Gemini 2.5 Flash</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground leading-relaxed">Analyzes video frames, audio patterns, and speech to understand context. Identifies silences, mistakes, stutters, and B-roll segments.</p>
                                                    <div className="flex items-center gap-4 mt-3">
                                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                            <Clock className="w-3 h-3" />
                                                            <span>~30s per minute of video</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-emerald-500">
                                                            <Zap className="w-3 h-3" />
                                                            <span>Active</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-center">
                                            <div className="w-px h-4 bg-border" />
                                        </div>

                                        <div className="p-4 border border-violet-500/30 bg-violet-500/5 rounded-xl">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
                                                    <Sparkles className="w-5 h-5 text-violet-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-semibold text-foreground text-sm">Stage 2 — Intelligent Editing</h4>
                                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded-md">FFMPEG Engine</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground leading-relaxed">Uses AI-generated timestamps to cut, trim, and stitch video segments. Preserves cinematic B-roll and removes unwanted parts.</p>
                                                    <div className="flex items-center gap-4 mt-3">
                                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                            <Cpu className="w-3 h-3" />
                                                            <span>Hardware-accelerated</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-emerald-500">
                                                            <Zap className="w-3 h-3" />
                                                            <span>Active</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-center">
                                            <div className="w-px h-4 bg-border" />
                                        </div>

                                        <div className="p-4 border border-amber-500/30 bg-amber-500/5 rounded-xl">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                                                    <Bot className="w-5 h-5 text-amber-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-semibold text-foreground text-sm">Stage 3 — AI Chat Assistant</h4>
                                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-md">Gemini Pro</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground leading-relaxed">Conversational AI that understands your editing preferences. Ask for re-edits, suggest changes, or get content recommendations in natural language.</p>
                                                    <div className="flex items-center gap-4 mt-3">
                                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                            <BarChart3 className="w-3 h-3" />
                                                            <span>Context-aware memory</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-emerald-500">
                                                            <Zap className="w-3 h-3" />
                                                            <span>Active</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Coming Soon */}
                                    <div className="p-4 border border-border bg-card/50 rounded-xl opacity-60">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                                <Lock className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-semibold text-foreground text-sm">GPT-4 Vision + DALL·E 3</h4>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-500 border border-orange-500/20 px-2 py-0.5 rounded-md">Coming Soon</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground leading-relaxed">Auto-generate thumbnails, titles, and descriptions using GPT-4 Vision analysis with DALL·E 3 creative generation.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Integrations */}
                            {activeTab === 'integrations' && (
                                <div className="max-w-xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
                                    <div className="p-5 border border-border bg-card rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                                                <Youtube className="w-6 h-6 text-red-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-foreground tracking-wide">YouTube Auto-Publish</h4>
                                                <p className="text-xs text-muted-foreground mt-0.5">Push approved AI edits directly to your YouTube channel.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => window.location.href = getGoogleAuthUrl()}
                                            className="px-4 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-500 text-sm font-medium hover:bg-red-500/20 transition-colors"
                                        >
                                            Connect
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer / Apply */}
                        <div className="p-4 border-t border-border bg-card flex justify-end gap-3 shrink-0">
                            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors bg-secondary/50 hover:bg-secondary rounded-lg">
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave} 
                                className="w-32 flex justify-center items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
