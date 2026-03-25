"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Mail,
  KeyRound,
  Lock,
  ArrowLeft,
  CheckCircle,
  EyeOff,
  Eye,
} from "lucide-react";
import { authAPI } from "@/lib/api";
import { MWareXLogo } from "@/components/mwarex-logo";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  const [step, setStep] = useState<"email" | "otp" | "reset" | "success">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    setError("");

    try {
      await authAPI.forgotPassword({ email });
      setStep("otp");
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(
        errorObj.response?.data?.message ||
        "Failed to send OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    
    setIsLoading(true);
    setError("");

    try {
      await authAPI.verifyOTP({ email, otp });
      setStep("reset");
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(
        errorObj.response?.data?.message ||
        "Invalid OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    
    setIsLoading(true);
    setError("");

    try {
      await authAPI.resetPassword({ email, otp, newPassword });
      setStep("success");
      setTimeout(() => {
        router.push("/auth/signin");
      }, 3000);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(
        errorObj.response?.data?.message ||
        "Failed to reset password. Please try again."
      );
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex bg-background text-foreground overflow-hidden font-sans">
      {/* Left Side - Space Illustration */}
      <div className="hidden lg:flex w-1/2 bg-transparent relative p-12 overflow-hidden items-center justify-center">
        {/* Cosmic Background */}
        <div className="absolute inset-0">
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
          {mounted && [...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.2, 1] }}
              transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
              className="absolute w-[2px] h-[2px] bg-indigo-400 dark:bg-white rounded-full"
              style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, transform: "translateZ(0)" }}
            />
          ))}
        </div>

        {/* Central Lock Visual */}
        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            animate={{
              boxShadow: [
                "0 0 60px rgba(255,255,255,0.3), 0 0 80px rgba(129,140,248,0.2)",
                "0 0 80px rgba(255,255,255,0.5), 0 0 120px rgba(129,140,248,0.4)",
                "0 0 60px rgba(255,255,255,0.3), 0 0 80px rgba(129,140,248,0.2)",
              ],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-200 via-blue-100 to-white flex items-center justify-center inner-shadow-lg"
          >
            <Lock className="w-12 h-12 text-indigo-500 opacity-80" />
          </motion.div>
        </div>

        {/* App Name Branding */}
        <div className="absolute bottom-12 right-12">
          <MWareXLogo showText={true} size="md" />
        </div>
        <div className="absolute top-12 left-12">
          <p className="text-zinc-500 text-sm font-medium">Account Recovery</p>
          <p className="text-zinc-400 text-xs mt-1">Securely regain access to your workspace</p>
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
          <div className="mb-8">
            <MWareXLogo showText={true} size="md" href="/" />
          </div>

          <Link href="/auth/signin" className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-3 h-3 mr-1" />
            Back to Sign In
          </Link>

          <AnimatePresence mode="wait">
            {step === "email" && (
              <motion.div
                key="step-email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h1 className="text-3xl font-bold text-foreground mb-2">Forgot Password</h1>
                <p className="text-muted-foreground text-sm mb-8">Enter the email address associated with your account and we'll send you an OTP to reset your password.</p>

                <form onSubmit={handleSendOTP} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-secondary border border-border rounded-xl h-12 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-foreground placeholder-muted-foreground"
                        placeholder="name@example.com"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm py-2 px-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      {error}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary/70 text-primary-foreground font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 mt-6 disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset OTP"}
                  </button>
                </form>
              </motion.div>
            )}

            {step === "otp" && (
              <motion.div
                key="step-otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h1 className="text-3xl font-bold text-foreground mb-2">Verify OTP</h1>
                <p className="text-muted-foreground text-sm mb-8">We've sent a 6-digit code to <span className="font-semibold text-foreground">{email}</span>. Please enter it below.</p>

                <form onSubmit={handleVerifyOTP} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">6-Digit Code</label>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\\D/g, '').slice(0, 6))}
                        className="w-full bg-secondary border border-border rounded-xl h-12 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-foreground font-mono tracking-[0.25em] text-lg placeholder-muted-foreground/50"
                        placeholder="------"
                        required
                        maxLength={6}
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm py-2 px-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      {error}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || otp.length < 6}
                    className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary/70 text-primary-foreground font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 mt-6 disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Code"}
                  </button>
                  
                  <div className="text-center mt-4">
                    <button type="button" onClick={handleSendOTP} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                      Didn't receive the code? Resend
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === "reset" && (
              <motion.div
                key="step-reset"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h1 className="text-3xl font-bold text-foreground mb-2">Create New Password</h1>
                <p className="text-muted-foreground text-sm mb-8">Your identity has been verified. You can now securely type your new password.</p>

                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-secondary border border-border rounded-xl h-12 pl-11 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-foreground placeholder-muted-foreground"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm py-2 px-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      {error}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || newPassword.length < 6}
                    className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary/70 text-primary-foreground font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 mt-6 disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save New Password"}
                  </button>
                </form>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                key="step-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-10 text-center"
              >
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Password Reset!</h1>
                <p className="text-muted-foreground text-sm">Your password has been successfully updated. Taking you to the Sign In page...</p>
                <div className="mt-8 flex justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
}
