import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import RootAppWithIntro from "@/components/RootAppWithIntro";
import { OPENING_GLB_URL } from "@/lib/intro-crossfade";
import "./globals.css";

const bricolage = Bricolage_Grotesque({ 
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-bricolage"
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FFFEE1",
};

export const metadata: Metadata = {
  title: "Nywele.ai - AI-Powered African Hair Care",
  description: "Personalized hair care routines, styling recommendations, and product suggestions for African hair",
  applicationName: "Nywele.ai",
  appleWebApp: {
    capable: true,
    title: "Nywele.ai",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/coil.svg", type: "image/svg+xml" }
    ],
    shortcut: [
      { url: "/coil.svg", type: "image/svg+xml" }
    ],
    apple: [
      { url: "/coil.svg" }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link
          rel="preload"
          href={OPENING_GLB_URL}
          as="fetch"
          crossOrigin="anonymous"
          fetchPriority="high"
        />
      </head>
      <body
        className={`${bricolage.className} min-h-full bg-transparent antialiased`}
      >
        <div className="nywele-cream-grid-surface nywele-grid-backdrop" aria-hidden />
        <div className="nywele-app-content">
          <RootAppWithIntro>{children}</RootAppWithIntro>
        </div>
      </body>
    </html>
  );
}

