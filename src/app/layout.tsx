import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { profile } from "@/data/profile";
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
    default: `${profile.name} — Mobile Engineer`,
    template: `%s — ${profile.name}`,
  },
  description:
    "CS engineer focused on mobile development with Flutter — architecture, performance, and shipping reliable software people actually use.",
  keywords: [
    "Flutter",
    "Mobile Engineer",
    "Dart",
    "Rakhul Prakash",
    "r4khul",
    "Software Engineer",
    "Chennai",
    "Android Development",
    "iOS Development",
  ],
  authors: [{ name: profile.name, url: profile.url }],
  icons: {
    icon: "/images/site/pfp.png",
    shortcut: "/images/site/pfp.png",
    apple: "/images/site/pfp.png",
  },
  openGraph: {
    title: `${profile.name} — Mobile Engineer`,
    description:
      "CS engineer focused on mobile development with Flutter — architecture, performance, and shipping reliable software.",
    url: profile.url,
    siteName: profile.name,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/site/pfp-banner.png",
        width: 1200,
        height: 630,
        alt: `${profile.name} — Mobile Engineer`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} — Mobile Engineer`,
    description:
      "CS engineer focused on mobile development with Flutter — architecture, performance, and shipping reliable software.",
    creator: "@r4khul",
    images: ["/images/site/pfp-banner.png"],
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
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-svh flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Header />
          <div className="mx-auto w-full max-w-3xl flex-1 border-x border-edge">
            {children}
          </div>
          <div className="mx-auto w-full max-w-3xl border-x border-edge">
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
