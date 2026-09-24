import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { NicheProvider } from "@/components/niche-context";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AI call answering for roofers & restoration teams | Ali Hassan",
    template: "%s | Ali Hassan",
  },
  description:
    "Call the demo and hear it yourself: an assistant that answers your missed calls at night and on weekends, qualifies the job and books the inspection.",
  openGraph: {
    title: "You do the job. We answer the next call.",
    description: "Live demo: after-hours call answering for roofing and water damage companies.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f8fafc",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full" suppressHydrationWarning>
        <NicheProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </NicheProvider>
      </body>
    </html>
  );
}

