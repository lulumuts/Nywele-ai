'use client';

import { Brain, Image, Database, CheckCircle2, Sparkles, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';

export default function HowItWorks() {
  const techStack = [
    {
      icon: Brain,
      name: "GPT-4o",
      role: "Personalized Recommendations",
      description: "Analyzes your unique hair profile (type, goals, concerns) to generate customized product recommendations and styling advice tailored for African hair.",
      color: "bg-emerald-500",
      integration: "Deep analysis with culturally-aware responses for hair types 1a-4c"
    },
    {
      icon: Image,
      name: "Gemini 2.5 Flash Image",
      role: "Visual Hairstyle Generation",
      description: "Generates photorealistic hairstyle visualizations with 150+ lines of bias-countering prompts specifically designed for accurate African hair representation.",
      color: "bg-blue-500",
      integration: "Advanced prompt engineering ensures authentic texture, volume, and styling accuracy"
    },
    {
      icon: Database,
      name: "Supabase",
      role: "Secure Data Storage",
      description: "Handles user authentication and stores recommendation history so you can revisit your personalized hair journey.",
      color: "bg-orange-500",
      integration: "PostgreSQL database with row-level security for user privacy"
    }
  ];

  const workflow = [
    {
      step: 1,
      title: "Share Your Hair Profile",
      description: "Tell us about your hair type (1a-4c), goals, current style, ethnicity, length, and desired vibe.",
      icon: "👋"
    },
    {
      step: 2,
      title: "GPT-4o Analyzes",
      description: "Our AI examines your unique characteristics and generates personalized recommendations.",
      icon: "🧠"
    },
    {
      step: 3,
      title: "Gemini Creates Visuals",
      description: "See your chosen hairstyle with AI-generated images that respect African hair texture.",
      icon: "🎨"
    },
    {
      step: 4,
      title: "Get Your Results",
      description: "Receive a detailed routine with products, timing, and visual inspiration.",
      icon: "✨"
    }
  ];

  const challenges = [
    {
      problem: "Generic AI models misrepresent African hair textures",
      solution: "Custom bias-countering prompts ensure 4C coils look like 4C, not 3A curls"
    },
    {
      problem: "One-size-fits-all advice doesn't work",
      solution: "We differentiate between protective styles (hide texture) and natural styles (show texture)"
    },
    {
      problem: "Images focus on face instead of hairstyle",
      solution: "Back-view and top-down angles that focus on the hairstyle detail and authenticity"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Multi-AI Architecture
          </div>
          <h1 className="text-5xl font-bold text-[#C87726] mb-4">
            How Nywele.ai Works
          </h1>
          <p className="text-xl text-[#C87726] max-w-2xl mx-auto">
            A sophisticated multi-AI system built specifically for African hair care, 
            combining GPT-4o and Gemini Nano Banana.
          </p>
        </div>

        {/* Tech Stack Cards */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#C87726]">Our Technology Stack</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {techStack.map((tech) => {
              const Icon = tech.icon;
              return (
                <div key={tech.name} className="bg-white/60 backdrop-blur-sm rounded-2xl border-2 border-[#E9A96A] shadow-lg p-8 hover:shadow-xl transition-shadow">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`${tech.color} p-3 rounded-xl`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#C87726]">{tech.name}</h3>
                      <p className="text-sm text-purple-600 font-medium">{tech.role}</p>
                    </div>
                  </div>
                  <p className="text-[#E9A96A] mb-4">{tech.description}</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Integration:</span> {tech.integration}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Workflow Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#C87726]">The Journey</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {workflow.map((item, idx) => (
              <div key={item.step} className="relative">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl border-2 border-[#E9A96A] shadow-md p-6 hover:shadow-lg transition-shadow h-full">
                  <div className="text-4xl mb-4 text-center">{item.icon}</div>
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-[#C87726]">{item.title}</h3>
                  <p className="text-sm text-[#E9A96A]">{item.description}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-purple-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Why This Matters Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-white mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">Why Traditional AI Fails African Hair</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {challenges.map((item, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="mb-3">
                  <p className="font-semibold mb-2">❌ {item.problem}</p>
                  <div className="h-px bg-white/20 my-3"></div>
                  <p className="text-sm text-purple-100">✅ {item.solution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prompt Engineering Highlight */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border-2 border-[#E9A96A] shadow-xl p-12 mb-20 max-h-[80vh] overflow-y-auto">
          <h2 className="text-3xl font-bold mb-6 text-center text-[#C87726]">Prompt Engineering</h2>
          <p className="text-[#E9A96A] text-center mb-8 max-w-3xl mx-auto">
            Our 150+ line prompt generator creates culturally-accurate, bias-countering prompts 
            that differentiate between protective styles (box braids, locs) and natural styles (afros, twist-outs).
          </p>
          <div className="bg-gray-50 rounded-lg p-6 font-mono text-sm text-gray-800 overflow-x-auto">
            <div className="mb-4">
              <span className="text-purple-600 font-bold">Example Input:</span> Bantu Knots, 4C hair, Shoulder-length, Natural Indoor Lighting
            </div>
            <div className="mb-2">
              <span className="text-purple-600 font-bold">Generated Prompt:</span>
            </div>
            <div className="text-xs leading-relaxed">
              "back view of a Black woman with dark, glowing skin showcasing Bantu knots 
              arranged in a neat, symmetrical pattern across the entire scalp with tight, 
              compact coils. The hairstyle is shoulder-length with clear definition and 
              authentic styling. Shot from back/3-4 view angle focusing on the hairstyle 
              detail. soft indoor natural window light, warm tones, intimate comfortable 
              setting. The hairstyle must be clearly visible and authentic to African hair 
              styling. High detail, photorealistic, professional hair photography with minimal 
              face visibility."
            </div>
          </div>
        </div>

        {/* Technical Highlights */}
        <div className="bg-gray-50 rounded-2xl border-2 border-[#E9A96A] p-12 mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center text-[#C87726]">Technical Highlights</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              "Multi-AI orchestration with GPT-4o + Gemini",
              "150+ lines of bias-countering prompt logic",
              "Differentiation between protective and natural styles",
              "Secure authentication with Supabase",
              "Ethnicity, length, and vibe-based image generation",
              "Culturally-specific hair type support (1a-4c)",
              "Responsive Next.js 15 architecture",
              "Real-time fallback to curated images"
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-[#E9A96A]">{feature}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Impact Stats */}
        <div className="text-center mb-20">
          <h2 className="text-3xl font-bold mb-12 text-[#C87726]">Built for Real Impact</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl border-2 border-[#E9A96A] shadow-lg p-8">
              <div className="text-4xl font-bold text-[#C87726] mb-2">2 AI Models</div>
              <p className="text-[#E9A96A]">Working together for accuracy</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl border-2 border-[#E9A96A] shadow-lg p-8">
              <div className="text-4xl font-bold text-[#C87726] mb-2">Type 1a-4c</div>
              <p className="text-[#E9A96A]">All hair textures supported</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl border-2 border-[#E9A96A] shadow-lg p-8">
              <div className="text-4xl font-bold text-[#C87726] mb-2">150+ Lines</div>
              <p className="text-[#E9A96A]">Of prompt engineering logic</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-purple-700 transition-colors shadow-lg"
          >
            Try It Yourself
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

