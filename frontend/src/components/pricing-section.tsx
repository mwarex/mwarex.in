"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Shield, Loader2, Sparkles, Crown, Zap, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { paymentAPI, RAZORPAY_KEY_ID } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

declare global {
    interface Window {
        Razorpay: any;
    }
}

const pricingPlans = [
    {
        name: "Creator Basic",
        price: "0",
        priceInr: "0",
        planId: "free",
        description: "Perfect for solo creators just starting their delegation journey.",
        features: [
            "1 Linked YouTube Channel",
            "1 Active Editor",
            "5GB Encrypted Storage",
            "Basic Approval Workflow",
            "Standard Support"
        ],
        icon: Shield,
        buttonText: "Start Free",
        popular: false,
    },
    {
        name: "Pro Editor",
        price: "11",
        priceInr: "899",
        planId: "pro",
        description: "The complete toolkit for professional creators and serious editors.",
        features: [
            "Up to 3 YouTube Channels",
            "5 Active Editors",
            "100GB Encrypted Storage",
            "Custom Approval Workflows",
            "Version Control & History",
            "Priority Support (24/7)",
            "Advanced Analytics"
        ],
        icon: Sparkles,
        buttonText: "Upgrade to Pro",
        popular: true,
    },
    {
        name: "Agency",
        price: "899",
        priceInr: "4999",
        planId: "team",
        description: "Built for media companies, networks, and large-scale editing agencies.",
        features: [
            "Unlimited YouTube Channels",
            "Unlimited Editors",
            "1TB+ Encrypted Storage",
            "SSO & Directory Sync",
            "White-label Dashboard",
            "API & Webhook Access",
            "Dedicated Account Manager"
        ],
        icon: Crown,
        buttonText: "Contact Sales",
        popular: false,
    },
];

export function PricingSection() {
    const router = useRouter();
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const loadRazorpayScript = (): Promise<boolean> => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleSelectPlan = async (plan: typeof pricingPlans[0]) => {
        if (plan.planId === "free" || plan.planId === "team") {
            router.push("/auth/signup");
            return;
        }

        if (!isAuthenticated()) {
            toast.error("Please sign in to upgrade your plan");
            router.push("/auth/signin");
            return;
        }

        setLoadingPlan(plan.planId);

        try {
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                toast.error("Failed to load payment gateway. Please try again.");
                setLoadingPlan(null);
                return;
            }

            const { data } = await paymentAPI.createOrder(plan.planId);

            if (!data.success) {
                toast.error(data.message || "Failed to create order");
                setLoadingPlan(null);
                return;
            }

            const options = {
                key: RAZORPAY_KEY_ID,
                amount: data.order.amount,
                currency: data.order.currency,
                name: "MWareX",
                description: `${plan.name} Plan - ${billingCycle} Subscription`,
                order_id: data.order.id,
                handler: async function (response: any) {
                    try {
                        const verifyData = await paymentAPI.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        if (verifyData.data.success) {
                            toast.success(`Welcome to ${plan.name} status!`);
                            router.push("/dashboard");
                        } else {
                            toast.error("Payment verification failed. Contact support.");
                        }
                    } catch (error) {
                        toast.error("Payment verification failed. Please contact support.");
                    }
                    setLoadingPlan(null);
                },
                prefill: { name: "", email: "" },
                theme: { color: "#C8A97E" },
                modal: { ondismiss: () => setLoadingPlan(null) },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();

        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to initiate payment.");
            setLoadingPlan(null);
        }
    };

    return (
        <section className="py-32 relative overflow-hidden bg-[#111111]" id="pricing">
            <div className="absolute inset-0 pointer-events-none z-0">
                <img 
                    src="/bg-images/10100.jpg" 
                    alt="Pricing Background" 
                    className="absolute inset-0 w-full h-full object-cover opacity-15 md:opacity-[0.20]"
                    style={{
                        maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)'
                    }}
                />
                
                {/* Seamless deep edge fades to match surrounding sections */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#111111] via-transparent to-transparent opacity-100 h-1/3" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent opacity-100 top-2/3 h-1/3" />

                <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[600px] bg-[#C8A97E]/[0.03] blur-[150px] rounded-[100%] pointer-events-none" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.015] mix-blend-overlay"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center">

                {/* Header */}
                <div className="text-center mb-20 flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-4 text-[#C8A97E] text-[10px] font-bold tracking-[0.25em] mb-8 uppercase"
                    >
                        Investment
                    </motion.div>

                    <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif text-[#ffffff] font-normal tracking-tight mb-8">
                        Simple, <span className="italic text-[#C8A97E]">Transparent.</span>
                    </h2>

                    <p className="text-white/40 max-w-2xl mx-auto text-[15px] font-light leading-relaxed mb-12">
                        Premium software doesn't need complex pricing. Choose the right tier for your team's size.
                    </p>

                    {/* Highly Elegant Toggle */}
                    <div className="flex items-center gap-6 mt-4 opacity-80 hover:opacity-100 transition-opacity duration-500">
                        <span className={cn("text-[10px] tracking-widest uppercase transition-colors duration-500", billingCycle === "monthly" ? "text-white" : "text-white/30")}>
                            Monthly
                        </span>
                        <button
                            onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
                            className="relative w-12 h-5 rounded-full border border-white/20 bg-[#111111] transition-colors focus:outline-none"
                        >
                            <motion.div
                                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full"
                                animate={{ left: billingCycle === "monthly" ? "4px" : "30px", backgroundColor: billingCycle === "yearly" ? "#C8A97E" : "#ffffff" }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        </button>
                        <span className={cn("text-[10px] tracking-widest uppercase transition-colors duration-500", billingCycle === "yearly" ? "text-[#C8A97E]" : "text-white/30")}>
                            Annually <span className="ml-2 bg-[#C8A97E]/10 text-[#C8A97E] px-2 py-0.5 font-bold tracking-widest">SAVE 20%</span>
                        </span>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl mx-auto relative mb-20">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[400px] bg-[#C8A97E]/5 blur-[100px] rounded-full pointer-events-none" />

                    {pricingPlans.map((plan, index) => {
                        const isLoading = loadingPlan === plan.planId;
                        const displayPrice = billingCycle === "yearly"
                            ? Math.round(parseInt(plan.priceInr) * 0.8)
                            : parseInt(plan.priceInr);

                        return (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                                className={cn(
                                    "relative flex flex-col p-10 bg-[#111111]/80 backdrop-blur-md border border-white/5 transition-all duration-700",
                                    plan.popular
                                        ? "scale-100 lg:scale-[1.05] z-10 border-[#C8A97E]/30 bg-[#151515] shadow-[0_0_50px_rgba(200,169,126,0.05)]"
                                        : "hover:border-white/20 hover:bg-[#151515]"
                                )}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-[1px] -left-[1px] -right-[1px] h-[2px] bg-gradient-to-r from-transparent via-[#C8A97E] to-transparent" />
                                )}

                                <div className="mb-10">
                                    <div className="flex items-center gap-4 mb-6">
                                        <plan.icon className={cn("w-6 h-6", plan.popular ? "text-[#C8A97E]" : "text-white/20")} strokeWidth={1} />
                                        <h3 className="text-lg font-serif tracking-widest uppercase text-white">{plan.name}</h3>
                                    </div>
                                    <p className="text-[13px] text-white/40 leading-[1.8] font-light min-h-[50px]">{plan.description}</p>
                                </div>

                                <div className="mb-10 min-h-[80px]">
                                    {plan.price === "0" ? (
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-5xl font-light tracking-tight text-white">Free</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-5xl font-light tracking-tight text-white">₹{displayPrice}</span>
                                                <span className="text-[10px] text-white/30 uppercase tracking-widest ml-2">/ month</span>
                                            </div>
                                            {plan.popular && (
                                                <p className="text-[10px] text-[#C8A97E] mt-3 uppercase tracking-widest">
                                                    Includes everything in Basic
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>

                                <button
                                    onClick={() => handleSelectPlan(plan)}
                                    disabled={isLoading || loadingPlan !== null}
                                    className={cn(
                                        "w-full py-4 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-500 mb-4 flex items-center justify-center gap-3",
                                        plan.popular
                                            ? "bg-[#C8A97E] text-[#111111] hover:bg-[#D4AF37] shadow-[0_0_20px_rgba(200,169,126,0.2)]"
                                            : "bg-transparent text-white border border-white/20 hover:border-white hover:bg-white/5",
                                        (isLoading || loadingPlan !== null) && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : plan.buttonText}
                                    {!isLoading && <ArrowRight className="w-4 h-4" />}
                                </button>

                                {/* Pay via Crypto - Inner Card Option */}
                                <div className="w-full flex justify-center mb-8">
                                    <Link href="/auth/signup" className="group inline-flex items-center gap-2 transition-all duration-300">
                                        <svg viewBox="0 0 24 24" fill="none" className="w-[14px] h-[14px] text-[#C8A97E] opacity-60 group-hover:opacity-100">
                                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M15 8.5C15 8.5 13.5 8.5 12 8.5C10.5 8.5 9.5 9.5 9.5 11C9.5 12.5 10.5 13.5 12 13.5C13.5 13.5 14.5 14.5 14.5 16C14.5 17.5 13.5 18.5 12 18.5C10.5 18.5 9 18.5 9 18.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M12 6.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M12 18.5V20.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <span className="text-[10px] font-bold tracking-[0.1em] text-white/40 group-hover:text-white uppercase transition-colors">
                                            Pay via Crypto
                                        </span>
                                    </Link>
                                </div>

                                <div className="space-y-4 mt-auto">
                                    {plan.features.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-4">
                                            <div className="mt-1 flex-shrink-0">
                                                <Check className={cn("w-4 h-4", plan.popular ? "text-[#C8A97E]" : "text-white/40")} strokeWidth={2} />
                                            </div>
                                            <span className="text-[13px] text-white/70 font-light leading-relaxed">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Free Promotional Notice */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="mt-8 max-w-2xl mx-auto text-center px-4"
                >
                    <div className="inline-flex items-center justify-center p-[1px] rounded-full bg-gradient-to-r from-transparent via-[#C8A97E]/30 to-transparent mb-5">
                        <div className="px-6 py-2 rounded-full bg-[#111111]/80 backdrop-blur-sm border border-white/5">
                            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] text-[#C8A97E] uppercase">
                                Exclusive Launch Offer
                            </span>
                        </div>
                    </div>
                    <p className="text-[14px] sm:text-[15px] font-light text-white/50 leading-relaxed">
                        Enjoy unrestricted access to <strong className="text-white font-normal">all premium creator tools completely free for the next 12 months.</strong> No payment required. Start building your ultimate workflow today.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
