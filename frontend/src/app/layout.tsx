import type { Metadata } from "next";
import { Inter, Playfair_Display, Orbitron, Oswald } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import { SeasonProvider } from "@/contexts/SeasonContext";
import { SeasonalBackground, FloatingAmbientSwitcher } from "@/components/seasonal-background";
import { Toaster } from "sonner";
import { HomeStructuredData } from "@/components/home-structured-data";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mwarex.in"),
  title: "MWareX | Streamline Your Video Workflow",
  description: "The ultimate platform for YouTubers and editors to collaborate seamlessly. Upload, review, approve, and publish videos with ease. Founded by Samay Samrat.",
  keywords: ["MwareX", "Samay Samrat", "YouTube collaboration", "video workflow", "creator platform", "editor management", "video production", "content creation", "Samay Samrat founder"],
  authors: [{ name: "Samay Samrat", url: "https://mwarex.in/founder" }],
  creator: "Samay Samrat",
  alternates: {
    canonical: "https://mwarex.in",
  },
  verification: {
    google: "1QUHEi3OUs7QONfHD6jNW2m-k_KxQRFhy61jgkbDAv4",
  },
  openGraph: {
    title: "MWareX | Streamline Your Video Workflow",
    description: "The ultimate platform for YouTubers and editors to collaborate seamlessly. Upload, review, approve, and publish videos with ease.",
    url: "https://mwarex.in",
    siteName: "MWareX",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: "https://mwarex.in/images/samay-samrat.jpg",
        width: 1200,
        height: 630,
        alt: "Samay Samrat - Founder of MWareX",
      },
      {
        url: "https://mwarex.in/images/samay-samrat-nvidia.jpg",
        width: 1200,
        height: 630,
        alt: "Samay Samrat at NVIDIA Tech Summit",
      },
      {
        url: "https://mwarex.in/images/samay-samrat-ai-summit.jpg",
        width: 1200,
        height: 630,
        alt: "Samay Samrat at AI Summit",
      },
      {
        url: "https://mwarex.in/images/samay-samrat-ai-impact-summit.jpg",
        width: 1200,
        height: 630,
        alt: "Samay Samrat at AI Impact Summit 2026",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MWareX | Streamline Your Video Workflow",
    description: "The ultimate platform for YouTubers and editors. Founded by Samay Samrat.",
    images: ["https://mwarex.in/images/samay-samrat.jpg"],
    creator: "@ChemistGamer1",
  },
  icons: {
    icon: [
      { url: '/mwarexlogo.png', type: 'image/png' },
    ],
    apple: [
      { url: '/mwarexlogo.png', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} ${orbitron.variable} ${oswald.variable} antialiased bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary`}
      >
        <HomeStructuredData />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="mwarex-theme-v2"
          disableTransitionOnChange
        >
          <OnboardingProvider>
            <SmoothScrollProvider>
              <SeasonProvider>
                <div className="min-h-screen w-full relative bg-[#070707] text-[#fafafa]">
                  {/* Subtle noise texture over pure dark background */}
                  <div className="absolute inset-0 pointer-events-none opacity-20 filter contrast-[120%] z-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'1.5\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

                  {/* Premium corner net/grid — 4 individual corners fading inward */}
                  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                    {/* Top-left corner */}
                    <div className="absolute top-0 left-0 w-[55%] h-[55%]" style={{
                      backgroundImage: 'linear-gradient(rgba(200,169,126,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(200,169,126,0.07) 1px, transparent 1px)',
                      backgroundSize: '40px 40px',
                      maskImage: 'radial-gradient(ellipse at top left, black 0%, transparent 65%)',
                      WebkitMaskImage: 'radial-gradient(ellipse at top left, black 0%, transparent 65%)'
                    }} />
                    {/* Top-right corner */}
                    <div className="absolute top-0 right-0 w-[55%] h-[55%]" style={{
                      backgroundImage: 'linear-gradient(rgba(200,169,126,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(200,169,126,0.07) 1px, transparent 1px)',
                      backgroundSize: '40px 40px',
                      maskImage: 'radial-gradient(ellipse at top right, black 0%, transparent 65%)',
                      WebkitMaskImage: 'radial-gradient(ellipse at top right, black 0%, transparent 65%)'
                    }} />
                    {/* Bottom-left corner */}
                    <div className="absolute bottom-0 left-0 w-[55%] h-[55%]" style={{
                      backgroundImage: 'linear-gradient(rgba(200,169,126,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(200,169,126,0.07) 1px, transparent 1px)',
                      backgroundSize: '40px 40px',
                      maskImage: 'radial-gradient(ellipse at bottom left, black 0%, transparent 65%)',
                      WebkitMaskImage: 'radial-gradient(ellipse at bottom left, black 0%, transparent 65%)'
                    }} />
                    {/* Bottom-right corner */}
                    <div className="absolute bottom-0 right-0 w-[55%] h-[55%]" style={{
                      backgroundImage: 'linear-gradient(rgba(200,169,126,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(200,169,126,0.07) 1px, transparent 1px)',
                      backgroundSize: '40px 40px',
                      maskImage: 'radial-gradient(ellipse at bottom right, black 0%, transparent 65%)',
                      WebkitMaskImage: 'radial-gradient(ellipse at bottom right, black 0%, transparent 65%)'
                    }} />
                  </div>

                  <SeasonalBackground />
                  <FloatingAmbientSwitcher />
                  <div className="relative z-10 flex flex-col min-h-screen">
                    {children}
                  </div>
                </div>
              </SeasonProvider>
            </SmoothScrollProvider>
          </OnboardingProvider>
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
