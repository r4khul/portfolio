import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SideNav } from "@/components/site/side-nav";
import { MobileNav } from "@/components/site/mobile-nav";
import { BackToTop } from "@/components/site/back-to-top";
import { StripeBar } from "@/components/site/stripe-bar";
import { Footer } from "@/components/site/footer";
import { profile } from "@/data/profile";
import { Analytics } from "@vercel/analytics/next";
import { JsonLd } from "@/components/site/json-ld";
import { CalEmbed } from "@/components/site/cal-embed";
import { AudioProvider } from "@/lib/contexts/audio-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(profile.url),
  title: {
    default: `${profile.name} | Mobile Engineer`,
    template: `%s | ${profile.name}`,
  },
  description:
    "CS engineer focused on mobile development with Flutter, architecture, performance, and shipping reliable software people actually use.",
  keywords: [
    "Flutter Developer",
    "Mobile Engineer",
    "Dart",
    "Rakhul Prakash",
    "r4khul",
    "Software Engineer",
    "Chennai",
    "Android Development",
    "iOS Development",
    "Cross-platform Development",
    "Mobile App Performance",
    "Clean Architecture",
    "BLoC",
    "Riverpod",
    "React.js",
    "TypeScript",
    "Firebase",
    "Supabase",
    "Open Source Contributor",
    "Rajalakshmi Engineering College",
    "Portfolio",
  ],
  authors: [{ name: profile.name, url: profile.url }],
  creator: profile.name,
  publisher: profile.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/images/site/pfp.avif" },
      { url: "/images/site/pfp.avif", sizes: "32x32", type: "image/avif" },
      { url: "/images/site/pfp.avif", sizes: "16x16", type: "image/avif" },
    ],
    shortcut: "/images/site/pfp.avif",
    apple: [
      { url: "/images/site/pfp.avif", sizes: "180x180", type: "image/avif" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: `${profile.name} | Mobile Engineer`,
    description:
      "CS engineer focused on mobile development with Flutter, architecture, performance, and shipping reliable software.",
    url: profile.url,
    siteName: profile.name,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/site/main-banner.avif",
        width: 1200,
        height: 630,
        alt: `${profile.name} | Mobile Engineer`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} | Mobile Engineer`,
    description:
      "CS engineer focused on mobile development with Flutter, architecture, performance, and shipping reliable software.",
    creator: "@r4khul",
    images: ["/images/site/main-banner.avif"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // User can replace this later
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-svh flex-col">
        <JsonLd />
        <AudioProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            {/* Cal.com embed initializer — must live inside ThemeProvider */}
            <CalEmbed />

            {/* Left-gutter side navigation — only visible on xl+ */}
            <SideNav />

            {/* Mobile navigation drawer — only visible below xl */}
            <MobileNav />

            {/* Back to top button */}
            <BackToTop />

            {/* Main content rail */}
            <div className="mx-auto w-full max-w-3xl flex-1 border-x border-edge">
              {/* Stripe banner replaces the old header */}
              <StripeBar />
              {children}
            </div>

            <div className="mx-auto w-full max-w-3xl border-x border-edge">
              <Footer />
            </div>
            <Analytics />
          </ThemeProvider>
        </AudioProvider>
      </body>
    </html>
  );
}
