'use client';

import { Brain, Image, Database, CheckCircle2, Sparkles, ArrowRight, Home, Calendar, Heart, Save } from 'lucide-react';
import Link from 'next/link';

export default function HowItWorks() {
  const features = [
    {
      icon: Brain,
      name: "AI Hair Care Analysis",
      description: "Upload a photo of your hair and let Gemini AI analyse your hair health, type, and condition.",
      color: "bg-[#914600]",
      details: "Get personalised routines and product recommendations tailored to your specific hair needs."
    },
    {
      icon: Calendar,
      name: "Style Booking",
      description: "Upload a photo of your desired hairstyle or choose from popular styles.",
      color: "bg-[#AF5500]",
      details: "Get matched with salons that can deliver your look, complete with pricing and availability."
    },
    {
      icon: Save,
      name: "Saved Routines",
      description: "Save your favorite hair care routines and revisit them anytime from your profile.",
      color: "bg-[#CE935F]",
      details: "Track your hair care journey and keep all your personalised recommendations in one place."
    }
  ];

  const hairCareFlow = [
    {
      step: 1,
      title: "Upload Your Hair Photo",
      description: "Take a photo of your hair and upload it to the platform.",
      icon: "📸"
    },
    {
      step: 2,
      title: "Gemini AI Analysis",
      description: "Our AI analyses your hair type, health, porosity, and condition.",
      icon: "🧠"
    },
    {
      step: 3,
      title: "Get Your Routine",
      description: "Receive a personalised hair care routine with product recommendations from our Supabase catalogue.",
      icon: "✨"
    },
    {
      step: 4,
      title: "Save & Track",
      description: "Save your routine to your profile and track your hair care journey.",
      icon: "💾"
    }
  ];

  const bookingFlow = [
    {
      step: 1,
      title: "Choose Your Style",
      description: "Upload a photo of your desired hairstyle or select from popular options.",
      icon: "💇🏾‍♀️"
    },
    {
      step: 2,
      title: "AI Style Detection",
      description: "Gemini AI identifies the style and requirements.",
      icon: "🔍"
    },
    {
      step: 3,
      title: "Salon Matching",
      description: "Get matched with salons from our Supabase database that can deliver your look.",
      icon: "🏪"
    },
    {
      step: 4,
      title: "Book & Pay",
      description: "View pricing, select your preferred salon, and book your appointment.",
      icon: "💳"
    }
  ];

  const techStack = [
    {
      icon: Brain,
      name: "Gemini AI",
      role: "Hair Analysis & Style Detection",
      description: "Analyses hair photos to determine health, type, and styling needs. Also identifies desired hairstyles from photos.",
      color: "bg-[#914600]"
    },
    {
      icon: Database,
      name: "Supabase",
      role: "Product & Salon Database",
      description: "Stores our curated catalogue of hair care products and verified salons with their services and pricing.",
      color: "bg-[#AF5500]"
    },
    {
      icon: Save,
      name: "User Profiles",
      role: "Personalised Experience",
      description: "Save your routines, track your hair care journey, and access your recommendations anytime.",
      color: "bg-[#CE935F]"
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFBF5' }}>
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4" 
            style={{ backgroundColor: 'rgba(206, 147, 95, 0.2)', color: '#914600' }}>
            <Sparkles className="w-4 h-4" />
            AI-Powered African Hair Care
          </div>
          <h1 className="text-5xl font-bold mb-4" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
            How Nywele.ai Works
          </h1>
          <p className="text-xl max-w-3xl mx-auto mb-6" style={{ color: '#914600' }}>
            Your complete AI-powered platform for African hair care and styling
          </p>
          <p className="text-lg max-w-4xl mx-auto" style={{ color: '#AF5500' }}>
            From personalised hair care routines to booking your next hairstyle, Nywele.ai uses advanced AI to help you manage and celebrate your African hair.
          </p>
        </div>

        {/* Features Overview */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
            What We Offer
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.name} className="bg-white/60 backdrop-blur-sm rounded-2xl border-2 shadow-lg p-8 hover:shadow-xl transition-shadow"
                  style={{ borderColor: '#CE935F' }}>
                  <div className={`${feature.color} p-4 rounded-xl w-fit mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
        </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: '#643100' }}>{feature.name}</h3>
                  <p className="mb-3" style={{ color: '#914600' }}>{feature.description}</p>
                  <p className="text-sm" style={{ color: '#AF5500' }}>{feature.details}</p>
            </div>
              );
            })}
          </div>
        </div>

        {/* Tech Stack Cards */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
            Our Technology
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {techStack.map((tech) => {
              const Icon = tech.icon;
              return (
                <div key={tech.name} className="bg-white/60 backdrop-blur-sm rounded-2xl border-2 shadow-lg p-8 hover:shadow-xl transition-shadow"
                  style={{ borderColor: '#CE935F' }}>
                  <div className={`${tech.color} p-3 rounded-xl w-fit mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#643100' }}>{tech.name}</h3>
                  <p className="text-sm font-medium mb-3" style={{ color: '#914600' }}>{tech.role}</p>
                  <p className="text-sm" style={{ color: '#AF5500' }}>{tech.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hair Care Workflow Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-4" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
            Hair Care Analysis Flow
          </h2>
          <p className="text-center mb-12" style={{ color: '#914600' }}>
            Get personalised hair care routines powered by Gemini AI
          </p>
          <div className="grid md:grid-cols-4 gap-6">
            {hairCareFlow.map((item, idx) => (
              <div key={item.step} className="relative">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl border-2 shadow-md p-6 hover:shadow-lg transition-shadow h-full"
                  style={{ borderColor: '#CE935F' }}>
                  <div className="text-4xl mb-4 text-center">{item.icon}</div>
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white"
                    style={{ backgroundColor: '#914600' }}>
                    {item.step}
                  </div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: '#643100' }}>{item.title}</h3>
                  <p className="text-sm" style={{ color: '#AF5500' }}>{item.description}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform translate-x-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6" style={{ color: '#914600' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Booking Workflow Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-4" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
            Style Booking Flow
          </h2>
          <p className="text-center mb-12" style={{ color: '#914600' }}>
            Find the perfect salon to bring your hairstyle vision to life
          </p>
          <div className="grid md:grid-cols-4 gap-6">
            {bookingFlow.map((item, idx) => (
              <div key={item.step} className="relative">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl border-2 shadow-md p-6 hover:shadow-lg transition-shadow h-full"
                  style={{ borderColor: '#CE935F' }}>
                  <div className="text-4xl mb-4 text-center">{item.icon}</div>
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white"
                    style={{ backgroundColor: '#AF5500' }}>
                    {item.step}
                  </div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: '#643100' }}>{item.title}</h3>
                  <p className="text-sm" style={{ color: '#AF5500' }}>{item.description}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform translate-x-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6" style={{ color: '#AF5500' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Key Features Section */}
        <div className="mb-20 bg-white/60 backdrop-blur-sm rounded-3xl border-2 shadow-lg p-10"
          style={{ borderColor: '#CE935F' }}>
          <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              "AI-powered hair health analysis with Gemini",
              "Personalised product recommendations from Supabase catalogue",
              "AI style detection from uploaded photos",
              "Salon matching with real pricing",
              "Save and track your hair care routines",
              "Profile management for personalised experience",
              "Verified salon database",
              "Secure data storage with Supabase"
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#914600' }} />
                <p style={{ color: '#643100' }}>{feature}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Impact Section */}
        <div className="mb-20 rounded-3xl border-2 shadow-lg p-10 text-white"
          style={{ background: 'linear-gradient(135deg, #914600 0%, #AF5500 100%)', borderColor: '#CE935F' }}>
          <h2 className="text-3xl font-bold mb-6 text-center" style={{ fontFamily: 'Caprasimo, serif' }}>
            Why Nywele.ai?
          </h2>
          <p className="text-lg text-center max-w-4xl mx-auto mb-8">
            We're building the complete platform for African hair care—from AI-powered health analysis to finding the perfect salon for your next style. Our mission is to make hair care accessible, personalised, and connected to the community.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-8 text-center">
              <div className="text-4xl font-bold mb-2">2</div>
              <p className="text-sm">Core Features</p>
              <p className="text-xs mt-1 opacity-80">Hair Care + Booking</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-8 text-center">
              <div className="text-4xl font-bold mb-2">AI</div>
              <p className="text-sm">Gemini-Powered</p>
              <p className="text-xs mt-1 opacity-80">Analysis + Detection</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-8 text-center">
              <div className="text-4xl font-bold mb-2">100%</div>
              <p className="text-sm">For African Hair</p>
              <p className="text-xs mt-1 opacity-80">Built with you in mind</p>
            </div>
          </div>
        </div>

        {/* API Integration Section */}
        <div className="mb-20 bg-white/60 backdrop-blur-sm rounded-3xl border-2 shadow-lg p-10"
          style={{ borderColor: '#CE935F' }}>
          <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
            API Integration
          </h2>
          <p className="text-lg text-center max-w-4xl mx-auto mb-8" style={{ color: '#914600' }}>
            Nywele.ai is exportable as an API, allowing your business to plug our AI-powered hair care analysis and recommendations directly into your existing services.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="rounded-xl p-6" style={{ backgroundColor: 'rgba(175, 85, 0, 0.05)' }}>
              <h3 className="font-bold text-lg mb-4" style={{ color: '#643100' }}>
                🔌 Available Endpoints
              </h3>
              <ul className="space-y-2" style={{ color: '#914600' }}>
                <li>• <strong>Hair Analysis API</strong> - Detect hair type, health & styling needs</li>
                <li>• <strong>Routine Generation API</strong> - Personalised care routines with products</li>
                <li>• <strong>Style Detection API</strong> - Identify hairstyles from photos</li>
                <li>• <strong>Product Recommendations API</strong> - AI-curated product matching</li>
              </ul>
            </div>
            
            <div className="rounded-xl p-6" style={{ backgroundColor: 'rgba(175, 85, 0, 0.05)' }}>
              <h3 className="font-bold text-lg mb-4" style={{ color: '#643100' }}>
                🏢 Perfect For
              </h3>
              <ul className="space-y-2" style={{ color: '#914600' }}>
                <li>• Salon booking platforms</li>
                <li>• E-commerce beauty stores</li>
                <li>• Mobile hair care apps</li>
                <li>• Hair product retailers</li>
                <li>• Corporate wellness platforms</li>
              </ul>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-sm mb-4" style={{ color: '#AF5500' }}>
              Interested in integrating Nywele.ai into your platform?
            </p>
            <Link 
              href="/profile"
              className="inline-flex items-center justify-center gap-2 text-white px-8 py-3 rounded-xl font-semibold transition-colors shadow-lg"
              style={{ backgroundColor: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Get API Access
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/hair-care"
              className="inline-flex items-center justify-center gap-2 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg"
              style={{ backgroundColor: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              <Heart className="w-5 h-5" />
              Analyse My Hair
            </Link>
          <Link 
              href="/booking-flow"
              className="inline-flex items-center justify-center gap-2 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg"
              style={{ backgroundColor: '#AF5500', fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
              <Calendar className="w-5 h-5" />
              Book a Style
          </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

