import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const bricolage = Bricolage_Grotesque({ 
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-bricolage"
});

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
      <body className={bricolage.className}>
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
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}

