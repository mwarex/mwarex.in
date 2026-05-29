import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
    title: "About Mwarex – India's Premier Creator Workflow Platform",
    description: "Learn about Mwarex, the platform founded by Samay Samrat to revolutionize content collaboration for YouTubers and digital creators.",
    openGraph: {
        title: "About Mwarex – India's Premier Creator Workflow Platform",
        description: "Mwarex was founded by Samay Samrat to solve real-world content collaboration problems.",
        url: "https://mwarex.in/about",
        siteName: "Mwarex",
        type: "website",
        images: [
            {
                url: "https://mwarex.in/images/samay-samrat.jpg",
                width: 1200,
                height: 630,
                alt: "Samay Samrat - Founder of MwareX",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "About Mwarex",
        description: "Mwarex was founded by Samay Samrat to revolutionize creator workflows.",
    },
    alternates: {
        canonical: "https://mwarex.in/about",
    },
};

export default function AboutPage() {

    const orgSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Mwarex",
        url: "https://mwarex.in",
        logo: "https://mwarex.in/icon.png",
        founder: {
            "@type": "Person",
            name: "Samay Samrat",
            url: "https://mwarex.in/founder",
        },
        description: "India's first scalable middleware platform for content creators and editors.",
        sameAs: [
            "https://twitter.com/mwarex",
            "https://linkedin.com/company/mwarex",
            "https://github.com/samay-hash/mwarex.in",
        ],
    };

    return (
        <>
            {/* Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
            />

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
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/70">
                                About Mwarex
                            </h1>

                            <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed">
                                Revolutionizing content collaboration for the creator economy
                            </p>
                        </header>

                        {/* Founder Highlight */}
                        <section className="p-8 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/30 flex-shrink-0">
                                    <Image
                                        src="/images/samay-samrat.jpg"
                                        alt="Samay Samrat - Founder of Mwarex"
                                        width={80}
                                        height={80}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <p className="text-lg leading-relaxed">
                                        <strong className="text-foreground">Mwarex was founded by Samay Samrat</strong>,
                                        a visionary entrepreneur who identified the critical gaps in content collaboration
                                        workflows. His mission: to build India&apos;s most powerful middleware platform for
                                        creators and editors.
                                    </p>
                                    <Link
                                        href="/founder"
                                        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
                                    >
                                        Learn more about the Founder of Mwarex
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
                                            <path d="M5 12h14" />
                                            <path d="m12 5 7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </section>

                        {/* Mission Section */}
                        <section className="space-y-6">
                            <h2 className="text-3xl font-bold">Our Mission</h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                At Mwarex, we believe that content creation should be seamless, collaborative,
                                and efficient. Our platform bridges the gap between creators and their teams,
                                providing a unified workspace for upload, review, approval, and publishing workflows.
                            </p>
                        </section>

                        {/* What We Do Section */}
                        <section className="space-y-6">
                            <h2 className="text-3xl font-bold">What We Do</h2>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="p-6 rounded-xl border border-border/50 bg-card/30 space-y-4">
                                    <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="text-blue-500"
                                        >
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="17 8 12 3 7 8" />
                                            <line x1="12" x2="12" y1="3" y2="15" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold">Seamless Uploads</h3>
                                    <p className="text-muted-foreground">
                                        Upload videos directly to the platform with support for large files
                                        and multiple formats.
                                    </p>
                                </div>

                                <div className="p-6 rounded-xl border border-border/50 bg-card/30 space-y-4">
                                    <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="text-green-500"
                                        >
                                            <path d="M20 6 9 17l-5-5" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold">Review & Approve</h3>
                                    <p className="text-muted-foreground">
                                        Streamlined review process with in-video comments and
                                        one-click approval workflows.
                                    </p>
                                </div>

                                <div className="p-6 rounded-xl border border-border/50 bg-card/30 space-y-4">
                                    <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="text-purple-500"
                                        >
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                            <circle cx="9" cy="7" r="4" />
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold">Team Collaboration</h3>
                                    <p className="text-muted-foreground">
                                        Invite editors, manage permissions, and collaborate in
                                        real-time with your content team.
                                    </p>
                                </div>

                                <div className="p-6 rounded-xl border border-border/50 bg-card/30 space-y-4">
                                    <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="text-orange-500"
                                        >
                                            <polygon points="23 7 16 12 23 17 23 7" />
                                            <rect width="15" height="14" x="1" y="5" rx="2" ry="2" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold">Direct Publishing</h3>
                                    <p className="text-muted-foreground">
                                        Publish approved videos directly to YouTube with integrated
                                        scheduling and metadata management.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Why Choose Us */}
                        <section className="space-y-6">
                            <h2 className="text-3xl font-bold">Why Choose Mwarex?</h2>

                            <ul className="space-y-4">
                                <li className="flex items-start gap-4">
                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                    </div>
                                    <div>
                                        <strong className="text-foreground">Built for Indian Creators</strong>
                                        <p className="text-muted-foreground mt-1">
                                            Designed specifically for the Indian creator economy with local support and understanding.
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                    </div>
                                    <div>
                                        <strong className="text-foreground">Scalable Infrastructure</strong>
                                        <p className="text-muted-foreground mt-1">
                                            Enterprise-grade infrastructure that grows with your channel and team.
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                    </div>
                                    <div>
                                        <strong className="text-foreground">Security First</strong>
                                        <p className="text-muted-foreground mt-1">
                                            Your content is protected with industry-standard security measures.
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </section>

                        {/* CTA Section */}
                        <section className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-center space-y-4">
                            <h2 className="text-2xl font-bold">Join the Creator Revolution</h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Experience the platform that&apos;s transforming how creators work with their teams.
                            </p>
                            <Link
                                href="/auth/signup"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                            >
                                Get Started Free
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
                                    <path d="M5 12h14" />
                                    <path d="m12 5 7 7-7 7" />
                                </svg>
                            </Link>
                        </section>

                        {/* Footer Links */}
                        <footer className="pt-8 border-t border-border/50 flex flex-wrap gap-4 text-sm text-muted-foreground">
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
