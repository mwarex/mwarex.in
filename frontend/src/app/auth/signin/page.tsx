"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Eye,
  EyeOff,
  Briefcase,
  PenTool,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { authAPI, warmAndRedirectToGoogle } from "@/lib/api";
import { setToken, setUserRole, setUserData } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { MWareXLogo } from "@/components/mwarex-logo";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [userType, setUserType] = useState<"creator" | "editor" | "admin">("creator");
  const [mounted, setMounted] = useState(false);

  // Recruiter Demo State
  const [showRecruiterModal, setShowRecruiterModal] = useState(false);
  const [recruiterName, setRecruiterName] = useState("");
  const [recruiterViewAs, setRecruiterViewAs] = useState<"creator" | "editor">("creator");
  const [isRecruiterLoading, setIsRecruiterLoading] = useState(false);

  // Google OAuth Warmup State
  const [showGoogleLoadingModal, setShowGoogleLoadingModal] = useState(false);
  const [googleLoadingStatus, setGoogleLoadingStatus] = useState<"warming" | "ready" | "error">("warming");
  const [googleLoadingMessage, setGoogleLoadingMessage] = useState("Preparing secure connection...");

  // Handle Google Sign In with warmup
  const handleGoogleSignIn = () => {
    warmAndRedirectToGoogle(
      // onWarmingUp
      () => {
        setShowGoogleLoadingModal(true);
        setGoogleLoadingStatus("warming");
        setGoogleLoadingMessage("Waking up secure servers...");

        // Update messages periodically
        const messages = [
          "Waking up secure servers...",
          "Establishing encrypted connection...",
          "Preparing authentication...",
          "Almost ready...",
          "Connecting to Google...",
        ];
        let msgIndex = 0;
        const interval = setInterval(() => {
          msgIndex = (msgIndex + 1) % messages.length;
          setGoogleLoadingMessage(messages[msgIndex]);
        }, 3000);

        // Store interval ID to clear later
        (window as any).__googleWarmupInterval = interval;
      },
      // onReady
      () => {
        setGoogleLoadingStatus("ready");
        setGoogleLoadingMessage("Redirecting to Google...");
        if ((window as any).__googleWarmupInterval) {
          clearInterval((window as any).__googleWarmupInterval);
        }
      },
      // onError
      (error) => {
        setGoogleLoadingStatus("error");
        setGoogleLoadingMessage(error);
        if ((window as any).__googleWarmupInterval) {
          clearInterval((window as any).__googleWarmupInterval);
        }
      }
    );
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let response;
      if (userType === "admin") {
        response = await authAPI.adminSignin({ email, password });
      } else {
        response = await authAPI.userSignin({ email, password });
      }
      setToken(response.data.token);

      // Use role from backend response if available, otherwise fall back to selected userType
      const effectiveRole = response.data.role || userType;
      setUserRole(effectiveRole as "creator" | "editor" | "admin");
      setUserData({
        email: response.data.email || email,
        name: response.data.name || "",
        id: response.data.id || "",
      });

      if (effectiveRole === "creator") {
        router.push("/dashboard/creator");
      } else if (effectiveRole === "editor") {
        router.push("/dashboard/editor");
      } else if (effectiveRole === "admin" || userType === "admin") {
        router.push("/dashboard/admin");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message ||
        "Invalid credentials. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Recruiter Demo Login - No credentials needed
  const handleRecruiterDemo = () => {
    if (!recruiterName.trim()) return;

    setIsRecruiterLoading(true);

    // Simulate login for demo purposes
    setTimeout(() => {
      setUserRole(recruiterViewAs);
      setUserData({
        name: recruiterName,
        email: `${recruiterName.toLowerCase().replace(/\s/g, '.')}@recruiter-demo.com`,
        isDemo: true
      });
      // Set a demo token
      setToken("demo-recruiter-token-" + Date.now());

      if (recruiterViewAs === "creator") {
        router.push("/dashboard/creator");
      } else {
        router.push("/dashboard/editor");
      }
      setIsRecruiterLoading(false);
    }, 1000);
  };

  const userTypes = [
    { value: "creator" as const, label: "Creator", icon: Briefcase },
    { value: "editor" as const, label: "Editor", icon: PenTool },
    { value: "admin" as const, label: "Admin", icon: ShieldCheck },
  ];

  return (
    <main className="min-h-screen w-full flex bg-background text-foreground overflow-hidden font-sans">
      {/* Left Side - Star/Space Illustration for Sign In */}
      <div className="hidden lg:flex w-1/2 bg-transparent relative p-12 overflow-hidden items-center justify-center">
        {/* Cosmic Background - Simplified */}
        <div className="absolute inset-0">
          {/* Main Gradient Glow */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ willChange: "transform, opacity", transform: "translateZ(0)" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-indigo-500/30 via-purple-500/20 to-transparent rounded-full blur-[80px]"
          />

          {/* Secondary Purple Glow */}
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            style={{ willChange: "transform, opacity", transform: "translateZ(0)" }}
            className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-radial from-violet-600/30 to-transparent rounded-full blur-[60px]"
          />

          {/* Static Grid Lines */}
          <div className="absolute left-1/4 top-0 w-[1px] h-1/2 bg-gradient-to-b from-transparent via-zinc-700/50 dark:via-zinc-700/50 via-indigo-300/30 to-transparent opacity-40" />
          <div className="absolute left-1/3 bottom-0 w-[1px] h-1/3 bg-gradient-to-t from-transparent via-zinc-700/50 dark:via-zinc-700/50 via-indigo-300/30 to-transparent opacity-30" />
          <div className="absolute right-1/4 top-20 w-[1px] h-1/4 bg-gradient-to-b from-transparent via-zinc-600/50 dark:via-zinc-600/50 via-indigo-300/30 to-transparent opacity-20" />

          {/* Twinkling Stars */}
          {mounted && [...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
              className="absolute w-[2px] h-[2px] bg-indigo-400 dark:bg-white rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                willChange: "opacity", // Optimized stars
                transform: "translateZ(0)"
              }}
            />
          ))}
        </div>

        {/* Central Planet/Orb Visual */}
        <div className="relative z-10">
          <motion.div
            animate={{
              boxShadow: [
                "0 0 60px rgba(255,255,255,0.3), 0 0 80px rgba(129,140,248,0.2)",
                "0 0 80px rgba(255,255,255,0.5), 0 0 120px rgba(129,140,248,0.4)",
                "0 0 60px rgba(255,255,255,0.3), 0 0 80px rgba(129,140,248,0.2)",
              ],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-200 via-blue-100 to-white"
          />

          {/* Orbiting Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 w-full h-full"
          >
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-violet-400 shadow-lg shadow-violet-400/50" />
          </motion.div>

          {/* Secondary Smaller Moon/Orb */}
          <motion.div
            animate={{
              y: [-5, 5, -5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-14 -right-20 w-12 h-12 rounded-full bg-zinc-700 border border-zinc-600 shadow-xl"
          />
        </div>

        {/* App Name Branding */}
        <div className="absolute bottom-12 right-12">
          <MWareXLogo showText={true} size="md" />
        </div>

        {/* Decorative Text */}
        <div className="absolute top-12 left-12">
          <p className="text-zinc-500 text-sm font-medium">Welcome back</p>
          <p className="text-zinc-400 text-xs mt-1">Sign in to continue your journey</p>
        </div>
      </div>

      {/* Right Side - Content Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-[420px] mx-auto w-full"
        >
          {/* Logo */}
          <div className="mb-8">
            <MWareXLogo showText={true} size="md" href="/" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-muted-foreground text-sm mb-8">Sign in to your dashboard to continue.</p>

          {/* User Type Selection */}
          <div className="flex gap-2 mb-8">
            {userTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setUserType(type.value)}
                className={cn(
                  "flex-1 py-3 px-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2",
                  userType === type.value
                    ? "bg-gradient-to-b from-secondary to-muted border-border text-foreground shadow-lg"
                    : "bg-transparent border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground"
                )}
              >
                <type.icon className="w-4 h-4" />
                {type.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl h-12 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-foreground placeholder-muted-foreground"
                placeholder="name@example.com"
                required
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-primary hover:text-primary/80 transition-colors font-medium">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl h-12 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-foreground placeholder-muted-foreground"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm py-2 px-3 bg-red-500/10 border border-red-500/20 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 mt-6"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-4 text-muted-foreground font-medium">or continue with</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full h-12 bg-white dark:bg-secondary hover:bg-gray-50 dark:hover:bg-muted text-foreground text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg mb-4 border border-gray-200 dark:border-border"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {/* Recruiter Demo Access */}
          <button
            onClick={() => setShowRecruiterModal(true)}
            className="w-full h-12 bg-transparent hover:bg-muted/50 border border-dashed border-border hover:border-muted-foreground text-muted-foreground hover:text-foreground text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-3"
          >
            <UserCheck className="w-4 h-4" />
            Recruiter? Try Demo Without Login
          </button>

          <p className="text-muted-foreground text-sm text-center mt-8">
            Don't have an account? <Link href="/auth/signup" className="text-primary hover:text-primary/80 transition-colors font-medium">Create account</Link>
          </p>
        </motion.div>
      </div>

      {/* Recruiter Demo Modal */}
      <AnimatePresence>
        {showRecruiterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRecruiterModal(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-card border border-border rounded-2xl overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-border bg-gradient-to-b from-muted/50 to-transparent">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/30">
                    <UserCheck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Recruiter Demo Access</h2>
                    <p className="text-xs text-muted-foreground">No signup required - explore the platform instantly</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5">
                {/* Name Input */}
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Your Name</label>
                  <input
                    type="text"
                    value={recruiterName}
                    onChange={(e) => setRecruiterName(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-xl h-12 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-foreground placeholder-muted-foreground"
                    placeholder="Enter your name"
                  />
                </div>

                {/* View As Selection */}
                <div className="space-y-3">
                  <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">View Project As</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRecruiterViewAs("creator")}
                      className={cn(
                        "py-4 px-4 rounded-xl border text-sm font-medium transition-all flex flex-col items-center gap-2",
                        recruiterViewAs === "creator"
                          ? "bg-gradient-to-b from-secondary to-muted border-primary/50 text-foreground shadow-lg"
                          : "bg-transparent border-border text-muted-foreground hover:border-muted-foreground"
                      )}
                    >
                      <Briefcase className="w-5 h-5" />
                      <span>Creator View</span>
                      <span className="text-[10px] text-muted-foreground">Manage content & team</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecruiterViewAs("editor")}
                      className={cn(
                        "py-4 px-4 rounded-xl border text-sm font-medium transition-all flex flex-col items-center gap-2",
                        recruiterViewAs === "editor"
                          ? "bg-gradient-to-b from-secondary to-muted border-primary/50 text-foreground shadow-lg"
                          : "bg-transparent border-border text-muted-foreground hover:border-muted-foreground"
                      )}
                    >
                      <PenTool className="w-5 h-5" />
                      <span>Editor View</span>
                      <span className="text-[10px] text-muted-foreground">Upload & submit content</span>
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleRecruiterDemo}
                  disabled={!recruiterName.trim() || isRecruiterLoading}
                  className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                  {isRecruiterLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Start Demo
                      <span className="text-xs opacity-70">→</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-muted-foreground text-center">
                  Demo mode allows full access to explore the platform. Please note that video uploads and YouTube approval are unavailable because the JWT token for API authentication is not issued in this mode.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Google OAuth Loading Modal */}
      {/* Google OAuth Loading Modal - Premium Design */}
      <AnimatePresence>
        {showGoogleLoadingModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Ultra-Dark Backdrop with exquisite blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-[#050505]/90 backdrop-blur-3xl"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0, filter: "blur(10px)" }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="relative z-10 flex flex-col items-center justify-center w-full max-w-sm"
            >
              {/* Central Premium Loader */}
              <div className="relative w-32 h-32 mb-10 flex items-center justify-center">
                {/* Outer Glow Ring - Ambient */}
                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full bg-indigo-500/20 blur-3xl"
                />

                {/* Track Ring (Static Thin) */}
                <div className="absolute inset-0 rounded-full border border-white/5" />

                {/* Spinning Gradient Ring 1 */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-t border-r border-indigo-500/50"
                  style={{ boxShadow: "0 0 15px rgba(99, 102, 241, 0.3)" }}
                />

                {/* Spinning Gradient Ring 2 (Counter-Rotating) */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-2 rounded-full border-b border-l border-purple-500/50"
                />

                {/* Logo Container */}
                <div className="relative z-10 w-16 h-16 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl">
                  {googleLoadingStatus === "ready" ? (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-emerald-400"
                    >
                      <ShieldCheck className="w-8 h-8" />
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                        filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <MWareXLogo showText={false} size="sm" />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Status Typography */}
              <div className="flex flex-col items-center text-center space-y-4">
                <motion.h2
                  key={googleLoadingStatus}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-light tracking-tight text-white"
                >
                  {googleLoadingStatus === "warming" && (
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                      Authenticating
                    </span>
                  )}
                  {googleLoadingStatus === "ready" && (
                    <span className="text-emerald-400 font-medium">Access Granted</span>
                  )}
                  {googleLoadingStatus === "error" && (
                    <span className="text-red-400">Connection Failed</span>
                  )}
                </motion.h2>

                <div className="h-6 overflow-hidden">
                  <motion.p
                    key={googleLoadingMessage}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="text-sm font-mono text-white/40 tracking-wide uppercase"
                  >
                    {googleLoadingMessage}
                  </motion.p>
                </div>
              </div>

              {/* Tech Elements / Decoration */}
              <div className="mt-12 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-full h-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"
                />
              </div>

              <div className="mt-4 flex items-center gap-2 text-[10px] text-white/20 uppercase tracking-[0.2em]">
                <span>Secure</span> • <span>Encrypted</span> • <span>v2.4</span>
              </div>

              {/* Cancel Button (Error State) */}
              {googleLoadingStatus === "error" && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setShowGoogleLoadingModal(false)}
                  className="mt-8 px-6 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 text-xs tracking-wider uppercase rounded transition-all"
                >
                  Close & Retry
                </motion.button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
