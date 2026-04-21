import type { Metadata } from "next";
import HowItWorks from "../how-it-works/page";

export const metadata: Metadata = {
  title: "About | Nywele.ai",
  description:
    "Learn how Nywele.ai works, from AI-powered African hair care analysis to routines, salon matching, and API integrations.",
};

export default function AboutPage() {
  return <HowItWorks />;
}
