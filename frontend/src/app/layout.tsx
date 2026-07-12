import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Inter, Playfair_Display, Orbitron, Oswald } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import { SeasonProvider } from "@/contexts/SeasonContext";
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
    creator: "@mwarex",
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
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body
        className={`${GeistSans.className} antialiased bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary`}
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
                <div className="min-h-screen w-full relative bg-[#111111] text-[#fafafa]">
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
