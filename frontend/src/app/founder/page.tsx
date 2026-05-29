import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
    title: "Samay Samrat – Founder of Mwarex | YouTuber | Tech & Creator Tools",
    description: "Samay Samrat is an Indian YouTuber and founder of Mwarex. This channel focuses on technology, creators, startups, and digital workflows.",
    openGraph: {
        title: "Samay Samrat – Founder of Mwarex | YouTuber | Tech & Creator Tools",
        description: "Samay Samrat is an Indian YouTuber and founder of Mwarex. This channel focuses on technology, creators, startups, and digital workflows.",
        url: "https://mwarex.in/founder",
        siteName: "Mwarex",
        type: "profile",
        images: [
            {
                url: "https://mwarex.in/images/samay-samrat.jpg",
                width: 1200,
                height: 630,
                alt: "Samay Samrat - Founder of MwareX",
            },
            {
                url: "https://mwarex.in/images/samay-samrat-nvidia.jpg",
                width: 1200,
                height: 630,
                alt: "Samay Samrat at NVIDIA Tech Summit",
            },
            {
                url: "https://mwarex.in/images/samay-samrat-ai-impact-summit.jpg",
                width: 1200,
                height: 630,
                alt: "Samay Samrat at AI Impact Summit 2026",
            },
            {
                url: "https://mwarex.in/images/samay-samrat-ai-summit.jpg",
                width: 1200,
                height: 630,
                alt: "Samay Samrat at AI Summit",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Samay Samrat – Founder of Mwarex | YouTuber | Tech & Creator Tools",
        description: "Samay Samrat is an Indian YouTuber and founder of Mwarex.",
        images: ["https://mwarex.in/images/samay-samrat.jpg", "https://mwarex.in/images/samay-samrat-nvidia.jpg", "https://mwarex.in/images/samay-samrat-ai-impact-summit.jpg"],
    },
    alternates: {
        canonical: "https://mwarex.in/founder",
    },
};

export default function FounderPage() {
    // Schema.org structured data for Person
    const personSchema = {
        "@context": "https://schema.org",
        "@type": "Person",
        name: "Samay Samrat",
        image: [
            "https://mwarex.in/images/samay-samrat.jpg",
            "https://mwarex.in/images/samay-samrat-nvidia.jpg",
            "https://mwarex.in/images/samay-samrat-ai-summit.jpg",
            "https://mwarex.in/images/samay-samrat-ai-impact-summit.jpg"
        ],
        jobTitle: "Founder of Mwarex",
        worksFor: {
            "@type": "Organization",
            name: "Mwarex",
            url: "https://mwarex.in",
        },
        url: "https://mwarex.in/founder",
        sameAs: [
            "https://www.youtube.com/@futxsamay",
            "https://twitter.com/ChemistGamer1",
            "https://github.com/samay-hash",
            "https://www.instagram.com/chemist.gamer"
        ],
    };

    return (
        <>
            {/* Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
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
                    <article className="space-y-8">
                        {/* Hero Section */}
                        <header className="space-y-6">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/70">
                                Samay Samrat
                            </h1>

                            <div className="text-xl sm:text-2xl text-muted-foreground leading-relaxed space-y-4">
                                <p>
                                    Samay Samrat is an Indian entrepreneur and YouTuber.
                                    He is the Founder of Mwarex, a creator workflow platform.
                                </p>
                                <p>
                                    Known for content on technology, creators, and workflow automation.
                                </p>
                            </div>
                        </header>

                        {/* Founder Card */}
                        <div className="relative p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl" />

                            <div className="relative space-y-6">
                                {/* Founder Photo */}
                                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-primary/30 shadow-lg shadow-primary/20">
                                    <Image
                                        src="/images/samay-samrat.jpg"
                                        alt="Samay Samrat - Founder of Mwarex"
                                        width={160}
                                        height={160}
                                        className="w-full h-full object-cover"
                                        priority
                                    />
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-2xl font-semibold">About the Founder</h2>

                                    <p className="text-lg text-muted-foreground leading-relaxed">
                                        <strong className="text-foreground">Samay Samrat</strong> is the founder of Mwarex,
                                        India&apos;s first scalable middleware platform built to simplify workflows for creators
                                        and editors. With a passion for solving real-world problems in the digital content space,
                                        Samay Samrat envisioned a platform that would revolutionize how YouTubers and digital
                                        creators collaborate.
                                    </p>

                                    <p className="text-lg text-muted-foreground leading-relaxed">
                                        <strong className="text-foreground">Mwarex was founded by Samay Samrat</strong> to
                                        solve real-world content collaboration, review, and publishing problems faced by
                                        YouTubers and digital creators. The platform streamlines the entire video production
                                        workflow, from upload to publish.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Vision Section */}
                        <section className="space-y-6">
                            <h2 className="text-3xl font-bold">The Vision Behind Mwarex</h2>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="p-6 rounded-xl border border-border/50 bg-card/30 space-y-3">
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
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
                                            className="text-primary"
                                        >
                                            <path d="M12 20h9" />
                                            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold">The Problem</h3>
                                    <p className="text-muted-foreground">
                                        Content creators struggle with fragmented workflows, scattered feedback,
                                        and inefficient collaboration with their editing teams.
                                    </p>
                                </div>

                                <div className="p-6 rounded-xl border border-border/50 bg-card/30 space-y-3">
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
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
                                            className="text-primary"
                                        >
                                            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold">The Solution</h3>
                                    <p className="text-muted-foreground">
                                        Mwarex provides a unified platform where creators and editors can
                                        seamlessly upload, review, approve, and publish content together.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Journey Section */}
                        <section className="space-y-6">
                            <h2 className="text-3xl font-bold">The Mwarex Journey</h2>

                            <div className="relative pl-8 border-l-2 border-primary/30 space-y-8">
                                <div className="relative">
                                    <div className="absolute -left-[2.45rem] w-4 h-4 rounded-full bg-primary" />
                                    <h3 className="text-xl font-semibold">Ideation</h3>
                                    <p className="text-muted-foreground mt-2">
                                        Samay Samrat identified the pain points in content collaboration after
                                        observing the struggles of YouTubers managing multiple editors.
                                    </p>
                                </div>

                                <div className="relative">
                                    <div className="absolute -left-[2.45rem] w-4 h-4 rounded-full bg-primary/70" />
                                    <h3 className="text-xl font-semibold">Development</h3>
                                    <p className="text-muted-foreground mt-2">
                                        Built from the ground up with modern technologies to ensure scalability,
                                        security, and a seamless user experience.
                                    </p>
                                </div>

                                <div className="relative">
                                    <div className="absolute -left-[2.45rem] w-4 h-4 rounded-full bg-primary/50" />
                                    <h3 className="text-xl font-semibold">Launch</h3>
                                    <p className="text-muted-foreground mt-2">
                                        Mwarex is now live, helping creators and editors work together more
                                        efficiently than ever before.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* CTA Section */}
                        <section className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-center space-y-4">
                            <h2 className="text-2xl font-bold">Ready to Transform Your Workflow?</h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Join the platform built by Samay Samrat to revolutionize content creation workflows.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                                <Link
                                    href="/auth/signup"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors w-full sm:w-auto justify-center"
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
                                <Link
                                    href="/#wall-of-love"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 outline outline-1 outline-border transition-colors w-full sm:w-auto justify-center"
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
                                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                                    </svg>
                                    Leave Feedback
                                </Link>
                            </div>
                        </section>

                        {/* Footer Links */}
                        <footer className="pt-8 border-t border-border/50 flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <Link href="/about" className="hover:text-foreground transition-colors">
                                About Mwarex
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
