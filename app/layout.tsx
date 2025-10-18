import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nywele.ai - AI-Powered African Hair Care",
  description: "Personalized hair care routines, styling recommendations, and product suggestions for African hair",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Animated gradient background */}
        <div className="gradient-container">
          <div className="gradient-blob"></div>
          <div className="gradient-blob-2"></div>
          <div className="gradient-blob-3"></div>
          <div className="pulse-overlay"></div>
          <div className="grain-overlay"></div>
        </div>
        
        {/* Main content - positioned above gradient */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}

