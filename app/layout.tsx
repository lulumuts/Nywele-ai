import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}

